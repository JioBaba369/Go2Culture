
'use client';
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  X,
  Edit,
  User,
  ShieldCheck,
  Utensils,
  Camera,
  Languages,
  Info,
  Home,
  AlertTriangle,
  Loader2,
  FileText,
  MapPin,
  DollarSign,
  ClockIcon,
  PlayCircle,
  PauseCircle,
  Users as UsersIcon,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { HostApplication, Experience, User as UserType } from "@/lib/types";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { approveApplication, rejectApplication, requestChangesForApplication, pauseExperience, startExperience } from "@/lib/admin-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { countries, regions, suburbs, localAreas } from "@/lib/location-data";

function DetailItem({ icon: Icon, label, value, isLink = false }: { icon: React.ElementType, label: string, value: React.ReactNode, isLink?: boolean }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
                <p className="font-semibold text-sm">{label}</p>
                {isLink && typeof value === 'string' ? (
                    <a href={value.startsWith('http') ? value : `mailto:${value}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline break-all">
                        {value}
                    </a>
                ) : (
                    <p className="text-muted-foreground break-all">{value}</p>
                )}
            </div>
        </div>
    );
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params.id as string;
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<null | 'approve' | 'changes' | 'reject' | 'pause' | 'start'>(null);

  const appRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, 'hostApplications', applicationId) : null, [firestore, user, applicationId]);
  const { data: application, isLoading: isDocLoading, error } = useDoc<HostApplication>(appRef);

  const applicantUserRef = useMemoFirebase(() => (firestore && application) ? doc(firestore, 'users', application.userId) : null, [firestore, application]);
  const { data: applicantUser, isLoading: isApplicantUserLoading } = useDoc<UserType>(applicantUserRef);
  
  const experienceRef = useMemoFirebase(() => (firestore && application?.status === 'Approved' && application.experienceId) ? doc(firestore, 'experiences', application.experienceId) : null, [firestore, application]);
  const { data: experience, isLoading: isExperienceLoading } = useDoc<Experience>(experienceRef);

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push(`/login?redirect=/admin/applications/${applicationId}`);
    }
  }, [isAuthLoading, user, router, applicationId]);

  const isLoading = isAuthLoading || (!!user && isDocLoading) || (!!application && isApplicantUserLoading);

  const handleApprove = async () => {
    if (!application || !firestore) return;
    setIsProcessing('approve');
    try {
      await approveApplication(firestore, application);
      toast({
        title: "Application Approved!",
        description: `${application.hostName} is now a host.`,
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Could not approve the application. Check permissions.",
      });
    } finally {
      setIsProcessing(null);
    }
  }

  const handleRequestChanges = async () => {
     if (!application || !firestore) return;
    setIsProcessing('changes');
    try {
      await requestChangesForApplication(firestore, application.id);
      toast({
        title: "Changes Requested",
        description: `The application status has been updated to 'Changes Needed'.`,
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the application. Check permissions.",
      });
    } finally {
      setIsProcessing(null);
    }
  }
  
  const handleReject = async () => {
    if (!application || !firestore) return;
    setIsProcessing('reject');
    try {
      await rejectApplication(firestore, application.id);
      toast({
        title: "Application Rejected",
        description: `The application from ${application.hostName} has been rejected.`,
      });
       router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not reject the application. Check permissions.",
      });
    } finally {
      setIsProcessing(null);
    }
  }
  
  const handlePauseExperience = async () => {
    if (!experience || !firestore) return;
    setIsProcessing('pause');
    try {
      await pauseExperience(firestore, experience.id);
      toast({
        title: "Experience Paused",
        description: `The experience "${experience.title}" is no longer live.`,
      });
      router.refresh(); // To refetch the experience data
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not pause the experience.",
      });
    } finally {
      setIsProcessing(null);
    }
  }

  const handleStartExperience = async () => {
    if (!experience || !firestore) return;
    setIsProcessing('start');
    try {
      await startExperience(firestore, experience.id);
      toast({
        title: "Experience Live",
        description: `The experience "${experience.title}" is now live.`,
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not start the experience.",
      });
    } finally {
      setIsProcessing(null);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  if (error) {
     return (
        <div className="py-20 px-4 text-center space-y-4">
            <h1 className="text-2xl font-bold">Error Loading Application</h1>
            <Alert variant="destructive" className="max-w-2xl mx-auto text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Permission Denied</AlertTitle>
              <AlertDescription>
                Could not load the application. You may not have permission to view it. Please ensure you are logged in with an admin account.
                <pre className="mt-4 p-2 bg-background rounded-md text-xs whitespace-pre-wrap font-mono">
                  {error.message}
                </pre>
              </AlertDescription>
            </Alert>
             <Button asChild variant="outline" className="mt-6">
                <Link href="/admin/applications">Back to All Applications</Link>
            </Button>
        </div>
    );
  }

  if (!application) {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    Application Not Found
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">The application with ID "{applicationId}" could not be found. It may have been deleted or the link may be incorrect.</p>
                <Button asChild variant="outline" className="mt-6">
                    <Link href="/admin/applications">Back to All Applications</Link>
                </Button>
            </CardContent>
        </Card>
    );
  }

  const profilePhoto = PlaceHolderImages.find(p => p.id === application.profile.photoId);
  const idDocPhoto = PlaceHolderImages.find(p => p.id === application.verification.idDocId);
  const selfiePhoto = PlaceHolderImages.find(p => p.id === application.verification.selfieId);
  const mainImage = PlaceHolderImages.find(p => p.id === application.experience.photos.mainImageId);

  const countryName = countries.find(c => c.id === application.location.country)?.name || application.location.country;
  const regionName = regions.find(r => r.id === application.location.region)?.name || application.location.region;
  const suburbName = suburbs.find(s => s.id === application.location.suburb)?.name || application.location.suburb;
  const localAreaName = localAreas.find(l => l.id === application.location.localArea)?.name || application.location.localArea;

  const hostLocationDisplay = [suburbName, countryName].filter(Boolean).join(', ');
  const fullLocationDisplay = [application.location.address, localAreaName, suburbName, regionName, countryName].filter(Boolean).join(', ');

  const isFinalStatus = application.status === 'Approved' || application.status === 'Rejected';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">
            Application Review
          </h1>
          <p className="text-muted-foreground">
            Reviewing application from{" "}
            <span className="font-semibold text-foreground">
              {application.hostName}
            </span>
            - <Badge>{application.status}</Badge>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {application.status === 'Pending' || application.status === 'Changes Needed' ? (
            <>
              <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={isProcessing !== null}>
                {isProcessing === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />} Approve
              </Button>
              <Button variant="outline" onClick={handleRequestChanges} disabled={isProcessing !== null}>
                {isProcessing === 'changes' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Edit className="mr-2 h-4 w-4" />} Request Changes
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={isProcessing !== null}>
                {isProcessing === 'reject' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4" />} Reject
              </Button>
            </>
          ) : application.status === 'Approved' ? (
            <>
              {isExperienceLoading ? (
                <Skeleton className="h-10 w-48" />
              ) : experience?.status === 'live' ? (
                <Button variant="outline" onClick={handlePauseExperience} disabled={isProcessing !== null}>
                  {isProcessing === 'pause' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PauseCircle className="mr-2 h-4 w-4" />} Pause Experience
                </Button>
              ) : (
                <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleStartExperience} disabled={isProcessing !== null}>
                  {isProcessing === 'start' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlayCircle className="mr-2 h-4 w-4" />} Make Experience Live
                </Button>
              )}
            </>
          ) : application.status === 'Rejected' ? (
             <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={isProcessing !== null}>
              {isProcessing === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />} Re-Approve
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="host">Host Details</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Utensils /> Experience Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <h3 className="font-headline text-2xl">{application.experience.title}</h3>
                        <p className="text-muted-foreground">{application.experience.description}</p>
                        <Separator />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <DetailItem icon={FileText} label="Category" value={application.experience.category} />
                            <DetailItem icon={DollarSign} label="Price" value={`$${application.experience.pricing.pricePerGuest} / person`} />
                            <DetailItem icon={ClockIcon} label="Duration" value={`${application.experience.durationMinutes} minutes`} />
                            <DetailItem icon={UsersIcon} label="Max Guests" value={application.experience.pricing.maxGuests} />
                            <DetailItem icon={Info} label="Cuisine" value={application.experience.menu.cuisine} />
                            <DetailItem icon={AlertTriangle} label="Spice Level" value={application.experience.menu.spiceLevel} />
                        </div>
                    </CardContent>
                </Card>
             </div>
             <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User/> Host Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        {profilePhoto && <Image src={profilePhoto.imageUrl} alt={application.hostName} width={64} height={64} className="rounded-full" data-ai-hint={profilePhoto.imageHint} />}
                        <div>
                            <p className="font-bold text-lg">{application.hostName}</p>
                            <p className="text-sm text-muted-foreground">{hostLocationDisplay}</p>
                        </div>
                    </div>
                    <p className="text-sm italic text-muted-foreground">"{application.profile.bio}"</p>
                    <div className="flex items-center gap-2 text-sm">
                        <Languages className="h-4 w-4 text-muted-foreground"/>
                        <span>{Array.isArray(application.profile.languages) ? application.profile.languages.join(", ") : application.profile.languages}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Info className="h-4 w-4 text-muted-foreground"/>
                        <span>Culture: {application.profile.culturalBackground}</span>
                    </div>
                    <Separator />
                    <p className="font-semibold">Hosting Style</p>
                    <div className="flex flex-wrap gap-2">
                        {application.profile.hostingStyles.map(style => <Badge variant="secondary" key={style}>{style}</Badge>)}
                    </div>
                    </CardContent>
                </Card>
             </div>
           </div>
        </TabsContent>

        <TabsContent value="experience" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Utensils /> Menu Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">Menu Description</p>
                        <p className="text-sm italic text-muted-foreground">"{application.experience.menu.description}"</p>
                        {application.experience.menu.allergens && (
                            <>
                                <Separator className="my-4"/>
                                <p className="font-semibold">Declared Allergens</p>
                                <p className="text-sm text-muted-foreground">{application.experience.menu.allergens}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Camera/> Photos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mainImage && <Image src={mainImage.imageUrl} alt="Experience main" width={600} height={400} className="rounded-lg" data-ai-hint={mainImage.imageHint}/>}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="host" className="mt-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MapPin /> Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                       <DetailItem icon={MapPin} label="Address" value={fullLocationDisplay} />
                       <DetailItem icon={MapPin} label="Postcode" value={application.location.postcode} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Home /> Home Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <DetailItem icon={Home} label="Home Type" value={application.homeSetup.homeType} />
                        <DetailItem icon={UsersIcon} label="Seating" value={application.homeSetup.seating} />
                        <DetailItem icon={UsersIcon} label="Max Guests" value={application.homeSetup.maxGuests} />
                        <DetailItem icon={Info} label="Pets" value={application.homeSetup.pets ? 'Yes' : 'No'} />
                        <DetailItem icon={Info} label="Smoking" value={application.homeSetup.smoking ? 'Yes' : 'No'} />
                        <DetailItem icon={Info} label="Accessibility" value={application.homeSetup.accessibility || 'Not specified'} />
                    </CardContent>
                </Card>
                {applicantUser && (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Phone /> Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-4">
                            <DetailItem icon={Mail} label="Email" value={applicantUser.email} isLink={true} />
                            <DetailItem icon={Phone} label="Phone" value={applicantUser.phone} />
                            <DetailItem icon={Globe} label="Website" value={applicantUser.website} isLink={true} />
                            {applicantUser.socialMedia?.instagram && <DetailItem icon={Globe} label="Instagram" value={applicantUser.socialMedia.instagram} isLink={true} />}
                            {applicantUser.socialMedia?.facebook && <DetailItem icon={Globe} label="Facebook" value={applicantUser.socialMedia.facebook} isLink={true} />}
                            {applicantUser.socialMedia?.twitter && <DetailItem icon={Globe} label="Twitter" value={applicantUser.socialMedia.twitter} isLink={true} />}
                        </CardContent>
                    </Card>
                )}
            </div>
        </TabsContent>

        <TabsContent value="verification" className="mt-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldCheck /> Document Verification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Badge>{application.verification.status}</Badge>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="font-semibold text-sm">ID Document</p>
                                {idDocPhoto && <Image src={idDocPhoto.imageUrl} alt="ID Document" width={200} height={125} className="rounded-md mt-1" data-ai-hint={idDocPhoto.imageHint}/>}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Selfie</p>
                                {selfiePhoto && <Image src={selfiePhoto.imageUrl} alt="Selfie" width={125} height={125} className="rounded-full mt-1" data-ai-hint={selfiePhoto.imageHint} />}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle /> Compliance Checks (AU)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <p>Food Business Registered?</p>
                            <p className="font-semibold">{application.compliance.foodBusinessRegistered ? 'Yes' : 'No'}</p>
                        </div>
                        {application.compliance.councilName && (
                            <div className="flex items-center justify-between text-sm">
                                <p>Council Name</p>
                                <p className="font-semibold">{application.compliance.councilName}</p>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                            <p>Food Safety Training?</p>
                            <p className="font-semibold">{application.compliance.foodSafetyTrainingCompleted ? 'Yes' : 'No'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
      <div className="mt-6">
        <Button asChild variant="outline"><Link href="/admin/applications">Back to Applications</Link></Button>
      </div>
    </div>
  );
}
