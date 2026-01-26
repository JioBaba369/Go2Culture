'use client';

import { format } from "date-fns";
import type { Review, User } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export function ReviewItem({ review }: { review: Review }) {
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
