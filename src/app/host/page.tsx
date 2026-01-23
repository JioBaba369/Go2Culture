
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HostDashboardPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Welcome to your Host Dashboard!</CardTitle>
                <CardDescription>This is your space to manage everything related to your Go2Culture experiences.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>From here, you'll be able to view upcoming bookings, manage your experience listings, and block out dates on your calendar.</p>
                <div className="mt-4">
                    <Button asChild>
                        <Link href="/host/calendar">View Your Calendar</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
