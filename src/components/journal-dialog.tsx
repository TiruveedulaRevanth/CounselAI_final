
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
import type { Journal } from "@/ai/schemas/journal";

interface JournalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  journal: Journal;
  userEntries: string;
  onUserEntriesChange: (entries: string) => void;
}

export default function JournalDialog({
  isOpen,
  onOpenChange,
  journal,
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
                    <JournalSection title="Personality" content={journal.personality} />
                    <JournalSection title="Strengths" content={journal.strengths} />
                    <JournalSection title="Struggles" content={journal.struggles} />
                    <JournalSection title="Suggested Solutions" content={journal.suggestedSolutions} />
                    <JournalSection title="Progress Summary" content={journal.progressSummary} isProgress={true} />
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
    content: string;
    isProgress?: boolean;
}

const JournalSection = ({ title, content, isProgress=false }: JournalSectionProps) => (
    <div>
        <h3 className={`font-semibold mb-1 ${isProgress ? 'text-primary' : ''}`}>{title}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
    </div>
);
