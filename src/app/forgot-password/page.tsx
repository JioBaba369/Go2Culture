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
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email is required",
        description: "Please enter your email address.",
      });
      return;
    }
    setIsLoading(true);
    setIsSent(false);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for instructions to reset your password.",
      });
    } catch (error: any) {
      console.error(error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/user-not-found') {
        description = "No user found with this email address.";
      }
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
            <Logo className="mb-4 justify-center" />
          <CardTitle className="text-2xl font-bold font-headline">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-muted-foreground">An email has been sent to <span className="font-semibold text-foreground">{email}</span>. Please follow the instructions in the email to reset your password.</p>
                <Button asChild variant="secondary">
                    <Link href="/login">Back to Login</Link>
                </Button>
            </div>
          ) : (
            <div className="grid gap-4">
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
                <Button onClick={handleResetPassword} className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
                </Button>
            </div>
          )}
          {!isSent && (
            <div className="mt-4 text-center text-sm">
                Remember your password?{" "}
                <Link href="/login" className="underline">
                Log in
                </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
