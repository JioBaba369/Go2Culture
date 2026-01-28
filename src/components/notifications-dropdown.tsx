
'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, writeBatch, doc } from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, MessageSquare, Star, CalendarCheck, AlertTriangle, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function getNotificationDetails(notification: Notification): { icon: React.ElementType, message: string, link: string } {
    const { type, entityId } = notification;

    switch (type) {
        case 'BOOKING_CONFIRMED':
            return {
                icon: CalendarCheck,
                message: "A booking has been confirmed. Your host is waiting!",
                link: `/profile/bookings`
            };
        case 'BOOKING_REQUESTED':
             return {
                icon: CalendarCheck,
                message: "You have a new booking request.",
                link: `/host/bookings`
            };
        case 'BOOKING_CANCELLED':
            return {
                icon: CalendarCheck,
                message: "A booking has been cancelled.",
                link: `/profile/bookings`
            };
        case 'NEW_MESSAGE':
            return {
                icon: MessageSquare,
                message: "You have a new message.",
                link: `/messages?id=${entityId}`
            };
        case 'HOST_APPROVED':
            return {
                icon: Star,
                message: "Congratulations, you're now a host! Time to share your story.",
                link: '/host/experiences'
            };
        case 'REVIEW_RECEIVED':
             return {
                icon: Star,
                message: "You've received a new review.",
                link: `/experiences/${entityId}`
            };
        case 'RESCHEDULE_REQUEST':
            return {
                icon: CalendarCheck,
                message: "A guest has requested to reschedule.",
                link: '/host/bookings'
            };
        case 'RESCHEDULE_RESPONSE':
            return {
                icon: CalendarCheck,
                message: "A host has responded to your reschedule request.",
                link: '/profile/bookings'
            };
        case 'NEW_REFERRAL':
            return {
                icon: Users,
                message: "A friend has joined using your referral link!",
                link: '/profile/referrals'
            };
        case 'EMAIL_VERIFICATION_PENDING':
            return {
                icon: AlertTriangle,
                message: "Please verify your email address to complete your registration.",
                link: '/profile'
            };
        default:
            return {
                icon: AlertTriangle,
                message: "You have a new notification.",
                link: '/profile'
            };
    }
}


export function NotificationsDropdown() {
    const { user, firestore } = useFirebase();
    const { toast } = useToast();

    const notificationsQuery = useMemoFirebase(
        () => (user && firestore ? query(
            collection(firestore, 'users', user.uid, 'notifications'),
            orderBy('createdAt', 'desc')
        ) : null),
        [user, firestore]
    );

    const { data: notifications } = useCollection<Notification>(notificationsQuery);

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

    const handleMarkAllAsRead = async () => {
        if (!user || !firestore || !notifications || unreadCount === 0) return;

        const batch = writeBatch(firestore);
        notifications.forEach(notification => {
            if (!notification.isRead) {
                const notifRef = doc(firestore, 'users', user.uid, 'notifications', notification.id);
                batch.update(notifRef, { isRead: true });
            }
        });

        try {
            await batch.commit();
            toast({ title: "Notifications marked as read." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not mark notifications as read." });
        }
    };
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary-foreground/10">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute top-1 right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                    Notifications
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications && notifications.length > 0 ? (
                    notifications.map(notif => {
                        const { icon: Icon, message, link } = getNotificationDetails(notif);
                        return (
                            <DropdownMenuItem key={notif.id} asChild className="cursor-pointer whitespace-normal">
                               <Link href={link}>
                                 <div className="flex items-start gap-3 p-2">
                                    <Icon className={`h-4 w-4 mt-1 flex-shrink-0 ${!notif.isRead ? 'text-primary' : 'text-muted-foreground'}`}/>
                                    <div className="flex flex-col gap-1">
                                        <p className={!notif.isRead ? 'font-semibold' : ''}>{message}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                                        </p>
                                    </div>
                                </div>
                               </Link>
                            </DropdownMenuItem>
                        )
                    })
                ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications right now.
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
