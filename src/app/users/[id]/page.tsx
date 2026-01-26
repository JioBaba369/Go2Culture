'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { User, Host, Experience } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Globe, Twitter, Instagram, Facebook, Languages, ShieldCheck, Award, Trophy, Flag } from 'lucide-react';
import { ExperienceCard } from '@/components/experience-card';
import { Separator } from '@/components/ui/separator';
import { countries } from '@/lib/location-data';
import { getFlagEmoji, getFlagFromCountryCode } from '@/lib/format';
import { cn } from '@/lib/utils';

const getUsername = (url?: string) => {
  if (!url) return '';
  try {
    const path = new URL(url).pathname;
    return path.substring(1).replace(/\/$/, ''); // remove leading/trailing slashes
  } catch (e) {
    return url; // fallback to showing the raw value if it's not a valid URL
  }
};

function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const firestore = useFirestore();

  // Fetch User document
  const userRef = useMemoFirebase(() => (firestore && userId ? doc(firestore, 'users', userId) : null), [firestore, userId]);
  const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

  // Fetch Host document (if the user is a host)
  const hostRef = useMemoFirebase(() => (firestore && userId ? doc(firestore, 'users', userId, 'hosts', userId) : null), [firestore, userId]);
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

  // Fetch user's experiences
  const experiencesQuery = useMemoFirebase(
    () => (firestore && userId ? query(collection(firestore, 'experiences'), where('userId', '==', userId), where('status', '==', 'live')) : null),
    [firestore, userId]
  );
  const { data: experiences, isLoading: areExperiencesLoading } = useCollection<Experience>(experiencesQuery);

  const isLoading = isUserLoading || isHostLoading;

  if (isLoading) {
    return (
      <div className="py-12 space-y-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="space-y-2 text-center sm:text-left">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        <Separator />
        <Skeleton className="h-40 w-full" />
        <Separator />
        <div>
          <Skeleton className="h-8 w-56 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground">The user you are looking for does not exist.</p>
      </div>
    );
  }

  const userImage = PlaceHolderImages.find(p => p.id === user.profilePhotoId);
  const isHost = user.role === 'host' || user.role === 'both';
  
  const nativeLanguage = user.nativeLanguage;
  const otherLanguages = host?.profile.languages?.filter(
      (lang) => lang.toLowerCase() !== nativeLanguage?.toLowerCase()
  ) || [];

  return (
    <div className="py-12 space-y-12">
      <section className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-32 w-32 text-4xl">
          {userImage && <AvatarImage src={userImage.imageUrl} alt={user.fullName} />}
          <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-3 text-center sm:text-left">
            <h1 className="font-headline text-4xl font-bold">{user.fullName}</h1>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-muted-foreground">
                {isHost && host?.verification?.idVerified && (
                    <div className="flex items-center gap-1.5 text-green-600 font-semibold">
                        <ShieldCheck className="h-5 w-5" />
                        <span>Verified Host</span>
                    </div>
                )}
                {user.location?.country && (
                    <div className="flex items-center gap-1.5">
                        {getFlagFromCountryCode(user.location.country)}
                        <span>From {countries.find(c => c.id === user.location.country)?.name}</span>
                    </div>
                )}
            </div>

            {user.brandName && <p className="text-xl text-muted-foreground">{user.brandName}</p>}

            <div className="flex gap-2 justify-center sm:justify-start">
                <Badge variant={isHost ? "secondary" : "outline"} className="capitalize">{user.role}</Badge>
                {user.location?.city && <Badge variant="outline">{user.location.city}</Badge>}
            </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            {experiences && experiences.length > 0 && (
                <div>
                <h2 className="font-headline text-2xl font-semibold mb-4">Experiences by {user.fullName.split(' ')[0]}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {experiences.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
                </div>
                </div>
            )}
        </div>
        
        <aside className="md:col-span-1 space-y-6">
            {isHost && host ? (
                <div className="p-6 border rounded-xl shadow-sm bg-card">
                    <h3 className="font-headline text-xl font-semibold mb-4">About {user.fullName.split(' ')[0]}</h3>
                    {host.profile.bio && <p className="text-muted-foreground leading-relaxed text-sm">{host.profile.bio}</p>}
                    <Separator className="my-4" />
                    <div className="space-y-4 text-sm">
                        {host.level === 'Superhost' && (
                            <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-500 flex-shrink-0" />
                            <span>Superhost</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <span>From {getFlagFromCountryCode(host.location.country)} {countries.find(c => c.id === host.location.country)?.name}</span>
                        </div>
                        {host.profile.culturalBackground && (
                            <div className="flex items-center gap-3">
                            <Flag className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <span>{host.profile.culturalBackground}</span>
                            </div>
                        )}
                        {(nativeLanguage || otherLanguages.length > 0) && (
                            <div className="flex items-start gap-3">
                                <Languages className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                {nativeLanguage && <p><span className="font-semibold">Native:</span> <span className="capitalize text-muted-foreground">{nativeLanguage}</span></p>}
                                {otherLanguages.length > 0 && <p className={cn(nativeLanguage && 'mt-1')}><span className="font-semibold">Speaks:</span> <span className="capitalize text-muted-foreground">{otherLanguages.join(', ')}</span></p>}
                                </div>
                            </div>
                        )}
                    </div>
                    {host.profile.achievements && host.profile.achievements.length > 0 && (
                        <>
                        <Separator className="my-4" />
                        <h4 className="font-semibold mb-2 text-sm">Achievements</h4>
                        <div className="flex flex-wrap gap-2">
                            {host.profile.achievements.map((achievement) => (
                            <Badge key={achievement} variant="outline" className="font-normal py-1">
                                <Trophy className="h-4 w-4 mr-2 text-amber-500"/>
                                {achievement}
                            </Badge>
                            ))}
                        </div>
                        </>
                    )}
                    {host.profile.hostingStyles && host.profile.hostingStyles.length > 0 && (
                        <>
                        <Separator className="my-4" />
                        <h4 className="font-semibold mb-2 text-sm">Hosting Style</h4>
                        <div className="flex flex-wrap gap-2">
                            {host.profile.hostingStyles.map(style => <Badge key={style} variant="secondary">{style}</Badge>)}
                        </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="p-6 border rounded-xl shadow-sm bg-card">
                    <h3 className="font-headline text-xl font-semibold mb-4">About</h3>
                    <div className="space-y-4 text-sm">
                        {nativeLanguage ? (
                        <div className="flex items-start gap-3">
                            <Languages className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                            <p><span className="font-semibold">Native Language:</span> <span className="capitalize text-muted-foreground">{nativeLanguage}</span></p>
                            </div>
                        </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">This user hasn't shared many details yet.</p>
                        )}
                    </div>
                </div>
            )}

            <div className="p-6 border rounded-xl shadow-sm bg-card">
                <h3 className="font-headline text-xl font-semibold">Contact & Links</h3>
                <div className="space-y-4 mt-4 text-sm">
                    {user.website && (
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                            <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <span className="truncate">{user.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                    )}
                    {user.socialMedia?.twitter && (
                        <a href={user.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                            <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <span className="truncate">@{getUsername(user.socialMedia.twitter)}</span>
                        </a>
                    )}
                    {user.socialMedia?.instagram && (
                        <a href={user.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                            <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <span className="truncate">@{getUsername(user.socialMedia.instagram)}</span>
                        </a>
                    )}
                    {user.socialMedia?.facebook && (
                        <a href={user.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                            <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <span className="truncate">{getUsername(user.socialMedia.facebook)}</span>
                        </a>
                    )}
                    {!user.website && !user.socialMedia?.twitter && !user.socialMedia?.instagram && !user.socialMedia?.facebook && (
                        <p className="text-muted-foreground">No social links provided.</p>
                    )}
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
}

export default UserProfilePage;
