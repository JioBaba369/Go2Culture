'use client';
import { useState } from 'react';
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import { Story } from "@/lib/types";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Loader2, Check, X, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_UID } from "@/lib/auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

export default function AdminStoriesPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const isAdmin = user?.uid === ADMIN_UID;

  const storiesQuery = useMemoFirebase(
    () => (firestore && isAdmin ? collection(firestore, 'stories') : null),
    [firestore, isAdmin]
  );
  const { data: stories, isLoading } = useCollection<Story>(storiesQuery);

  const [updatingStoryId, setUpdatingStoryId] = useState<string | null>(null);

  const handleUpdateStatus = async (storyId: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    setUpdatingStoryId(storyId);
    try {
      const storyRef = doc(firestore, 'stories', storyId);
      await updateDoc(storyRef, { status });
      toast({
        title: "Story Status Updated",
        description: `The story has been ${status}.`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update the story status."
      });
    } finally {
      setUpdatingStoryId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">User Stories</h1>
        <p className="text-muted-foreground">Review and approve user-submitted stories.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stories</CardTitle>
          <CardDescription>A list of all stories submitted by users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))}
              {!isLoading && stories?.map((story) => {
                const isUpdatingThis = updatingStoryId === story.id;
                return (
                <TableRow key={story.id}>
                  <TableCell className="font-medium">{story.authorName}</TableCell>
                  <TableCell>{story.title}</TableCell>
                  <TableCell>{story.createdAt?.toDate ? format(story.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[story.status]} className="capitalize">{story.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isUpdatingThis}>
                            {isUpdatingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DialogTrigger asChild>
                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Story</DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuSeparator />
                          {story.status !== 'approved' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(story.id, 'approved')}>
                              <Check className="mr-2 h-4 w-4" />Approve
                            </DropdownMenuItem>
                          )}
                          {story.status !== 'rejected' && (
                            <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateStatus(story.id, 'rejected')}>
                              <X className="mr-2 h-4 w-4" />Reject
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                              <DialogTitle>{story.title}</DialogTitle>
                              <DialogDescription>By {story.authorName}</DialogDescription>
                          </DialogHeader>
                          <div className="prose prose-sm max-w-none mt-4 whitespace-pre-line text-muted-foreground">
                            {story.content}
                          </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              )})}
              {!isLoading && (!stories || stories.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No stories submitted yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
