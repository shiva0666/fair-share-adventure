
import React from "react";
import { Participant } from "@/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ParticipantListProps {
  participants: Array<Participant | Omit<Participant, 'id' | 'balance'>>;
  onRemoveParticipant: (index: number) => void;
  maxHeight?: string;
}

export const ParticipantList = ({ 
  participants, 
  onRemoveParticipant,
  maxHeight = "12rem" 
}: ParticipantListProps) => {
  if (participants.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No participants added yet.
      </div>
    );
  }

  return (
    <ScrollArea className={`w-full rounded-md border max-h-[${maxHeight}]`}>
      <div className="p-1">
        {participants.map((participant, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{participant.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{participant.name}</p>
                {participant.email && (
                  <p className="text-xs text-muted-foreground">{participant.email}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveParticipant(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
