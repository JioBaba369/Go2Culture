
'use client';
import { notFound, useRouter } from "next/navigation";
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
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { HostApplication } from "@/lib/types";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { approveApplication, rejectApplication, requestChangesForApplication } from "@/lib/admin-actions";

export function ApplicationDetailClient({
  applicationId,
}: {
  applicationId: string;
}) {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<null | 'approve' | 'changes' | 'reject'>(null);

  const appRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, 'hostApplications', applicationId) : null, [firestore, user, applicationId]);
  const { data: application, isLoading: isDocLoading } = useDoc<HostApplication>(appRef);

  const isLoading = isAuthLoading || (!!user && isDocLoading);

  const handleApprove = () => {
    if (!application || !firestore) return;
    setIsProcessing('approve');
    try {
      approveApplication(firestore, application);
      toast({
        title: "Application Approved!",
        description: `${application.hostName} is now a host.`,
      });
      router.push('/admin/applications');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Could not approve the application.",
      });
    } finally {
      setIsProcessing(null);
    }
  }

  const handleRequestChanges = () => {
     if (!application || !firestore) return;
    setIsProcessing('changes');
    try {
      requestChangesForApplication(firestore, application.id);
      toast({
        title: "Changes Requested",
        description: `The application status has been updated to 'Changes Needed'.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update the application.",
      });
    } finally {
      setIsProcessing(null);
    }
  }
  
  const handleReject = () => {
    if (!application || !firestore) return;
    setIsProcessing('reject');
    try {
      rejectApplication(firestore, application.id);
      toast({
        title: "Application Rejected",
        description: `The application from ${application.hostName} has been rejected.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not reject the application.",
      });
    } finally {
      setIsProcessing(null);
    }
  }

  if (isLoading) {
    return <Skeleton className="h-screen w-full" />;
  }

  if (!application) {
    notFound();
  }

  const profilePhoto = PlaceHolderImages.find(p => p.id === application.profile.photoId);
  const idDocPhoto = PlaceHolderImages.find(p => p.id === application.verification.idDocId);
  const selfiePhoto = PlaceHolderImages.find(p => p.id === application.verification.selfieId);
  const mainImage = PlaceHolderImages.find(p => p.id === application.experience.photos.mainImageId);
  
  const areActionsDisabled = isProcessing !== null || application.status === 'Approved' || application.status === 'Rejected';

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
        <div className="flex gap-2">
          <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={areActionsDisabled}>
            {isProcessing === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />} Approve
          </Button>
          <Button variant="outline" onClick={handleRequestChanges} disabled={areActionsDisabled}>
            {isProcessing === 'changes' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Edit className="mr-2 h-4 w-4" />} Request Changes
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={areActionsDisabled}>
            {isProcessing === 'reject' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4" />} Reject
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Utensils /> Experience & Menu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-headline text-2xl">{application.experience.title}</h3>
              <p className="text-muted-foreground">{application.experience.description}</p>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div><p className="font-semibold">Cuisine</p><p>{application.experience.menu.cuisine}</p></div>
                <div><p className="font-semibold">Price</p><p>${application.experience.pricing.pricePerGuest} / person</p></div>
                <div><p className="font-semibold">Duration</p><p>{application.experience.durationMinutes / 60} hours</p></div>
                <div><p className="font-semibold">Max Guests</p><p>{application.experience.pricing.maxGuests}</p></div>
                <div><p className="font-semibold">Spice Level</p><p>{application.experience.menu.spiceLevel}</p></div>
              </div>
               <Separator />
               <p className="font-semibold">Menu Description</p>
               <p className="text-sm italic text-muted-foreground">"{application.experience.menu.description}"</p>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><Home /> Home Setup</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="font-semibold">Home Type</p><p>{application.homeSetup.homeType}</p></div>
                    <div><p className="font-semibold">Seating</p><p>{application.homeSetup.seating}</p></div>
                </div>
                {application.homeSetup.accessibility && (
                    <>
                     <Separator className="my-4"/>
                     <p className="font-semibold">Accessibility Notes</p>
                     <p className="text-sm text-muted-foreground">{application.homeSetup.accessibility}</p>
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User/> Host Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {profilePhoto && <Image src={profilePhoto.imageUrl} alt={application.hostName} width={64} height={64} className="rounded-full" data-ai-hint={profilePhoto.imageHint} />}
                <div>
                    <p className="font-bold text-lg">{application.hostName}</p>
                    <p className="text-sm text-muted-foreground">{application.location.suburb}, {application.location.country}</p>
                </div>
              </div>
              <p className="text-sm italic text-muted-foreground">"{application.profile.bio}"</p>
              <div className="flex items-center gap-2 text-sm">
                <Languages className="h-4 w-4 text-muted-foreground"/>
                <span>{application.profile.languages.join(", ")}</span>
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
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck /> Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Badge>{application.verification.status}</Badge>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="font-semibold text-sm">ID Document</p>
                        {idDocPhoto && <Image src={idDocPhoto.imageUrl} alt="ID Document" width={150} height={100} className="rounded-md mt-1" data-ai-hint={idDocPhoto.imageHint}/>}
                    </div>
                     <div>
                        <p className="font-semibold text-sm">Selfie</p>
                        {selfiePhoto && <Image src={selfiePhoto.imageUrl} alt="Selfie" width={100} height={100} className="rounded-full mt-1" data-ai-hint={selfiePhoto.imageHint} />}
                    </div>
                </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle /> Compliance (AU)</CardTitle>
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
      </div>
      <Button asChild variant="outline"><Link href="/admin/applications">Back to Applications</Link></Button>
    </div>
  );
}
