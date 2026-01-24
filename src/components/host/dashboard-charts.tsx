
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useMemo } from 'react';
import { format } from 'date-fns';
import { Booking } from '@/lib/types';

export function BookingsChart({ bookings }: { bookings: Booking[] }) {
    const data = useMemo(() => {
        if (!bookings) return [];
        const counts = bookings.reduce((acc, booking) => {
            if (!booking.createdAt) return acc;
            const date = booking.createdAt.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);
            const month = format(date, 'MMM yyyy');
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const sortedMonths = Object.keys(counts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        
        return sortedMonths.map(month => ({
            month,
            bookings: counts[month],
        }));
    }, [bookings]);

    const chartConfig = {
        bookings: {
            label: "Bookings",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Bookings Overview</CardTitle>
                <CardDescription>Your booking volume over the last few months.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false}/>
                         <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export function EarningsChart({ bookings }: { bookings: Booking[] }) {
    const data = useMemo(() => {
        if (!bookings) return [];
        const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');

        const earnings = confirmedBookings.reduce((acc, booking) => {
            if (!booking.bookingDate) return acc;
            const date = booking.bookingDate.toDate ? booking.bookingDate.toDate() : new Date(booking.bookingDate);
            const month = format(date, 'MMM yyyy');
            acc[month] = (acc[month] || 0) + booking.totalPrice;
            return acc;
        }, {} as Record<string, number>);

        const sortedMonths = Object.keys(earnings).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        
        return sortedMonths.map(month => ({
            month,
            earnings: earnings[month],
        }));
    }, [bookings]);

    const chartConfig = {
        earnings: {
            label: "Earnings",
            color: "hsl(var(--accent))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Earnings</CardTitle>
                <CardDescription>Your monthly payout from confirmed bookings.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={8}
                            tickFormatter={(value) => `$${value}`}
                        />
                         <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="earnings" fill="var(--color-earnings)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
