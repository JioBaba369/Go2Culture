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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [brandName, setBrandName] = useState('');
  const [cityCountry, setCityCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill out all required fields.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const fullName = `${firstName} ${lastName}`;
      await updateProfile(user, { displayName: fullName });

      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        role: 'guest',
        fullName,
        email: user.email,
        phone,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profilePhotoId: 'guest-1',
      });

      toast({ title: "Account Created", description: "Welcome to Go2Culture! Let's get your host profile started." });
      router.push('/become-a-host/apply');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "Could not create your account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-lg w-full">
        <CardHeader className="text-center">
            <Logo className="mb-4 justify-center" />
          <CardTitle className="text-3xl font-bold font-headline">Let's get to know each other</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            We want to know more about you! First, fill in your basic contact details. This information will be private and will only be visible to the Go2Culture team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm mb-6">
            Do you already have a Go2Culture account?{" "}
            <Link href="/login" className="underline font-medium">
              Log in now
            </Link>
          </div>
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
                <Label htmlFor="phone">Your phone number</Label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +33 6 54 32 10 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="language">What is your native language?</Label>
                <Select onValueChange={setNativeLanguage} value={nativeLanguage} disabled={isLoading}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="mandarin">Mandarin</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="arabic">Arabic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">You can speak, read and write in this language.</p>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="brand-name">Your brand name (if you have one)</Label>
                <Input
                    id="brand-name"
                    placeholder="Your brand name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    disabled={isLoading}
                />
                 <p className="text-xs text-muted-foreground">Your brand name will be displayed for other users and guests to see.</p>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="city-country">City and country where you will host your events</Label>
                <Input
                    id="city-country"
                    placeholder="City, Country"
                    value={cityCountry}
                    onChange={(e) => setCityCountry(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Your email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@go2culture.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Your password</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="•••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
            </div>
            <div className="flex items-center justify-between mt-4">
              <Button variant="link" asChild className="p-0 h-auto">
                <Link href="/">Back</Link>
              </Button>
              <Button onClick={handleSignup} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
