
'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { logAudit } from '@/lib/audit-actions';
import { User as AppUser } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface WishlistButtonProps {
  experienceId: string;
  className?: string;
}

export function WishlistButton({ experienceId, className }: WishlistButtonProps) {
  const { user, firestore, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const wishlistItemRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'wishlist', experienceId) : null),
    [user, firestore, experienceId]
  );
  const { data: wishlistItem, isLoading: isWishlistLoading } = useDoc(wishlistItemRef);
  
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsWishlisted(!!wishlistItem);
  }, [wishlistItem]);

  const handleToggleWishlist = async () => {
    if (isUserLoading || !firestore) return;

    if (!user) {
      toast({
        title: 'Please Log In',
        description: 'You need to be logged in to save experiences to your wishlist.',
        variant: 'destructive',
      });
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    setIsProcessing(true);
    const docRef = doc(firestore, 'users', user.uid, 'wishlist', experienceId);
    
    // Fetch user profile for audit logging
    const userProfileSnap = await getDoc(doc(firestore, 'users', user.uid));
    if (!userProfileSnap.exists()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find your user profile.'});
        setIsProcessing(false);
        return;
    }
    const actorProfile = userProfileSnap.data() as AppUser;

    if (isWishlisted) {
      // Optimistically update UI
      setIsWishlisted(false);
      deleteDoc(docRef)
        .then(() => {
          toast({ title: 'Removed from wishlist' });
          logAudit(firestore, { actor: actorProfile, action: 'REMOVE_FROM_WISHLIST', target: { type: 'experience', id: experienceId } });
        })
        .catch(serverError => {
          // Revert optimistic update on error
          setIsWishlisted(true);
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete'
          }));
        })
        .finally(() => setIsProcessing(false));
    } else {
      // Optimistically update UI
      setIsWishlisted(true);
      const data = { createdAt: serverTimestamp() };
      setDoc(docRef, data)
        .then(() => {
          toast({ title: 'Added to wishlist!' });
          logAudit(firestore, { actor: actorProfile, action: 'ADD_TO_WISHLIST', target: { type: 'experience', id: experienceId } });
        })
        .catch(serverError => {
          // Revert optimistic update on error
          setIsWishlisted(false);
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'create',
            requestResourceData: data
          }));
        })
        .finally(() => setIsProcessing(false));
    }
  };
  
  const isLoading = isUserLoading || isWishlistLoading;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-9 w-9 rounded-full bg-background/70 hover:bg-background', className)}
      onClick={handleToggleWishlist}
      disabled={isLoading || isProcessing}
      aria-label="Add to wishlist"
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-all',
          isWishlisted ? 'text-red-500 fill-red-500' : 'text-foreground'
        )}
      />
    </Button>
  );
}
