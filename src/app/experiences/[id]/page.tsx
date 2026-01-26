

'use client';

import { useState, useEffect, forwardRef } from "react";
import Image from "next/image";
import { format } from "date-fns";
import type { Experience, Host, Review, User, Coupon, Booking } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, Users, MapPin, Utensils, Home, Wind, Accessibility, Loader2, AlertTriangle, Award, Trophy, Tag, CheckCircle, Calendar as CalendarIcon, Baby, ArrowUpFromLine, AirVent, Wifi, Car, Bus, Gift, Zap } from "lucide-react";
import { countries, suburbs, localAreas } from "@/lib/location-data";
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, query, where, limit, runTransaction, getDoc, serverTimestamp, increment } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WishlistButton } from "@/components/wishlist-button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExperienceMap } from "@/components/experience-map";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function ReviewItem({ review }: { review: Review }) {
  const firestore = useFirestore();
  const authorRef = useMemoFirebase(
    () => (firestore && review.guestId ? doc(firestore, 'users', review.guestId) : null),
    [firestore, review.guestId]
  );
  const { data: author, isLoading } = useDoc<User>(authorRef);

  if (isLoading || !author) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  const authorImage = PlaceHolderImages.find(p => p.id === author.profilePhotoId);
  
  return (
    <div>
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {authorImage ? (
              <AvatarImage src={authorImage.imageUrl} alt={author.fullName} data-ai-hint={authorImage.imageHint} />
          ) : null}
            <AvatarFallback>{author.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{author.fullName}</p>
          <p className="text-sm text-muted-foreground">{review.createdAt?.toDate ? format(review.createdAt.toDate(), 'PP') : ''}</p>
        </div>
      </div>
      <p className="mt-3 text-muted-foreground">{review.comment}</p>
    </div>
  );
}


export default function ExperienceDetailPage() {
  const params = useParams();
  const experienceId = params.id as string;

  const [date, setDate] = useState<Date | undefined>();
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [isGifting, setIsGifting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const experienceRef = useMemoFirebase(
    () => (firestore && experienceId ? doc(firestore, "experiences", experienceId) : null),
    [firestore, experienceId]
  );
  const { data: experience, isLoading: isExperienceLoading } = useDoc<Experience>(experienceRef);
  
  const hostRef = useMemoFirebase(
    () => (firestore && experience?.userId && experience?.hostId ? doc(firestore, 'users', experience.userId, 'hosts', experience.hostId) : null),
    [firestore, experience?.userId, experience?.hostId]
  );
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

  const reviewsQuery = useMemoFirebase(
    () => (firestore && experienceId ? query(collection(firestore, "reviews"), where("experienceId", "==", experienceId), limit(2)) : null),
    [firestore, experienceId]
  );
  const { data: reviews, isLoading: areReviewsLoading } = useCollection<Review>(reviewsQuery);
  
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
        setCouponError("Please enter a coupon code.");
        return;
    }
    if (!firestore) return;

    setCouponError('');
    setDiscountAmount(0);
    setAppliedCoupon(null);

    const couponRef = doc(firestore, 'coupons', couponCode.trim());
    try {
        const couponSnap = await getDoc(couponRef);
        if (!couponSnap.exists()) {
            setCouponError("This coupon code is not valid.");
            return;
        }

        const coupon = { id: couponSnap.id, ...couponSnap.data() } as Coupon;
        const basePrice = experience!.pricing.pricePerGuest * numberOfGuests;

        // Validate coupon
        if (!coupon.isActive) {
            setCouponError("This coupon is no longer active."); return;
        }
        if (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) {
            setCouponError("This coupon has expired."); return;
        }
        if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
            setCouponError("This coupon has reached its usage limit."); return;
        }
        if (coupon.minSpend && basePrice < coupon.minSpend) {
            setCouponError(`You must spend at least $${coupon.minSpend} to use this coupon.`); return;
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'fixed') {
            discount = coupon.discountValue;
        } else if (coupon.discountType === 'percentage') {
            discount = basePrice * (coupon.discountValue / 100);
        }

        setDiscountAmount(discount);
        setAppliedCoupon(coupon);
        toast({ title: "Coupon Applied!", description: `You saved $${discount.toFixed(2)}.` });

    } catch (error) {
        setCouponError("Could not validate coupon. Please try again.");
    }
  };


  const handleBooking = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please log in', description: 'You must be logged in to book an experience.' });
      router.push(`/login?redirect=/experiences/${experienceId}`);
      return;
    }

    if (experience && user.uid === experience.userId) {
        toast({
            variant: "destructive",
            title: "Action Not Allowed",
            description: "You cannot book your own experience.",
        });
        return;
    }

    if (!date) {
      toast({ variant: 'destructive', title: 'No date selected', description: 'Please select a date for your experience.' });
      return;
    }
    setIsBooking(true);
    try {
      await runTransaction(firestore, async (transaction) => {
        const basePrice = experience!.pricing.pricePerGuest * numberOfGuests;
        
        // Re-validate coupon inside transaction to prevent race conditions
        if (appliedCoupon) {
          const couponRef = doc(firestore, 'coupons', appliedCoupon.id);
          const couponSnap = await transaction.get(couponRef);
          if (!couponSnap.exists()) throw new Error("Coupon no longer exists.");
          
          const coupon = { id: couponSnap.id, ...couponSnap.data() } as Coupon;
          if (!coupon.isActive || (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit)) {
            // Coupon became invalid between applying and booking, proceed without discount
            toast({ variant: 'destructive', title: 'Coupon Invalid', description: `Coupon "${appliedCoupon.id}" could not be applied.` });
          } else {
            // Increment usage count
            transaction.update(couponRef, { timesUsed: increment(1) });
          }
        }
        
        const newBookingRef = doc(collection(firestore, 'bookings'));
        
        const bookingData: Partial<Booking> = {
          guestId: user.uid,
          experienceId: experience!.id,
          experienceTitle: experience!.title,
          hostId: experience!.hostId,
          hostName: host!.name,
          bookingDate: date,
          numberOfGuests: numberOfGuests,
          totalPrice: basePrice - discountAmount,
          status: experience?.instantBook ? 'Confirmed' : 'Pending',
          createdAt: serverTimestamp(),
        };

        if (appliedCoupon) {
            bookingData.couponId = appliedCoupon.id;
        }

        if (discountAmount > 0) {
            bookingData.discountAmount = discountAmount;
        }

        transaction.set(newBookingRef, bookingData);
      });

      toast({
        title: experience?.instantBook ? 'Booking Confirmed!' : 'Booking Requested!',
        description: experience?.instantBook
            ? `Your booking for "${experience!.title}" is confirmed. Enjoy your experience!`
            : `Your request for "${experience!.title}" has been sent to the host. You'll be notified upon confirmation.`,
      });
      setDate(undefined);
      setNumberOfGuests(1);
      setCouponCode('');
      setAppliedCoupon(null);
      setDiscountAmount(0);

    } catch (error: any) {
      console.error('Booking failed:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: error.message || 'Could not complete your booking request. Please try again.',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleGiftBooking = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please log in', description: 'You must be logged in to gift an experience.' });
      router.push(`/login?redirect=/experiences/${experienceId}`);
      return;
    }

    if (experience && user.uid === experience.userId) {
        toast({
            variant: "destructive",
            title: "Action Not Allowed",
            description: "You cannot gift your own experience.",
        });
        return;
    }

    if (!date) {
      toast({ variant: 'destructive', title: 'No date selected', description: 'Please select a date for the gift.' });
      return;
    }

    setIsGifting(true);
    try {
      await runTransaction(firestore, async (transaction) => {
        const basePrice = experience!.pricing.pricePerGuest * numberOfGuests;
        
        if (appliedCoupon) {
          const couponRef = doc(firestore, 'coupons', appliedCoupon.id);
          const couponSnap = await transaction.get(couponRef);
          if (!couponSnap.exists()) throw new Error("Coupon no longer exists.");
          
          const coupon = { id: couponSnap.id, ...couponSnap.data() } as Coupon;
          if (!coupon.isActive || (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit)) {
            toast({ variant: 'destructive', title: 'Coupon Invalid', description: `Coupon "${appliedCoupon.id}" could not be applied.` });
          } else {
            transaction.update(couponRef, { timesUsed: increment(1) });
          }
        }
        
        const newBookingRef = doc(collection(firestore, 'bookings'));
        
        const bookingData: Partial<Booking> = {
          guestId: user.uid,
          experienceId: experience!.id,
          experienceTitle: experience!.title,
          hostId: experience!.hostId,
          hostName: host!.name,
          bookingDate: date,
          numberOfGuests: numberOfGuests,
          totalPrice: basePrice - discountAmount,
          status: 'Confirmed', // Instant booking for gifts
          isGift: true,
          createdAt: serverTimestamp(),
        };

        if (appliedCoupon) {
            bookingData.couponId = appliedCoupon.id;
        }

        if (discountAmount > 0) {
            bookingData.discountAmount = discountAmount;
        }

        transaction.set(newBookingRef, bookingData);
      });

      toast({
        title: 'Gift Purchased!',
        description: `You've successfully booked "${experience!.title}" as a gift. You can now share it with your friend.`,
      });
      setDate(undefined);
      setNumberOfGuests(1);
      setCouponCode('');
      setAppliedCoupon(null);
      setDiscountAmount(0);

    } catch (error: any) {
      console.error('Gifting failed:', error);
      toast({
        variant: 'destructive',
        title: 'Gifting Failed',
        description: error.message || 'Could not complete your gift purchase. Please try again.',
      });
    } finally {
      setIsGifting(false);
    }
  };

  const filterDate = (day: Date): boolean => {
    // Return false for disabled days, true for enabled
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    if (day < today) {
      return false;
    }

    if (experience) {
        // Check against weekly availability
        if (experience.availability.days && experience.availability.days.length > 0) {
            const dayOfWeek = format(day, 'EEEE');
            if (!experience.availability.days.includes(dayOfWeek)) {
                return false;
            }
        }
    }
    
    // Check against specific blocked dates by the host
    if (host?.blockedDates) {
      const dateString = format(day, 'yyyy-MM-dd');
      if (host.blockedDates.includes(dateString)) {
        return false;
      }
    }

    return true;
  };


  if (isExperienceLoading || isHostLoading) {
     return (
       <div className="py-8 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-96 w-full rounded-lg" />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="lg:col-span-1">
                <Skeleton className="h-72 w-full" />
            </div>
        </div>
      </div>
    );
  }

  if (!experience || !host) {
     return (
        <div className="py-20 text-center">
            <h1 className="text-2xl font-bold">Experience not found</h1>
            <p className="text-muted-foreground">The experience you are looking for does not exist or the host is not available.</p>
        </div>
    );
  }


  const mainImage = PlaceHolderImages.find(p => p.id === experience.photos.mainImageId);
  const hostAvatar = PlaceHolderImages.find(p => p.id === host.profilePhotoId);
  
  const countryName = countries.find(c => c.id === experience.location.country)?.name || experience.location.country;
  const suburbName = suburbs.find(s => s.id === experience.location.suburb)?.name || experience.location.suburb;
  const localAreaName = localAreas.find(l => l.id === experience.location.localArea)?.name || experience.location.localArea;
  const durationHours = Math.round(experience.durationMinutes / 60 * 10) / 10;
  const basePrice = experience.pricing.pricePerGuest * numberOfGuests;
  const totalPrice = basePrice - discountAmount;

  const DatePickerCustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: React.MouseEventHandler<HTMLButtonElement> }>(
    ({ value, onClick }, ref) => (
      <Button
        variant={"outline"}
        className={cn("w-full justify-start text-left font-normal h-10", !value && "text-muted-foreground")}
        onClick={onClick}
        ref={ref}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value || <span>Pick a date</span>}
      </Button>
    )
  );
  DatePickerCustomInput.displayName = 'DatePickerCustomInput';


  return (
    <div className="py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold">{experience.title}</h1>
            
            <div className="flex items-center gap-4 mt-4 text-muted-foreground">
            <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-accent fill-accent" />
                <span className="font-bold text-foreground">{experience.rating.average}</span>
                <span>({experience.rating.count} reviews)</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <div className="flex items-center gap-1">
                <MapPin className="h-5 w-5" />
                <span>{localAreaName}, {suburbName}, {countryName}</span>
            </div>
            <span className="text-muted-foreground">·</span>
                <span>{durationHours} hours</span>
                <span className="text-muted-foreground">·</span>
                <span>Up to {experience.pricing.maxGuests} guests</span>
            </div>
        </div>
        <WishlistButton experienceId={experience.id} className="h-12 w-12 flex-shrink-0" />
    </div>
      
      <div className="mt-6">
        <div className="relative h-96 w-full overflow-hidden rounded-lg">
           {mainImage && (
            <Image
              src={mainImage.imageUrl}
              alt={experience.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              data-ai-hint={mainImage.imageHint}
            />
          )}
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    {hostAvatar && <AvatarImage src={hostAvatar.imageUrl} alt={host.name} data-ai-hint={hostAvatar.imageHint}/>}
                    <AvatarFallback className="text-2xl">{host.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-headline text-2xl">Hosted by {host.name}</h2>
                    {host.level === 'Superhost' && (
                        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 gap-1 mt-1">
                            <Award className="h-4 w-4" /> Superhost
                        </Badge>
                    )}
                </div>
            </div>
            <Separator/>
          <p className="text-lg leading-relaxed">{experience.description}</p>
          <Separator />

          <div className="space-y-4">
            <h3 className="font-headline text-2xl">Where you'll be</h3>
            <div className="text-muted-foreground">{localAreaName}, {suburbName}, {countryName}</div>
            <div className="relative aspect-video w-full rounded-lg bg-muted mt-2">
                <ExperienceMap locationQuery={`${localAreaName}, ${suburbName}, ${countryName}`} />
            </div>
            <p className="text-sm text-muted-foreground">This is an approximate location. The exact address is provided after booking.</p>
          </div>
          <Separator />

           <div className="space-y-4">
            <h3 className="font-headline text-2xl">What you'll do</h3>
            <div className="flex items-start gap-4">
              <Utensils className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <p>You'll be welcomed into {host.name}'s home for a truly local experience. Share stories, learn about their culture, and enjoy a delicious, authentic meal prepared with love.</p>
            </div>
          </div>
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-headline text-2xl">On the Menu</h3>
            <p className="italic text-muted-foreground">"{experience.menu.description}"</p>
            <div className="flex flex-wrap gap-4">
                <Badge variant="secondary">Cuisine: {experience.menu.cuisine}</Badge>
                <Badge variant="secondary">Spice: {experience.menu.spiceLevel}</Badge>
                {experience.menu.dietary.map(d => <Badge key={d} variant="outline">{d}</Badge>)}
            </div>
          </div>
          <Separator/>

          <div className="space-y-4">
            <h3 className="font-headline text-2xl">Allergen Information</h3>
            <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 !text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-300 font-bold">Important Notice</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-400 space-y-2">
                <p>In accordance with the <strong>Australia New Zealand Food Standards Code (FSANZ)</strong>, please be aware that food is prepared in a home kitchen where allergens are handled, and cross-contact may occur.</p>
                {experience.menu.allergens && (
                  <p><strong>Host-declared potential allergens for this experience:</strong> {experience.menu.allergens}</p>
                )}
                <p className="font-semibold">Guests with food allergies or intolerances are strongly advised to contact the host before booking to discuss their specific needs.</p>
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-headline text-2xl">About your host's home</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2"><Home className="h-5 w-5 text-primary" /><span>{host.homeSetup.homeType} with {host.homeSetup.seating} seating</span></div>
                <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span>Pets live here: {host.homeSetup.pets ? 'Yes' : 'No'}</span></div>
                <div className="flex items-center gap-2"><Wind className="h-5 w-5 text-primary" /><span>Smoking allowed: {host.homeSetup.smoking ? 'Yes' : 'No'}</span></div>
                {host.homeSetup.accessibility && <div className="flex items-center gap-2"><Accessibility className="h-5 w-5 text-primary" /><span>{host.homeSetup.accessibility}</span></div>}
                {host.homeSetup.familyFriendly && <div className="flex items-center gap-2"><Baby className="h-5 w-5 text-primary" /><span>Family/Kid friendly</span></div>}
                {host.homeSetup.elevator && <div className="flex items-center gap-2"><ArrowUpFromLine className="h-5 w-5 text-primary" /><span>Elevator in building</span></div>}
                {host.homeSetup.airConditioning && <div className="flex items-center gap-2"><AirVent className="h-5 w-5 text-primary" /><span>Air conditioning</span></div>}
                {host.homeSetup.wifi && <div className="flex items-center gap-2"><Wifi className="h-5 w-5 text-primary" /><span>WiFi available</span></div>}
                {host.homeSetup.taxiNearby && <div className="flex items-center gap-2"><Car className="h-5 w-5 text-primary" /><span>Taxi station nearby</span></div>}
                {host.homeSetup.publicTransportNearby && <div className="flex items-center gap-2"><Bus className="h-5 w-5 text-primary" /><span>Public transport nearby</span></div>}
             </div>
          </div>
          
          {host.profile.achievements && host.profile.achievements.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-headline text-2xl">Host Achievements</h3>
                <div className="flex flex-wrap gap-2">
                  {host.profile.achievements.map((achievement) => (
                    <Badge key={achievement} variant="outline" className="text-base font-normal py-1">
                      <Trophy className="h-4 w-4 mr-2 text-amber-500"/>
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />
          
          <div>
            <h3 className="font-headline text-2xl flex items-center gap-2">
              <Star className="h-6 w-6 text-accent fill-accent" />
              {experience.rating.average} ({experience.rating.count} reviews)
            </h3>
            <div className="space-y-6 mt-4">
              {areReviewsLoading ? (
                <>
                  <ReviewItem review={{} as Review} />
                  <ReviewItem review={{} as Review} />
                </>
              ) : reviews && reviews.length > 0 ? (
                reviews.map(review => <ReviewItem key={review.id} review={review} />)
              ) : (
                <p className="text-muted-foreground">No reviews yet for this experience.</p>
              )}
            </div>
            {experience.rating.count > 2 && <Button variant="outline" className="mt-6">Show all {experience.rating.count} reviews</Button>}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-24">
             <div className="p-6 space-y-4 border rounded-xl shadow-lg bg-card">
                 <div className="flex justify-between items-baseline">
                    <div>
                        <span className="text-2xl font-bold">${experience.pricing.pricePerGuest}</span>
                        <span className="text-muted-foreground"> / person</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {experience.instantBook && (
                            <Badge variant="default" className="gap-1 bg-blue-500 hover:bg-blue-600">
                                <Zap className="h-4 w-4" /> Instant Book
                            </Badge>
                        )}
                        <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4" /> 
                            <span>{experience.rating.average} ({experience.rating.count})</span>
                        </div>
                    </div>
                </div>
                
                <Separator />
                
                {user?.uid === experience.userId ? (
                    <div className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-md">
                        This is your experience. You cannot book it.
                    </div>
                ) : (
                    <div className="flex flex-col space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date-picker">Date</Label>
                             <DatePicker
                                id="date-picker"
                                selected={date}
                                onChange={(d: Date) => setDate(d)}
                                filterDate={filterDate}
                                minDate={new Date()}
                                placeholderText="Pick a date"
                                className="w-full"
                                customInput={<DatePickerCustomInput />}
                                dateFormat="PPP"
                                />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="guests">Guests</Label>
                            <Select
                                value={String(numberOfGuests)}
                                onValueChange={(val) => setNumberOfGuests(Number(val))}
                                disabled={isBooking}
                            >
                                <SelectTrigger id="guests" className="w-full">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 opacity-50" />
                                      <SelectValue />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: experience.pricing.maxGuests }, (_, i) => i + 1).map((num) => (
                                        <SelectItem key={num} value={String(num)}>
                                            {num} guest{num > 1 ? 's' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="coupon">Have a coupon?</Label>
                            <div className="flex gap-2">
                                <Input id="coupon" placeholder="Enter code" value={couponCode} onChange={e => setCouponCode(e.target.value)} disabled={!!appliedCoupon} />
                                <Button variant="outline" onClick={handleApplyCoupon} disabled={!!appliedCoupon}>
                                    {appliedCoupon ? <CheckCircle className="h-5 w-5 text-green-600" /> : 'Apply'}
                                </Button>
                            </div>
                            {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                            {appliedCoupon && <p className="text-xs text-green-600 font-medium flex items-center gap-1"><Tag className="h-3 w-3"/>Code "{appliedCoupon.id}" applied!</p>}
                        </div>

                        <div className="space-y-1 text-sm pt-2">
                            <div className="flex justify-between">
                                <span>${experience.pricing.pricePerGuest} x {numberOfGuests} guests</span>
                                <span>${basePrice.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Coupon Discount</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <Separator/>
                        
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        
                        <Button 
                            size="lg" 
                            className="w-full"
                            disabled={!date || isBooking || isGifting}
                            onClick={handleBooking}
                        >
                            {isBooking ? <Loader2 className="animate-spin h-5 w-5"/> : (experience.instantBook ? 'Book' : 'Request to Book')}
                        </Button>

                        <div className="relative flex items-center justify-center my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">OR</span>
                            </div>
                        </div>

                        <Button 
                            size="lg" 
                            className="w-full"
                            variant="outline"
                            disabled={!date || isBooking || isGifting}
                            onClick={handleGiftBooking}
                        >
                            {isGifting ? <Loader2 className="animate-spin h-5 w-5"/> : <Gift className="h-5 w-5"/>}
                            Gift this experience
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            {experience.instantBook ? 'You will be charged immediately' : "You won't be charged until the host confirms"}
                        </p>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
