import { hostApplications } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Home,
  Camera,
  Languages,
  Info,
  AlertTriangle,
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";

export default function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const application = hostApplications.find((app) => app.id === params.id);

  if (!application) {
    notFound();
  }

  const profilePhoto = PlaceHolderImages.find(p => p.id === application.profile.photoId);
  const idDocPhoto = PlaceHolderImages.find(p => p.id === application.verification.idDocId);
  const selfiePhoto = PlaceHolderImages.find(p => p.id === application.verification.selfieId);
  const mainImage = PlaceHolderImages.find(p => p.id === application.experience.mainImageId);

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
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" className="bg-green-600 hover:bg-green-700">
            <Check className="mr-2 h-4 w-4" /> Approve
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Request Changes
          </Button>
          <Button variant="destructive">
            <X className="mr-2 h-4 w-4" /> Reject
          </Button>
        </div>
      </div>

      {!application.aiModeration.isAppropriate && (
        <Card className="border-destructive">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
             <AlertTriangle className="h-6 w-6 text-destructive" />
             <div>
                <CardTitle>AI Moderation Warning</CardTitle>
                <CardDescription>Our AI system has flagged this content as potentially inappropriate.</CardDescription>
             </div>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">Reasons:</p>
            <ul className="list-disc pl-5 text-sm text-destructive">
                {application.aiModeration.flagReasons.map(reason => <li key={reason}>{reason}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Utensils /> Experience Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-headline text-2xl">{application.experience.title}</h3>
              <p className="text-muted-foreground">{application.experience.description}</p>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Cuisine</p>
                  <p>{application.experience.menu.cuisine}</p>
                </div>
                 <div>
                  <p className="font-semibold">Price</p>
                  <p>${application.experience.pricePerGuest} / person</p>
                </div>
                 <div>
                  <p className="font-semibold">Duration</p>
                  <p>{application.experience.duration}</p>
                </div>
                 <div>
                  <p className="font-semibold">Max Guests</p>
                  <p>{application.experience.maxGuests}</p>
                </div>
              </div>
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
                    <p className="text-sm text-muted-foreground">{application.city}, {application.country}</p>
                </div>
              </div>
              <p className="text-sm italic text-muted-foreground">"{application.profile.bio}"</p>
              <div className="flex items-center gap-2 text-sm">
                <Languages className="h-4 w-4 text-muted-foreground"/>
                <span>{application.profile.languages.join(", ")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-muted-foreground"/>
                <span>Culture: {application.profile.culture}</span>
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
        </div>
      </div>
      <Button asChild variant="outline"><Link href="/admin/applications">Back to Applications</Link></Button>
    </div>
  );
}
