
'use client'

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import {
  UserContextSchema,
} from '@/ai/schemas/journal-entry';
import type { UserContext, ChatJournal, UserJournalEntry } from '@/ai/schemas/journal-entry';
import { BookText, Edit, Save, X, PlusCircle, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Separator } from './ui/separator';
import { generateJournalReflection } from '@/ai/flows/journal-reflection-flow';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';
import { FormDescription } from './ui/form';

interface JournalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  userContext: UserContext;
  setUserContext: (context: UserContext) => void;
  chatJournal: ChatJournal;
  userJournalEntries: UserJournalEntry[];
  setUserJournalEntries: (entries: (prev: UserJournalEntry[]) => UserJournalEntry[]) => void;
}

export default function JournalDialog({
  isOpen,
  onOpenChange,
  userContext,
  setUserContext,
  chatJournal,
  userJournalEntries,
  setUserJournalEntries
}: JournalDialogProps) {
    
  const [isEditingUserContext, setIsEditingUserContext] = useState(false);
  const [view, setView] = useState<'list' | 'new' | 'detail'>('list');
  const [selectedEntry, setSelectedEntry] = useState<UserJournalEntry | null>(null);

  const sortedEntries = [...userJournalEntries].sort((a, b) => b.date - a.date);
  
  useEffect(() => {
    // Reset view when dialog is closed
    if (!isOpen) {
      setView('list');
      setSelectedEntry(null);
      setIsEditingUserContext(false);
    }
  }, [isOpen]);

  const handleSelectEntry = (entry: UserJournalEntry) => {
    setSelectedEntry(entry);
    setView('detail');
  }

  const getActiveView = () => {
    switch (view) {
        case 'new':
            return <NewEntryForm 
                userContext={userContext} 
                setUserContext={setUserContext} 
                setUserJournalEntries={setUserJournalEntries}
                onBack={() => setView('list')} 
            />;
        case 'detail':
            return <EntryDetail entry={selectedEntry!} onBack={() => setView('list')} />;
        case 'list':
        default:
            return (
                <>
                    <Button onClick={() => setView('new')} className="mb-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Journal Entry
                    </Button>
                    <ScrollArea className="h-full pr-4">
                        {sortedEntries.length > 0 ? (
                            <div className="space-y-3">
                                {sortedEntries.map(entry => (
                                    <div key={entry.id} className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => handleSelectEntry(entry)}>
                                        <p className="text-sm font-semibold text-muted-foreground">{format(new Date(entry.date), "MMMM d, yyyy - h:mm a")}</p>
                                        <p className="mt-1 truncate">{(entry as any).summary || entry.shortTermContext?.concerns || 'No concerns noted'}</p>
                                    </div>
                                ))}
                            </div>
                        ): (
                            <p className="text-muted-foreground text-center py-8">Create your first journal entry to see it here.</p>
                        )}
                    </ScrollArea>
                </>
            );
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookText />
            My Journal
          </DialogTitle>
          <DialogDescription>
            A space to track your journey, review insights, and see your progress over time.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="my-entries" className="flex-1 flex flex-col min-h-0">
          <TabsList>
            <TabsTrigger value="long-term-context">Long-Term Context</TabsTrigger>
            <TabsTrigger value="current-chat-journal">Current Chat Notes</TabsTrigger>
            <TabsTrigger value="my-entries">My Entries</TabsTrigger>
          </TabsList>
          <TabsContent value="long-term-context" className="flex-1 flex flex-col min-h-0 mt-4">
             <UserContextEditor 
                isEditing={isEditingUserContext}
                setIsEditing={setIsEditingUserContext}
                userContext={userContext}
                setUserContext={setUserContext}
             />
          </TabsContent>
          <TabsContent value="current-chat-journal" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                    <ContextSection title="Suggested Solutions & Tools" content={chatJournal.suggestedSolutions} />
                    <ContextSection title="Progress in This Chat" content={chatJournal.progressSummary} />
                </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="my-entries" className="flex-1 min-h-0 mt-4 flex flex-col">
            {getActiveView()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

const NewEntryFormSchema = z.object({
  mood: z.string().min(1, 'Please enter your current mood.'),
  events: z.string().min(1, 'Please describe recent events or triggers.'),
  concerns: z.string().min(1, 'Please describe your current concerns.'),
  copingAttempts: z.string().min(1, 'Please describe your coping attempts.'),
});

const NewEntryForm = ({ 
    userContext, 
    setUserContext,
    setUserJournalEntries,
    onBack
} : { 
    userContext: UserContext,
    setUserContext: (context: UserContext) => void,
    setUserJournalEntries: (updater: (prev: UserJournalEntry[]) => UserJournalEntry[]) => void,
    onBack: () => void
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof NewEntryFormSchema>>({
    resolver: zodResolver(NewEntryFormSchema),
    defaultValues: {
      mood: '',
      events: '',
      concerns: '',
      copingAttempts: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof NewEntryFormSchema>) => {
    setIsSubmitting(true);
    toast({ title: 'AI is generating your reflection...', description: 'This may take a moment.' });
    try {
        const result = await generateJournalReflection({
            shortTermContext: data,
            longTermContext: userContext,
        });

        if (result.reflection && result.updatedLongTermContext) {
            const newEntry: UserJournalEntry = {
                id: `journal-${Date.now()}`,
                date: Date.now(),
                shortTermContext: data,
                reflection: result.reflection,
            };
            setUserJournalEntries(prev => [newEntry, ...prev]);
            setUserContext(result.updatedLongTermContext);
            toast({ title: 'Reflection Complete', description: 'Your new journal entry has been saved.' });
            onBack();
        } else {
            throw new Error('AI did not return a valid reflection.');
        }

    } catch (error) {
        console.error('Error generating journal reflection:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate AI reflection. Please try again.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
        <Button variant="ghost" onClick={onBack} className="self-start mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to entries
        </Button>
        <ScrollArea className="flex-1 pr-4 -mr-4">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="mood"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Current Mood / Emotion</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., Anxious, frustrated, hopeful..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="events"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Recent Events or Triggers</FormLabel>
                        <FormControl>
                            <Textarea placeholder="What happened today that's on your mind?" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="concerns"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Current Concerns / Focus</FormLabel>
                        <FormControl>
                            <Textarea placeholder="What are you most worried or thinking about right now?" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="copingAttempts"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Coping Attempts & Reactions</FormLabel>
                        <FormControl>
                            <Textarea placeholder="What did you try to do to handle this? How did it go?" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter className="sticky bottom-0 bg-background py-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Generating...' : 'Save & Get Reflection'}
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </ScrollArea>
    </div>
  );
};

const EntryDetail = ({ entry, onBack }: { entry: UserJournalEntry; onBack: () => void }) => {
    return (
        <div className="h-full flex flex-col">
            <Button variant="ghost" onClick={onBack} className="self-start mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to entries
            </Button>
            <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-6">
                    {entry.shortTermContext && (
                        <div>
                            <h3 className="text-lg font-semibold">Your Entry</h3>
                            <p className="text-sm text-muted-foreground">{format(new Date(entry.date), "MMMM d, yyyy - h:mm a")}</p>
                            <Separator className="my-4" />
                            <div className="space-y-4">
                                <ContextSection title="Mood" content={entry.shortTermContext.mood} />
                                <ContextSection title="Events/Triggers" content={entry.shortTermContext.events} />
                                <ContextSection title="Concerns" content={entry.shortTermContext.concerns} />
                                <ContextSection title="Coping Attempts" content={entry.shortTermContext.copingAttempts} />
                            </div>
                        </div>
                    )}
                    
                    {entry.reflection && (
                        <div>
                            <h3 className="text-lg font-semibold">AI Reflection</h3>
                            <Separator className="my-4" />
                            <div className="space-y-4">
                                <ContextSection title="Summary" content={entry.reflection.summary} />
                                <ContextSection title="Connection to Long-Term Patterns" content={entry.reflection.connection} />
                                <ContextSection title="Insight" content={entry.reflection.insight} />
                                <div>
                                    <h4 className="font-semibold">Suggestions</h4>
                                    <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                        {entry.reflection.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

const UserContextEditorFormSchema = z.object({
    values: z.string().describe("A summary of the user's core values and life goals."),
});


const UserContextEditor = ({
    isEditing,
    setIsEditing,
    userContext,
    setUserContext
}: {
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    userContext: UserContext;
    setUserContext: (context: UserContext) => void;
}) => {
    const form = useForm<z.infer<typeof UserContextEditorFormSchema>>({
        resolver: zodResolver(UserContextEditorFormSchema),
        defaultValues: {
            values: userContext.values || "",
        },
    });

    useEffect(() => {
        form.reset({ values: userContext.values || "" });
    }, [userContext, form]);

    const onSave = (data: z.infer<typeof UserContextEditorFormSchema>) => {
        setUserContext({ ...userContext, values: data.values });
        setIsEditing(false);
    };

    const onCancel = () => {
        form.reset({ values: userContext.values || "" });
        setIsEditing(false);
    };
    
    const safeLifeDomains = userContext.lifeDomains || { business: '', relationships: '', family: '', health: '', finances: '', personalGrowth: '' };

    if (!isEditing) {
        return (
             <ScrollArea className="h-full pr-4">
                 <Button onClick={() => setIsEditing(true)} className="absolute top-0 right-6">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <div className="space-y-4">
                    <ContextSection title="Core Themes" content={userContext.coreThemes} />
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Life Domains</AccordionTrigger>
                            <AccordionContent className="pl-4 space-y-3">
                                <ContextSection title="Business" content={safeLifeDomains.business} />
                                <ContextSection title="Relationships" content={safeLifeDomains.relationships} />
                                <ContextSection title="Family" content={safeLifeDomains.family} />
                                <ContextSection title="Health" content={safeLifeDomains.health} />
                                <ContextSection title="Finances" content={safeLifeDomains.finances} />
                                <ContextSection title="Personal Growth" content={safeLifeDomains.personalGrowth} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <ContextSection title="Personality Traits" content={userContext.personalityTraits} />
                    <ContextSection title="Recurring Problems / Stressors" content={userContext.recurringProblems} />
                    <ContextSection title="Values & Goals" content={userContext.values} />
                    <ContextSection title="Mood & Milestone History" content={userContext.moodHistory} />
                </div>
            </ScrollArea>
        )
    }

    return (
        <ScrollArea className="h-full pr-4">
             <div className="space-y-4 mb-6">
                <p className="text-sm text-muted-foreground">This is the AI's long-term understanding of you. Only your Values & Goals are editable.</p>
                <ContextSection title="Core Themes" content={userContext.coreThemes} />
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Life Domains</AccordionTrigger>
                        <AccordionContent className="pl-4 space-y-3">
                             <ContextSection title="Business" content={safeLifeDomains.business} />
                             <ContextSection title="Relationships" content={safeLifeDomains.relationships} />
                             <ContextSection title="Family" content={safeLifeDomains.family} />
                             <ContextSection title="Health" content={safeLifeDomains.health} />
                             <ContextSection title="Finances" content={safeLifeDomains.finances} />
                             <ContextSection title="Personal Growth" content={safeLifeDomains.personalGrowth} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <ContextSection title="Personality Traits" content={userContext.personalityTraits} />
                <ContextSection title="Recurring Problems / Stressors" content={userContext.recurringProblems} />
                <ContextSection title="Mood & Milestone History" content={userContext.moodHistory} />
            </div>
            <Separator className="my-6"/>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                    <FormField control={form.control} name="values" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-semibold">Values & Goals</FormLabel>
                             <FormDescription>You can edit this section to guide the AI on what's most important to you.</FormDescription>
                            <FormControl><Textarea {...field} rows={5} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    
                    <DialogFooter className="pt-4 sticky bottom-0 bg-background py-4">
                        <Button type="button" variant="ghost" onClick={onCancel}><X className="mr-2 h-4 w-4"/>Cancel</Button>
                        <Button type="submit"><Save className="mr-2 h-4 w-4"/>Save Changes</Button>
                    </DialogFooter>
                </form>
            </Form>
        </ScrollArea>
    )
}

const ContextSection = ({ title, content }: { title: string; content?: string }) => (
  <div className="space-y-1">
    <h4 className="font-semibold">{title}</h4>
    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content || 'Not yet analyzed.'}</p>
  </div>
);

    