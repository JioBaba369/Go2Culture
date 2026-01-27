
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, collection, runTransaction, serverTimestamp, getDoc, increment } from 'firebase/firestore';
import { Experience, Host, Coupon, Booking } from '@/lib/types';
import { createNotification } from '@/lib/notification-actions';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Star, Loader2, Tag, CheckCircle, Users, Gift, Zap } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import Link from 'next/link';
import { BookingDatePicker } from '../ui/booking-date-picker';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface BookingWidgetProps {
    experience: Experience;
    host: Host;
}

export function BookingWidget({ experience, host }: BookingWidgetProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [agreedToLiability, setAgreedToLiability] = useState(false);
  const [agreedToConduct, setAgreedToConduct] = useState(false);
  const [agreedToServiceTerms, setAgreedToServiceTerms] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isGifting, setIsGifting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  
  const allTermsAgreed = agreedToLiability && agreedToConduct && agreedToServiceTerms;

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
        const basePrice = experience.pricing.pricePerGuest * numberOfGuests;

        if (!coupon.isActive || (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) || (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit)) {
            setCouponError("This coupon is not valid or has expired."); return;
        }
        if (coupon.minSpend && basePrice < coupon.minSpend) {
            setCouponError(`You must spend at least $${coupon.minSpend} to use this coupon.`); return;
        }

        let discount = coupon.discountType === 'fixed' ? coupon.discountValue : basePrice * (coupon.discountValue / 100);
        setDiscountAmount(discount);
        setAppliedCoupon(coupon);
        toast({ title: "Coupon Applied!", description: `You saved $${discount.toFixed(2)}.` });

    } catch (error) {
        setCouponError("Could not validate coupon. Please try again.");
    }
  };

  const handleBookingAction = (isGift: boolean) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please log in', description: `You must be logged in to ${isGift ? 'gift' : 'book'} an experience.` });
      router.push(`/login?redirect=/experiences/${experience.id}`);
      return;
    }

    if (user.uid === experience.userId) {
        toast({ variant: "destructive", title: "Action Not Allowed", description: `You cannot ${isGift ? 'gift' : 'book'} your own experience.` });
        return;
    }

    if (!date) {
      toast({ variant: 'destructive', title: 'No date selected', description: `Please select a date for your ${isGift ? 'gift' : 'booking'}.` });
      return;
    }

     if (!allTermsAgreed) {
      toast({ variant: 'destructive', title: 'Agreements Required', description: 'You must review and accept all terms before booking.' });
      return;
    }
    
    isGift ? setIsGifting(true) : setIsBooking(true);

    let bookingDataForTransaction: Partial<Booking> = {};

    runTransaction(firestore, async (transaction) => {
      const userRef = doc(firestore, 'users', user.uid);
      const couponRef = appliedCoupon ? doc(firestore, 'coupons', appliedCoupon.id) : null;
      
      const userSnapPromise = transaction.get(userRef);
      const couponSnapPromise = couponRef ? transaction.get(couponRef) : Promise.resolve(null);
      
      const [userSnap, couponSnap] = await Promise.all([userSnapPromise, couponSnapPromise]);
      
      const basePrice = experience!.pricing.pricePerGuest * numberOfGuests;
      let finalDiscountAmount = 0;
      let isValidCoupon = false;

      if (couponRef && couponSnap && couponSnap.exists()) {
          const couponData = couponSnap.data() as Coupon;
          if (couponData.isActive && (!couponData.usageLimit || couponData.timesUsed < couponData.usageLimit)) {
              if (!couponData.minSpend || basePrice >= couponData.minSpend) {
                  finalDiscountAmount = couponData.discountType === 'fixed'
                      ? couponData.discountValue
                      : basePrice * (couponData.discountValue / 100);
                  isValidCoupon = true;
              }
          }
      }
      
      const serviceFee = basePrice * 0.15; // Example 15% service fee
      const finalPrice = basePrice + serviceFee - finalDiscountAmount;

      const newBookingRef = doc(collection(firestore, 'bookings'));
      const bookingData: Partial<Booking> = {
        guestId: user.uid,
        experienceId: experience!.id,
        experienceTitle: experience!.title,
        hostId: experience!.hostId,
        hostName: host!.name,
        bookingDate: date,
        numberOfGuests: numberOfGuests,
        totalPrice: finalPrice,
        status: isGift || experience?.instantBook ? 'Confirmed' : 'Pending',
        isGift: isGift,
        createdAt: serverTimestamp(),
        payment: {
          intentId: '',
          status: 'requires_payment',
        },
        pricing: {
          basePrice: basePrice,
          guests: numberOfGuests,
          serviceFee: serviceFee,
          total: finalPrice,
          currency: 'AUD', // Assuming AUD
        },
        policySnapshot: {
          cancellationPolicy: 'flexible', // Example policy
          refundWindowHours: 48,
          hostIsIndependent: true,
          platformIsMarketplace: true,
          guestAcceptedAt: serverTimestamp(),
        },
        ...(isValidCoupon && appliedCoupon && { couponId: appliedCoupon.id }),
        ...(isValidCoupon && { discountAmount: finalDiscountAmount }),
      };
      
      bookingDataForTransaction = bookingData;

      transaction.set(newBookingRef, bookingData as Booking);

      if (isValidCoupon && couponRef) {
          transaction.update(couponRef, { timesUsed: increment(1) });
      }
      
      if (userSnap.exists() && !userSnap.data().termsAccepted) {
          transaction.update(userRef, { termsAccepted: true });
      }
    })
    .then(async () => {
      if (appliedCoupon && discountAmount > 0 && !(await getDoc(doc(firestore, 'coupons', appliedCoupon.id))).data()?.isActive) {
           toast({ variant: 'destructive', title: 'Coupon Invalid', description: `Coupon "${appliedCoupon.id}" could not be applied.` });
      }

      toast({
        title: isGift ? 'Gift Purchased!' : (experience?.instantBook ? 'Booking Confirmed!' : 'Booking Requested!'),
        description: isGift ? `You've successfully gifted "${experience!.title}".` : (experience?.instantBook ? `Your booking for "${experience!.title}" is confirmed.` : `Your request for "${experience!.title}" has been sent.`),
      });

      await createNotification(
        firestore,
        experience.hostId,
        'BOOKING_REQUESTED',
        'new-booking'
      );

      setDate(undefined);
      setNumberOfGuests(1);
      setCouponCode('');
      setAppliedCoupon(null);
      setDiscountAmount(0);

    })
    .catch((serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `bookings`,
            operation: 'create',
            requestResourceData: bookingDataForTransaction,
        }));
    })
    .finally(() => {
      isGift ? setIsGifting(false) : setIsBooking(false);
    });
  };
  
  const basePrice = experience.pricing.pricePerGuest * numberOfGuests;
  const serviceFee = basePrice * 0.15; // Example 15% service fee, should come from config
  const totalPrice = basePrice + serviceFee - discountAmount;
  const canBook = date && allTermsAgreed && !(isBooking || isGifting);

  return (
    <div className="p-6 space-y-4 border rounded-xl shadow-lg bg-card">
        <div className="flex justify-between items-baseline">
            <div>
                <span className="text-2xl font-bold">${experience.pricing.pricePerGuest}</span>
                <span className="text-muted-foreground"> / person</span>
            </div>
            <div className="flex items-center gap-2">
                {experience.instantBook && (
                    <Badge variant="default" className="gap-1">
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
            <Alert>
                <AlertTitle>This is Your Experience</AlertTitle>
                <AlertDescription>
                You cannot book your own experience. You can view it as a guest to see how it looks.
                </AlertDescription>
            </Alert>
        ) : (
            <div className="flex flex-col space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="date-picker">Date</Label>
                    <BookingDatePicker
                        value={date}
                        onChange={setDate}
                        availableDays={experience.availability.days}
                        blockedDates={host?.blockedDates}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="guests">Guests</Label>
                    <Select value={String(numberOfGuests)} onValueChange={(val) => setNumberOfGuests(Number(val))} disabled={isBooking || isGifting}>
                        <SelectTrigger id="guests" className="w-full">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 opacity-50" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: experience.pricing.maxGuests }, (_, i) => i + 1).map((num) => (
                                <SelectItem key={num} value={String(num)}>{num} guest{num > 1 ? 's' : ''}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="coupon">Have a coupon?</Label>
                    <div className="flex gap-2">
                        <Input id="coupon" placeholder="Enter code" value={couponCode} onChange={e => setCouponCode(e.target.value)} disabled={!!appliedCoupon} />
                        <Button variant="outline" onClick={handleApplyCoupon} disabled={!!appliedCoupon}>
                            {appliedCoupon ? <CheckCircle className="h-5 w-5 text-green-500" /> : 'Apply'}
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
                    <div className="flex justify-between text-muted-foreground">
                        <span>Service fee</span>
                        <span>${serviceFee.toFixed(2)}</span>
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

                <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-2">
                        <Checkbox id="liability" checked={agreedToLiability} onCheckedChange={(checked) => setAgreedToLiability(checked as boolean)} />
                        <label
                            htmlFor="liability"
                            className="text-xs text-muted-foreground leading-snug"
                        >
                            I acknowledge the host is an independent operator and I agree to the platform's liability framework as outlined in the <Link href="/trust-and-safety" className="underline hover:text-primary">Trust & Safety</Link> policy.
                        </label>
                    </div>
                    <div className="flex items-start space-x-2">
                        <Checkbox id="conduct" checked={agreedToConduct} onCheckedChange={(checked) => setAgreedToConduct(checked as boolean)} />
                        <label
                            htmlFor="conduct"
                            className="text-xs text-muted-foreground leading-snug"
                        >
                            I have read and agree to follow the <Link href="/guest-guidelines" className="underline hover:text-primary">Guest Code of Conduct</Link>.
                        </label>
                    </div>
                     <div className="flex items-start space-x-2">
                        <Checkbox id="terms" checked={agreedToServiceTerms} onCheckedChange={(checked) => setAgreedToServiceTerms(checked as boolean)} />
                        <label
                            htmlFor="terms"
                            className="text-xs text-muted-foreground leading-snug"
                        >
                            I agree to the Go2Culture <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                        </label>
                    </div>
                </div>
                
                <Button size="lg" className="w-full" disabled={!canBook} onClick={() => handleBookingAction(false)}>
                    {isBooking ? <Loader2 className="animate-spin h-5 w-5"/> : (experience.instantBook ? 'Book' : 'Request to Book')}
                </Button>

                <div className="relative flex items-center justify-center my-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">OR</span></div>
                </div>

                <Button size="lg" className="w-full" variant="outline" disabled={!canBook} onClick={() => handleBookingAction(true)}>
                    {isGifting ? <Loader2 className="animate-spin h-5 w-5"/> : <Gift className="h-5 w-5"/>}
                    Gift this experience
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                    {experience.instantBook ? 'You will be charged immediately' : "You won't be charged until the host confirms"}
                </p>
            </div>
        )}
    </div>
  );
}
