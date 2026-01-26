'use client';

import React, { useState, useMemo } from 'react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Experience, Booking } from "@/lib/types";
import { MoreHorizontal, Star, Utensils, CalendarCheck, Edit, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ADMIN_UID } from '@/lib/auth';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


const roleVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive" | null | undefined> = {
  host: "secondary",
  guest: "outline",
  both: "default",
};

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive" | null | undefined> = {
  active: "default",
  suspended: "destructive",
  deleted: "destructive"
};


export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { data: users, isLoading: areUsersLoading } = useCollection<User>(useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]));
  const { data: experiences, isLoading: areExperiencesLoading } = useCollection<Experience>(useMemoFirebase(() => firestore ? collection(firestore, 'experiences') : null, [firestore]));
  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(useMemoFirebase(() => firestore ? collection(firestore, 'bookings') : null, [firestore]));

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const isLoading = areUsersLoading || areExperiencesLoading || areBookingsLoading;
  
  const enrichedUsers = useMemo(() => {
    if (!users || !experiences || !bookings) return [];

    const filteredUsers = users.filter(user => {
        const searchMatch = searchTerm ? 
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        
        const roleMatch = roleFilter !== 'all' ? user.role === roleFilter : true;
        const statusMatch = statusFilter !== 'all' ? user.status === statusFilter : true;
        
        return searchMatch && roleMatch && statusMatch;
    });

    return filteredUsers.map(user => {
      let hostData, guestData;

      if (user.role === 'host' || user.role === 'both') {
        const hostExperiences = experiences.filter(exp => exp.userId === user.id);
        const totalRatings = hostExperiences.reduce((acc, exp) => acc + (exp.rating.average * exp.rating.count), 0);
        const totalRatingCount = hostExperiences.reduce((acc, exp) => acc + exp.rating.count, 0);
        hostData = {
          experienceCount: hostExperiences.length,
          averageRating: totalRatingCount > 0 ? (totalRatings / totalRatingCount).toFixed(2) : 'N/A',
        };
      }

      if (user.role === 'guest' || user.role === 'both') {
        const guestBookings = bookings.filter(b => b.guestId === user.id);
        guestData = {
          bookingCount: guestBookings.length,
        };
      }
      
      return {
        ...user,
        hostData,
        guestData,
      }
    });

  }, [users, experiences, bookings, searchTerm, roleFilter, statusFilter]);


  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-headline font-bold">Users</h1>
        <p className="text-muted-foreground">Manage all users on the platform.</p>
       </div>
      
       <Card>
            <CardHeader>
                <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-end gap-4">
                <div className="grid gap-2 flex-grow w-full">
                    <Label htmlFor="search-user">Search by Name or Email</Label>
                    <Input
                        id="search-user"
                        placeholder="e.g. Maria or maria@go2culture.com"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid gap-2 w-full md:w-48">
                    <Label htmlFor="role-filter">Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger id="role-filter">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                            <SelectItem value="host">Host</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2 w-full md:w-48">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger id="status-filter">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="deleted">Deleted</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

      {/* Mobile Card View */}
       <div className="grid gap-4 md:hidden">
        <h2 className="text-xl font-semibold">All Users ({enrichedUsers.length})</h2>
        {isLoading && Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        {!isLoading && enrichedUsers.length > 0 ? (
            enrichedUsers?.map((user) => {
                const userImage = PlaceHolderImages.find(p => p.id === user.profilePhotoId);
                const isAdmin = user.id === ADMIN_UID;
                return (
                    <Card key={user.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                    {userImage && <AvatarImage src={userImage.imageUrl} alt={user.fullName} />}
                                    <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="font-semibold">{user.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-5 w-5" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem asChild><Link href={`/users/${user.id}`}><Eye className="mr-2 h-4 w-4"/>View Profile</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href={`/admin/users/${user.id}/edit`}><Edit className="mr-2 h-4 w-4"/>Edit User</Link></DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                {user.hostData && (
                                    <>
                                    <span className="flex items-center gap-1"><Utensils className="h-3.5 w-3.5"/>{user.hostData.experienceCount} Exp.</span>
                                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5"/>{user.hostData.averageRating} Rating</span>
                                    </>
                                )}
                                {user.guestData && (
                                    <span className="flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5"/>{user.guestData.bookingCount} Bookings</span>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant={roleVariantMap[user.role]} className="capitalize">{user.role}</Badge>
                                <Badge variant={statusVariantMap[user.status]} className="capitalize">{user.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{user.createdAt?.toDate ? format(user.createdAt.toDate(), 'PP') : ''}</p>
                        </div>
                    </Card>
                );
            })
        ) : (
             <Card className="text-center p-8">
                <p className="text-muted-foreground">No users match the current filters.</p>
            </Card>
        )}
      </div>
      
      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Users ({enrichedUsers.length})</CardTitle>
          <CardDescription>
            A list of all registered users, including guests and hosts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Experiences</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Avg. Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-10 w-full"/></TableCell></TableRow>
              ))}
              {!isLoading && enrichedUsers.length > 0 ? (
                enrichedUsers?.map((user) => {
                    const userImage = PlaceHolderImages.find(p => p.id === user.profilePhotoId);
                    const isAdmin = user.id === ADMIN_UID;
                    return (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                            {userImage && <AvatarImage src={userImage.imageUrl} alt={user.fullName} />}
                            <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-0.5">
                            <span className="font-semibold">{user.fullName}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                        </div>
                        </TableCell>
                        <TableCell>
                        <Badge variant={roleVariantMap[user.role]} className="capitalize">
                            {user.role}
                        </Badge>
                        </TableCell>
                        <TableCell>
                        {user.createdAt?.toDate ? format(user.createdAt.toDate(), 'PP') : ''}
                        </TableCell>
                        <TableCell>{user.hostData ? user.hostData.experienceCount : 'N/A'}</TableCell>
                        <TableCell>{user.guestData ? user.guestData.bookingCount : 'N/A'}</TableCell>
                        <TableCell>{user.hostData ? user.hostData.averageRating : 'N/A'}</TableCell>
                        <TableCell>
                        <Badge variant={statusVariantMap[user.status]} className="capitalize">
                            {user.status}
                        </Badge>
                        </TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/users/${user.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/users/${user.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                                </Link>
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    )
                })
              ) : (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                        No users match the current filters.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
