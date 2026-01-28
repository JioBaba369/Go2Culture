import { Suspense } from 'react';
import { SignupForm } from '@/app/signup/signup-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';


export default function SignupPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <Suspense fallback={<SignupSkeleton />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}

function SignupSkeleton() {
    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader className="text-center">
                <Logo className="mb-4 justify-center" />
                <CardTitle className="text-2xl font-bold font-headline">Create your account</CardTitle>
                <CardDescription>
                    Join our community to host or discover unique cultural experiences.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
}
