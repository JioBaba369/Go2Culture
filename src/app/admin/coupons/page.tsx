
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { Coupon } from "@/lib/types";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteCoupon } from "@/lib/admin-actions";
import { ADMIN_UID } from "@/lib/auth";

const couponSchema = z.object({
    id: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
    description: z.string().min(1, "Description is required."),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.coerce.number().min(1, "Discount value must be at least 1."),
    expiresAt: z.date().optional(),
    isActive: z.boolean().default(true),
    minSpend: z.coerce.number().optional(),
    usageLimit: z.coerce.number().optional(),
});
type CouponFormValues = z.infer<typeof couponSchema>;

function CouponForm({ coupon, onFinished }: { coupon?: Coupon, onFinished: () => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const methods = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            id: coupon?.id || '',
            description: coupon?.description || '',
            discountType: coupon?.discountType || 'fixed',
            discountValue: coupon?.discountValue || 10,
            expiresAt: coupon?.expiresAt?.toDate ? coupon.expiresAt.toDate() : undefined,
            isActive: coupon?.isActive ?? true,
            minSpend: coupon?.minSpend || 0,
            usageLimit: coupon?.usageLimit || 0,
        },
    });
    
    async function onSubmit(data: CouponFormValues) {
        if (!firestore) return;
        setIsLoading(true);

        try {
            const couponRef = doc(firestore, 'coupons', data.id);
            // Firestore doesn't support `undefined`, so we need to handle optional fields.
            const { expiresAt, ...restOfData } = data;
            const couponData: Record<string, any> = { 
                ...restOfData,
                minSpend: data.minSpend || 0,
                usageLimit: data.usageLimit || 0,
            };

            if (expiresAt) {
                couponData.expiresAt = expiresAt;
            }

            if (coupon) {
                // Update existing coupon
                await updateDoc(couponRef, couponData);
                toast({ title: "Coupon Updated", description: `Coupon "${data.id}" has been saved.` });
            } else {
                // Create new coupon
                await setDoc(couponRef, { ...couponData, timesUsed: 0 });
                toast({ title: "Coupon Created", description: `Coupon "${data.id}" is now active.` });
            }
            onFinished();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Operation Failed",
                description: error.message || 'An unknown error occurred while saving the coupon.'
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={methods.control} name="id" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Coupon Code</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g., WELCOME10" disabled={!!coupon} /></FormControl>
                        <FormDescription>This is the code users will enter. Cannot be changed after creation.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={methods.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="e.g., 10% off for new users" /></FormControl><FormMessage /></FormItem>
                )} />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={methods.control} name="discountType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={methods.control} name="discountValue" render={({ field }) => (
                        <FormItem><FormLabel>Discount Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                      <FormField control={methods.control} name="minSpend" render={({ field }) => (
                        <FormItem><FormLabel>Minimum Spend ($)</FormLabel><FormControl><Input type="number" {...field} placeholder="0 for no minimum" /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={methods.control} name="usageLimit" render={({ field }) => (
                        <FormItem><FormLabel>Usage Limit</FormLabel><FormControl><Input type="number" {...field} placeholder="0 for unlimited" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <FormField control={methods.control} name="expiresAt" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Expiration Date</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>No expiration</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                        </PopoverContent>
                        </Popover>
                    <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={methods.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none"><FormLabel>Coupon is active</FormLabel><FormDescription>Inactive coupons cannot be applied by users.</FormDescription></div>
                    </FormItem>
                )} />
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {coupon ? 'Save Changes' : 'Create Coupon'}
                    </Button>
                </DialogFooter>
            </form>
        </FormProvider>
    )
}


export default function AdminCouponsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user?.uid === ADMIN_UID;
  const couponsQuery = useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'coupons') : null, [firestore, isAdmin]);
  const { data: coupons, isLoading } = useCollection<Coupon>(couponsQuery);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>(undefined);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const openForm = (coupon?: Coupon) => {
    setSelectedCoupon(coupon);
    setIsFormOpen(true);
  }

  const handleDelete = async () => {
    if (!couponToDelete || !firestore) return;
    setIsDeleting(true);
    try {
      await deleteCoupon(firestore, couponToDelete.id);
      toast({ title: "Coupon Deleted", description: `Coupon "${couponToDelete.id}" has been removed.` });
      setCouponToDelete(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline font-bold">Coupons</h1>
            <p className="text-muted-foreground">Create and manage discount codes for your platform.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => openForm()}>
                    <PlusCircle className="mr-2"/> Create Coupon
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
                    <DialogDescription>{selectedCoupon ? `Editing the "${selectedCoupon.id}" coupon.` : 'Fill out the details to create a new coupon.'}</DialogDescription>
                </DialogHeader>
                <CouponForm coupon={selectedCoupon} onFinished={() => setIsFormOpen(false)} />
            </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>A list of all promotional codes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 3}).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))}
              {!isLoading && coupons?.map((coupon) => (
                <TableRow key={coupon.id}>
                    <TableCell className="font-mono">{coupon.id}</TableCell>
                    <TableCell>{coupon.discountType === 'fixed' ? `$${coupon.discountValue}` : `${coupon.discountValue}%`}</TableCell>
                    <TableCell>{coupon.timesUsed} / {coupon.usageLimit || '∞'}</TableCell>
                    <TableCell>{coupon.expiresAt?.toDate ? format(coupon.expiresAt.toDate(), 'PPP') : 'Never'}</TableCell>
                    <TableCell>
                        <Badge variant={coupon.isActive ? 'default' : 'outline'}>{coupon.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openForm(coupon)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setCouponToDelete(coupon)}>
                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!coupons || coupons.length === 0) && (
                 <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No coupons created yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       <AlertDialog open={!!couponToDelete} onOpenChange={(open) => !open && setCouponToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the coupon <span className="font-mono font-semibold p-1 bg-muted rounded-sm mx-1">{couponToDelete?.id}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className={cn(buttonVariants({ variant: "destructive" }))}>
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Delete Coupon
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
