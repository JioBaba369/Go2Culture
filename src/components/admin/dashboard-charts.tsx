
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { useMemo } from 'react';
import { format } from 'date-fns';
import { User, Experience } from '@/lib/types';

export function UsersChart({ users }: { users: User[] }) {
    const data = useMemo(() => {
        if (!users) return [];
        const counts = users.reduce((acc, user) => {
            if (!user.createdAt) return acc;
            const date = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
            const month = format(date, 'MMM yyyy');
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const sortedMonths = Object.keys(counts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        
        return sortedMonths.map(month => ({
            month,
            users: counts[month],
        }));
    }, [users]);

    const chartConfig = {
        users: {
            label: "New Users",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>New Users</CardTitle>
                <CardDescription>New user sign-ups over the last few months.</CardDescription>
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
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                         <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="users" fill="var(--color-users)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export function ExperiencesChart({ experiences }: { experiences: Experience[] }) {
    const data = useMemo(() => {
        if (!experiences) return [];
        const counts = experiences.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
        }));
    }, [experiences]);

    const chartConfig = {
        "In-Home Dining": {
            label: "In-Home Dining",
            color: "hsl(var(--primary))",
        },
        "Cooking Class": {
            label: "Cooking Class",
            color: "hsl(var(--accent))",
        },
        "Special Event": {
            label: "Special Event",
            color: "hsl(var(--secondary))",
        },
        "Restaurant Experience": {
            label: "Restaurant",
            color: "hsl(var(--muted-foreground))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Experience Categories</CardTitle>
                <CardDescription>Distribution of all experiences by category.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="h-64">
                    <PieChart>
                       <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50}>
                             {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
