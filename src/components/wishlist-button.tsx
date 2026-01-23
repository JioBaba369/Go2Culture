
'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
        title: 'Please log in',
        description: 'You need to be logged in to save experiences to your wishlist.',
        variant: 'destructive',
      });
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    setIsProcessing(true);
    const docRef = doc(firestore, 'users', user.uid, 'wishlist', experienceId);

    try {
      if (isWishlisted) {
        // Optimistically update UI
        setIsWishlisted(false);
        await deleteDoc(docRef);
        toast({ title: 'Removed from wishlist' });
      } else {
        // Optimistically update UI
        setIsWishlisted(true);
        await setDoc(docRef, { createdAt: serverTimestamp() });
        toast({ title: 'Added to wishlist!' });
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsWishlisted(!isWishlisted);
      console.error('Failed to update wishlist:', error);
      toast({
        title: 'Something went wrong',
        description: 'Could not update your wishlist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
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
