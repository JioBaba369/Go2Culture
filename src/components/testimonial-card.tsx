
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { Review, User } from "@/lib/types";
import { doc } from "firebase/firestore";
import { Star } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface TestimonialCardProps {
  review: Review;
}

export function TestimonialCard({ review }: TestimonialCardProps) {
  const firestore = useFirestore();
  const authorRef = useMemoFirebase(
    () => (firestore && review.guestId ? doc(firestore, 'users', review.guestId) : null),
    [firestore, review.guestId]
  );
  const { data: author, isLoading } = useDoc<User>(authorRef);

  if (isLoading || !author) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex mb-2">
            {[...Array(5)].map((_,i) => <Skeleton key={i} className="h-5 w-5" />)}
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5 mb-4" />
          <div className="flex items-center gap-3 mt-6 pt-4 border-t">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const stars = Array(5).fill(0).map((_, i) => i < review.rating);
  const authorImage = PlaceHolderImages.find(p => p.id === author.profilePhotoId);

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex mb-2">
            {stars.map((isFilled, i) => (
              <Star key={i} className={`h-5 w-5 ${isFilled ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`} />
            ))}
          </div>
          <blockquote className="italic text-muted-foreground text-base">
            "{review.comment}"
          </blockquote>
        </div>
        <div className="flex items-center gap-3 mt-6 pt-4 border-t">
          <Avatar>
            {authorImage && <AvatarImage src={authorImage.imageUrl} alt={author.fullName} />}
            <AvatarFallback>{author.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="font-semibold">{author.fullName}</p>
        </div>
      </CardContent>
    </Card>
  );
}
