
"use client";

import { personalizeTherapyStyle } from "@/ai/flows/therapy-style-personalization";
import { summarizeChat } from "@/ai/flows/summarize-chat-flow";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Mic, Plus, Send, Settings, Sparkles, Square, Trash2, HeartCrack, Library } from "lucide-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ChatMessage from "./chat-message";
import SettingsDialog from "./settings-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { subDays, isToday, isYesterday, isAfter, startOfMonth, startOfWeek } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrainLogo } from "./brain-logo";
import { ThemeToggle } from "./theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import MindfulToolkitDialog from "./mindful-toolkit-dialog";
import EmergencyResourcesDialog from "./emergency-resources-dialog";
import ResourcesLibrary from "./resources-library";


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Chat = {
  id: string;
  name: string;
  createdAt: string;
  messages: Message[];
};

export const therapyStyles = [
  {
    name: "Empathetic Friend",
    prompt:
      "An empathetic, supportive, and non-judgmental friend who listens carefully and responds in a calm, reassuring tone. Adapt to the user's emotional state.",
  },
  {
    name: "Mindfulness Coach",
    prompt:
      "A mindfulness coach who helps the user stay present and grounded. Use techniques from Mindfulness-Based Stress Reduction (MBSR) and provide guided exercises.",
  },
  {
    name: "Cognitive Behavioral (CBT)",
    prompt:
      "A therapist using Cognitive Behavioral Therapy (CBT) techniques. Help the user identify and challenge negative thought patterns and develop healthier coping strategies.",
  },
  {
    name: "Solution-Focused",
    prompt:
      "A solution-focused therapist who concentrates on the user's strengths and helps them build solutions rather than dwelling on problems. Focus on future possibilities.",
  },
  {
    name: "Narrative Therapist",
    prompt:
      "A narrative therapist who helps the user re-author their life stories. Focus on separating the person from the problem and empowering them to see their life from a new perspective.",
  },
];

export const supportedLanguages = [
    { name: 'English', code: 'en-US' },
    { name: 'Français', code: 'fr-FR' },
    { name: 'Deutsch', code: 'de-DE' },
    { name: 'Español', code: 'es-ES' },
    { name: '中文 (Mandarin)', code: 'zh-CN' },
];


interface EmpathAIClientProps {
    userName: string | null;
    onSignOut: () => void;
}


export default function EmpathAIClient({ userName, onSignOut }: EmpathAIClientProps) {
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);


  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userInput, setUserInput] = useState("");

  // Settings state
  const [therapyStyle, setTherapyStyle] = useState(therapyStyles[0].prompt);
  const [selectedLanguage, setSelectedLanguage] = useState(supportedLanguages[0].code);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const speechRecognition = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    onSignOut();
    setChats([]);
    setActiveChatId(null);
  }

  // Load chats from local storage on initial render
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem("counselai-chats");
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats) as Chat[];
        if (Array.isArray(parsedChats) && parsedChats.length > 0) {
           const updatedChats = parsedChats.map(chat => ({...chat, createdAt: chat.createdAt || new Date().toISOString()}));
           updatedChats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setChats(updatedChats);
          setActiveChatId(updatedChats[0].id);
        } else {
          // No chats found, let user create one.
           setActiveChatId(null);
        }
      } else {
         // No chats key, let user create one
         setActiveChatId(null);
      }
    } catch (error) {
      console.error("Failed to load chats from local storage:", error);
       setActiveChatId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save chats to local storage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("counselai-chats", JSON.stringify(chats));
    } else {
      localStorage.removeItem("counselai-chats");
    }
  }, [chats]);
  
  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      name: "New Chat",
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, []);

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => {
        const remainingChats = prev.filter(c => c.id !== chatId);
        if (activeChatId === chatId) {
            if (remainingChats.length > 0) {
                setActiveChatId(remainingChats[0].id);
            } else {
                setActiveChatId(null);
            }
        }
        return remainingChats;
    });
  };

  const handleBulkDelete = (timeframe: 'today' | 'week' | 'month' | 'all') => {
    const now = new Date();
    let chatsToKeep: Chat[] = [];
  
    if (timeframe === 'all') {
      // handled by setting chatsToKeep to []
    } else {
      chatsToKeep = chats.filter(chat => {
        const chatDate = new Date(chat.createdAt);
        if (timeframe === 'today') {
          return !isToday(chatDate);
        }
        if (timeframe === 'week') {
          const start = startOfWeek(now);
          return chatDate < start;
        }
        if (timeframe === 'month') {
          const start = startOfMonth(now);
          return chatDate < start;
        }
        return true;
      });
    }
  
    setChats(chatsToKeep);
  
    if (chatsToKeep.length === 0) {
        setActiveChatId(null);
    } else if (!chatsToKeep.some(c => c.id === activeChatId)) {
        setActiveChatId(chatsToKeep[0].id);
    }
  
    toast({
      title: "Chats Deleted",
      description: `Your chats have been successfully deleted.`,
    });
  };

  const activeChat = useMemo(() => chats.find(chat => chat.id === activeChatId), [chats, activeChatId]);

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window && selectedVoice) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
  }, [selectedVoice]);

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        if (allVoices.length > 0) {
            setAvailableVoices(allVoices);
        }
      };
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      }
    }
  }, []);

  useEffect(() => {
      if (availableVoices.length > 0) {
          const voicesForLanguage = availableVoices.filter(v => v.lang.startsWith(selectedLanguage.substring(0,2)));
          setSelectedVoice(voicesForLanguage[0] || availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0]);
      }
  }, [selectedLanguage, availableVoices]);


  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setUserInput(finalTranscript + interimTranscript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'network') {
            toast({
              variant: "destructive",
              title: "Speech Recognition Error",
              description: "Network error. Please check your connection and try again.",
            });
        } else if (event.error !== 'no-speech') {
            toast({
              variant: "destructive",
              title: "Speech Recognition Error",
              description: event.error,
            });
        }
        setIsListening(false);
      };

      speechRecognition.current = recognition;
    }
  }, [toast, selectedLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, isLoading]);

  const handleMicClick = () => {
    handleStopSpeaking();
    if (isListening) {
      speechRecognition.current?.stop();
    } else {
       setUserInput("");
       speechRecognition.current?.start();
    }
    setIsListening(prev => !prev);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading || !activeChatId || !activeChat) return;
  
    const currentChatId = activeChatId;
    const isFirstMessage = activeChat.messages.length === 0;
  
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
  
    // Create a snapshot of the history BEFORE adding the new user message
    const history = activeChat.messages.map(({ role, content }) => ({ role, content }));

    setChats(prev =>
      prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, newUserMessage] }
          : chat
      )
    );
  
    setUserInput("");
    setIsLoading(true);
    handleStopSpeaking();
    if (isListening) {
      speechRecognition.current?.stop();
      setIsListening(false);
    }
  
    try {
      if (isFirstMessage) {
        try {
          const titleResult = await summarizeChat({ message: text });
          if (titleResult.title) {
            setChats(prev =>
              prev.map(chat =>
                chat.id === currentChatId
                  ? { ...chat, name: titleResult.title }
                  : chat
              )
            );
          }
        } catch (titleError) {
          console.error("Failed to summarize chat title, using default.", titleError);
          setChats(prev =>
            prev.map(chat =>
              chat.id === currentChatId
                ? { ...chat, name: text.substring(0, 40) + '...' }
                : chat
            )
          );
        }
      }
  
      const aiResult = await personalizeTherapyStyle({
        therapyStyle: therapyStyle,
        userInput: text,
        history: history, // Pass the conversation history
      });
  
      if (aiResult.response) {
        const newAssistantMessage: Message = {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          content: aiResult.response,
        };
        
        setChats(prev =>
          prev.map(chat =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, newAssistantMessage] }
              : chat
          )
        );
      } else {
        throw new Error("Received an empty response from the AI.");
      }
    } catch (error) {
      console.error("Error calling AI:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Sorry, I encountered an error. Please try again.",
      });
      const assistantErrorMessage: Message = {
        id: Date.now().toString() + "-ai-error",
        role: "assistant",
        content: "I'm sorry, I seem to be having trouble connecting. Please try again in a moment.",
      };
      
      setChats(prev =>
        prev.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, assistantErrorMessage] }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };  
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(userInput);
    }
  }

  const groupedChats = useMemo(() => {
    const groups: { [key: string]: Chat[] } = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
    };
    const older: { [key: string]: Chat[] } = {};

    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    chats.forEach(chat => {
      const chatDate = new Date(chat.createdAt);
      if (isToday(chatDate)) {
        groups.Today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.Yesterday.push(chat);
      } else if (isAfter(chatDate, sevenDaysAgo)) {
        groups['Previous 7 Days'].push(chat);
      } else {
        const month = chatDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!older[month]) {
          older[month] = [];
        }
        older[month].push(chat);
      }
    });

    const olderEntries = Object.entries(older).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());

    return [...Object.entries(groups), ...olderEntries].filter(([, chats]) => chats.length > 0);
  }, [chats]);


  const BulkDeleteDialog = ({
    timeframe,
    title,
    description,
    children,
  }: {
    timeframe: 'today' | 'week' | 'month' | 'all';
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleBulkDelete(timeframe)}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <TooltipProvider>
       <SettingsDialog
          availableVoices={availableVoices}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          therapyStyle={therapyStyle}
          setTherapyStyle={setTherapyStyle}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
        />
        <MindfulToolkitDialog
          isOpen={isToolkitOpen}
          onOpenChange={setIsToolkitOpen}
        />
        <EmergencyResourcesDialog
          isOpen={isEmergencyOpen}
          onOpenChange={setIsEmergencyOpen}
        />
        <ResourcesLibrary 
            isOpen={isLibraryOpen}
            onOpenChange={setIsLibraryOpen}
        />
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <BrainLogo className="h-8 w-8" />
                <h1 className="text-xl font-bold font-headline">CounselAI</h1>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => createNewChat()}>
                      <Plus className="h-6 w-6"/>
                      <span className="sr-only">New Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Chat</p>
                </TooltipContent>
              </Tooltip>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1">
          <ScrollArea className="h-full">
                {groupedChats.map(([groupName, groupChats]) => (
                    <SidebarGroup key={groupName}>
                        <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
                        <SidebarMenu>
                        {groupChats.map(chat => (
                            <SidebarMenuItem key={chat.id}>
                                <SidebarMenuButton 
                                onClick={() => setActiveChatId(chat.id)}
                                isActive={chat.id === activeChatId}
                                className="truncate"
                                >
                                {chat.name}
                                </SidebarMenuButton>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <SidebarMenuAction showOnHover>
                                            <Trash2/>
                                        </SidebarMenuAction>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this
                                            chat history.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteChat(chat.id)}>
                                            Continue
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </SidebarMenuItem>
                        ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full bg-background font-body text-foreground">
          <header className="flex items-center justify-between p-4 border-b shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-bold font-headline">CounselAI</h1>
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsToolkitOpen(true)}>
                      <Sparkles className="h-5 w-5" />
                      <span className="sr-only">Mindful Toolkit</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mindful Toolkit</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Delete Chats</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete Chats</p>
                        </TooltipContent>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <BulkDeleteDialog
                      timeframe="today"
                      title="Delete Today's Chats?"
                      description="This will permanently delete all conversations from today."
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Delete Today</DropdownMenuItem>
                    </BulkDeleteDialog>
                    <BulkDeleteDialog
                      timeframe="week"
                      title="Delete This Week's Chats?"
                      description="This will permanently delete all conversations from the past 7 days."
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Delete Last 7 Days</DropdownMenuItem>
                    </BulkDeleteDialog>
                    <BulkDeleteDialog
                      timeframe="month"
                      title="Delete This Month's Chats?"
                      description="This will permanently delete all conversations from this month."
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Delete This Month</DropdownMenuItem>
                    </BulkDeleteDialog>
                    <DropdownMenuSeparator />
                     <BulkDeleteDialog
                      timeframe="all"
                      title="Delete All Chats?"
                      description="This action is irreversible and will permanently delete all of your chat history."
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete All History</DropdownMenuItem>
                    </BulkDeleteDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">Settings</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Settings</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleSignOut}>
                            <LogOut className="h-5 w-5" />
                            <span className="sr-only">Sign Out</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Sign Out</p>
                    </TooltipContent>
                </Tooltip>
            </div>
          </header>

          <main className="flex-1 min-h-0 relative">
             {activeChat && activeChat.messages.length > 0 ? (
                <ScrollArea className="h-full">
                  <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
                    {activeChat?.messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} onSpeak={speakText} userName={userName} />
                    ))}
                    {isListening && userInput && (
                      <ChatMessage message={{id: 'interim', role: 'user', content: userInput}} isInterim userName={userName}/>
                    )}
                    {isLoading && <ChatMessage.Loading />}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 h-full">
                    <BrainLogo className="w-16 h-16 text-primary"/>
                    <h2 className="text-2xl font-bold">{userName && (!activeChat || activeChat.messages.length === 0) ? `Welcome back, ${userName}`: 'Ready when you are.'}</h2>
                    <p className="text-muted-foreground mt-2">Start a new conversation by typing below or using the microphone.</p>
                </div>
              )}
               <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => setIsEmergencyOpen(true)} className="gap-2 shadow-lg">
                            <HeartCrack className="h-4 w-4" />
                            <span className="hidden sm:inline">Need Help?</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Get Emergency Help</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" onClick={() => setIsLibraryOpen(true)} className="gap-2 shadow-lg">
                            <Library className="h-4 w-4" />
                            <span className="hidden sm:inline">Library</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Resources Library</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
          </main>

          <footer className="p-4 w-full shrink-0">
            <div className="relative flex items-end gap-2 max-w-2xl mx-auto bg-card rounded-2xl border p-2 shadow-sm">
               <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className="flex-1 resize-none bg-transparent border-none text-base focus-visible:ring-0 focus-visible:ring-offset-0 pr-24"
                  rows={1}
                  disabled={isLoading || !activeChatId}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {isSpeaking ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 shrink-0 rounded-full"
                            onClick={handleStopSpeaking}
                          >
                            <Square className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Stop Speaking</p>
                        </TooltipContent>
                      </Tooltip>
                  ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-10 w-10 shrink-0 rounded-full ${
                                isListening ? "text-red-500" : ""
                            }`}
                            onClick={handleMicClick}
                            disabled={isLoading || !activeChatId}
                          >
                            <Mic className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Use Microphone</p>
                        </TooltipContent>
                      </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                         <Button
                            size="icon"
                            onClick={() => handleSend(userInput)}
                            disabled={!userInput.trim() || isLoading || !activeChatId}
                            className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-600"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Send Message</p>
                    </TooltipContent>
                  </Tooltip>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2 h-4">
                {isListening ? "Listening... Press mic again to stop." : isSpeaking ? "Speaking..." : isLoading ? "Thinking..." : activeChatId ? "CounselAI can make mistakes. Consider checking important information." : "Create a new chat to begin."}
            </p>
          </footer>
        </div>
       </SidebarInset>
    </TooltipProvider>
  );
}

    