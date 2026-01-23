
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
import Link from "next/link";
import { experiences } from "@/lib/data";
import { MoreHorizontal, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { format } from 'date-fns';

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive" | null | undefined> = {
  live: "default",
  paused: "secondary",
  draft: "outline",
};

export default function AdminExperiencesPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-headline font-bold">Experiences</h1>
        <p className="text-muted-foreground">Manage all experiences on the platform.</p>
       </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        <h2 className="text-xl font-semibold">All Experiences</h2>
        {experiences.map((exp) => {
          const hostImage = PlaceHolderImages.find(p => p.id === exp.host.profilePhotoId);
          return (
            <Card key={exp.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold">{exp.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-5 w-5">
                      {hostImage && <AvatarImage src={hostImage.imageUrl} alt={exp.host.name} data-ai-hint={hostImage.imageHint} />}
                      <AvatarFallback>{exp.host.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{exp.host.name}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                       <Link href={`/experiences/${exp.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Eye className="h-4 w-4" /> View Experience
                       </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Pause Listing</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant={statusVariantMap[exp.status]} className="capitalize">
                  {exp.status}
                </Badge>
                <p className="font-semibold">${exp.pricing.pricePerGuest}</p>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Experiences</CardTitle>
          <CardDescription>
            A list of all experiences created by hosts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Experience</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.map((exp) => {
                const hostImage = PlaceHolderImages.find(p => p.id === exp.host.profilePhotoId);
                return (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">
                      <div className="grid gap-0.5">
                          <span className="font-semibold">{exp.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Avatar className="h-8 w-8">
                            {hostImage && <AvatarImage src={hostImage.imageUrl} alt={exp.host.name} data-ai-hint={hostImage.imageHint} />}
                            <AvatarFallback>{exp.host.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{exp.host.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{exp.location.suburb}, {exp.location.country}</TableCell>
                     <TableCell>${exp.pricing.pricePerGuest}</TableCell>
                    <TableCell>
                      {format(new Date(exp.createdAt), 'PP')}
                    </TableCell>
                     <TableCell>
                      <Badge variant={statusVariantMap[exp.status]} className="capitalize">
                        {exp.status}
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
                             <Link href={`/experiences/${exp.id}`} className="flex items-center gap-2 cursor-pointer">
                                <Eye className="h-4 w-4" /> View Experience
                             </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Pause Listing</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
