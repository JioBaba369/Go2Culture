
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HostExperiencesPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Experiences</CardTitle>
                <CardDescription>Manage your current listings and create new ones.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You will be able to manage your experiences from here. This feature is coming soon!</p>
            </CardContent>
        </Card>
    );
}
