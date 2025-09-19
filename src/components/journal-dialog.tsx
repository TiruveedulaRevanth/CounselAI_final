
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
import { Textarea } from "./ui/textarea";
import { BookText } from "lucide-react";
import type { UserContext, ChatJournal } from "@/ai/schemas/journal";

interface JournalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  userContext: UserContext | null;
  chatJournal: ChatJournal | null;
  userEntries: string;
  onUserEntriesChange: (entries: string) => void;
}

export default function JournalDialog({
  isOpen,
  onOpenChange,
  userContext,
  chatJournal,
  userEntries,
  onUserEntriesChange,
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
            A space for your thoughts and the AI's analysis of your progress.
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
                    <JournalSection title="Core Struggles" content={userContext?.struggles} />
                    
                    <h2 className="text-lg font-semibold text-primary pt-4 mt-4 border-t">Current Chat</h2>
                    <JournalSection title="Suggested Solutions" content={chatJournal?.suggestedSolutions} />
                    <JournalSection title="Progress Summary" content={chatJournal?.progressSummary} />
                </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="patient" className="flex-1 min-h-0 mt-4">
             <Textarea
                placeholder="Write your thoughts here... Your entries are saved automatically."
                className="h-full w-full resize-none text-base"
                value={userEntries}
                onChange={(e) => onUserEntriesChange(e.target.value)}
            />
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
