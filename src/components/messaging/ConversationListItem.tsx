'use client';

import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { Conversation } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
}

export function ConversationListItem({ conversation, isSelected }: ConversationListItemProps) {
  const { user } = useFirebase();
  const otherParticipantId = conversation.participants.find(p => p !== user?.uid);
  
  if (!otherParticipantId || !user) return null;
  
  const otherParticipantInfo = conversation.participantInfo[otherParticipantId];
  const lastMessage = conversation.lastMessage;
  const isUnread = !!(lastMessage && lastMessage.senderId !== user.uid && !conversation.readBy?.includes(user.uid));
  
  const participantImage = PlaceHolderImages.find(p => p.id === otherParticipantInfo.profilePhotoId);

  return (
    <Link href={`/messages?id=${conversation.id}`} className={cn(
      "block p-3 rounded-lg transition-colors",
      isSelected ? "bg-muted" : "hover:bg-muted/50"
    )}>
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {participantImage && <AvatarImage src={participantImage.imageUrl} alt={otherParticipantInfo.fullName} />}
          <AvatarFallback>{otherParticipantInfo.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold truncate">{otherParticipantInfo.fullName}</h3>
            {lastMessage.timestamp && (
              <p className="text-xs text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(lastMessage.timestamp.toDate(), { addSuffix: true })}
              </p>
            )}
          </div>
          <p className={cn(
            "text-sm text-muted-foreground truncate",
            isUnread && "font-bold text-foreground"
          )}>
            {lastMessage.senderId === user.uid && 'You: '}{lastMessage.text}
          </p>
        </div>
        {isUnread && <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 self-center" />}
      </div>
    </Link>
  );
}
