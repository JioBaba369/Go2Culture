
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, serverTimestamp, setDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { createNotification } from '@/lib/notification-actions';

export function SignupForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = () => {
    if (!firstName || !lastName || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill out all fields.',
      });
      return;
    }
    setIsLoading(true);
    const refCode = searchParams.get('ref');

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const fullName = `${firstName} ${lastName}`;
        
        await Promise.all([
            updateProfile(user, { displayName: fullName }),
            sendEmailVerification(user)
        ]);

        const userRef = doc(firestore, 'users', user.uid);
        const referralCode = user.uid.substring(0, 8).toUpperCase();
        
        const userData: any = {
          id: user.uid,
          role: 'guest',
          fullName,
          email: user.email,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          profilePhotoId: 'guest-1',
          termsAccepted: true,
          referralCode: referralCode,
          referralCredit: 0,
        };

        if (refCode) {
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('referralCode', '==', refCode), limit(1));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const referrer = querySnapshot.docs[0];
            const referrerId = referrer.id;
            userData.referredBy = referrerId;
            
            const referredUserRef = doc(firestore, 'users', referrerId, 'referredUsers', user.uid);
            await setDoc(referredUserRef, {
                id: user.uid,
                fullName: fullName,
                profilePhotoId: 'guest-1',
                status: 'joined',
                createdAt: serverTimestamp()
            });

            await createNotification(
                firestore,
                referrerId,
                'NEW_REFERRAL',
                user.uid
            );
          }
        }

        await setDoc(userRef, userData);
        await createNotification(firestore, user.uid, 'EMAIL_VERIFICATION_PENDING', user.uid);
      })
      .then(() => {
        toast({ title: "Account Created!", description: "Welcome to Go2Culture. Please check your email to verify your account." });
        router.push('/profile');
      })
      .catch((error: any) => {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: error.message || "Could not create your account. Please try again.",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
            <Logo className="mb-4 justify-center" />
          <CardTitle className="text-2xl font-bold font-headline">Create your account</CardTitle>
          <CardDescription>
            Join our community to host or discover unique cultural experiences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input 
                    id="first-name" 
                    placeholder="Your first name" 
                    required 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                  />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input 
                    id="last-name" 
                    placeholder="Your last name" 
                    required 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                  />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="6+ characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
            </div>
            <Button onClick={handleSignup} className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <p className="px-8 text-center text-xs text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-primary">
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-primary">
                    Privacy Policy
                </Link>
                .
            </p>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
  );
}
