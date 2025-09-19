
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { BookText } from "lucide-react";
import type { UserContext, ChatJournal } from "@/ai/schemas/journal";
import { format } from "date-fns";

export type UserJournalEntry = {
    id: string;
    date: number;
    summary: string;
}

interface JournalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  userContext: UserContext | null;
  chatJournal: ChatJournal | null;
  userEntries: UserJournalEntry[];
}

export default function JournalDialog({
  isOpen,
  onOpenChange,
  userContext,
  chatJournal,
  userEntries,
}: JournalDialogProps) {
    
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookText />
            My Journal
          </DialogTitle>
          <DialogDescription>
            A space for the AI's analysis of your progress and a log of your summarized thoughts.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="therapist" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="therapist">AI Therapist's Notes</TabsTrigger>
            <TabsTrigger value="patient">My Entries</TabsTrigger>
          </TabsList>
          <TabsContent value="therapist" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-primary">Long-Term Context</h2>
                    <JournalSection title="Personality" content={userContext?.personality} />
                    <JournalSection title="Strengths" content={userContext?.strengths} />
                    <JournalSection title="Core Problems" content={userContext?.problems} />
                    
                    <h2 className="text-lg font-semibold text-primary pt-4 mt-4 border-t">Current Chat</h2>
                    <JournalSection title="Suggested Solutions" content={chatJournal?.suggestedSolutions} />
                    <JournalSection title="Progress Summary" content={chatJournal?.progressSummary} />
                </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="patient" className="flex-1 min-h-0 mt-4">
             <ScrollArea className="h-full pr-4">
                {userEntries.length > 0 ? (
                    <div className="space-y-4">
                        {userEntries.map(entry => (
                            <div key={entry.id} className="border-l-2 border-primary pl-3">
                                <p className="text-xs font-semibold text-muted-foreground">{format(new Date(entry.date), "MMMM d, yyyy - h:mm a")}</p>
                                <p className="text-sm">{entry.summary}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-muted-foreground">Your summarized thoughts will appear here as you chat.</p>
                    </div>
                )}
             </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}


interface JournalSectionProps {
    title: string;
    content?: string | null;
}

const JournalSection = ({ title, content }: JournalSectionProps) => (
    <div>
        <h3 className='font-semibold mb-1'>{title}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content || "Not yet analyzed."}</p>
    </div>
);
