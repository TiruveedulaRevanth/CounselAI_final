
"use client";

import { personalizeTherapyStyle } from "@/ai/flows/therapy-style-personalization";
import { summarizeChat } from "@/ai/flows/summarize-chat-flow";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Mic, Send, Settings, Trash2, MoreHorizontal, MessageSquarePlus, Square, Library, Sparkles, Siren, Edit } from "lucide-react";
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
  SidebarMenuAction,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { BrainLogo } from "./brain-logo";
import { ThemeToggle } from "./theme-toggle";
import { isToday, isYesterday, isWithinInterval, subDays, startOfToday, startOfDay, sub } from "date-fns";
import EmergencyResourcesDialog from "./emergency-resources-dialog";
import ResourcesLibrary from "./resources-library";
import MindfulToolkitDialog from "./mindful-toolkit-dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { User } from "lucide-react";
import type { Profile } from "./auth-page";
import EditProfileDialog from "./edit-profile-dialog";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";


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
  id:string;
  name: string;
  messages: Message[];
  createdAt: number;
};

type DeletionScope = "today" | "week" | "month" | "all";


export const therapyStyles = [
  {
    name: "Empathetic Friend",
    prompt:
      "When responding, reference something I said earlier in the conversation to show you’re paying attention, and gently validate my efforts or emotional state without trying to fix it. Use warm, natural, human-like phrasing — like a thoughtful friend would.",
  },
  {
    name: "Mindfulness Coach",
    prompt:
      "You are a mindfulness coach. Your tone should be gentle, calm, and grounding. Guide the user to the present moment. Use short sentences and incorporate pauses (like new paragraphs) to slow down the pace. Acknowledge their feelings without judgment, then gently guide them to notice their breath or physical sensations (e.g., 'I hear that you're feeling anxious. Let's just pause for a moment. Can you notice your feet on the floor?'). Avoid analysis; focus on somatic awareness and use their name to gently bring them back to the present.",
  },
  {
    name: "Cognitive Behavioral (CBT)",
    prompt:
      "Act as a CBT-informed guide, operating at an 8.5/10 intensity. Your tone is supportive and collaborative. First, validate the user's emotional state. Then, gently help them identify specific unhelpful thinking patterns (like black-and-white thinking or catastrophizing). Use Socratic questioning to help them explore their thought patterns (eg., 'What's the evidence for that thought? Is there another way to look at this?'). Guide them toward cognitive restructuring without sounding robotic or overly scripted. Use the user's name to create a collaborative feeling.",
  },
   {
    name: "Solution-Focused",
    prompt:
      "Stay in solution-focused counseling mode at an 8.5/10 intensity. Keep the tone hopeful, practical, and slightly conversational. First, validate their feelings. Then, shift the focus toward their goals, strengths, and past successes ('When have you dealt with something similar before? What worked then?'). Use questions like the 'miracle question' ('If a miracle happened tonight and this problem was solved, what would be different?'). Help the user identify small, concrete steps they can take. Use their name to reinforce their capability.",
  },
  {
    name: "Narrative Therapist",
    prompt:
      "Use narrative therapy principles at a moderate 8.5/10 level. Keep the tone accessible and emotionally resonant. Help the user reflect on their life story and the narratives they hold about themselves. Ask open-ended questions that externalize the problem (e.g., 'What has anxiety been telling you to do?'). Encourage them to identify their values and strength or resistance to the problem's influence. Focus on helping them see themselves as the author of their own life story, avoiding overly academic language. Use their name to make the exploration feel personal.",
  },
  {
    name: "Motivational Interviewing",
    prompt:
      "Use motivational interviewing techniques with an 8.5/10 balance. Your main tools are asking open-ended questions, providing affirmations, listening reflectively, and summarizing. The goal is to help the user resolve their own ambivalence about change with subtle guidance. Avoid giving direct advice. Instead, ask questions like 'What are some of the reasons you might want to make a change?' or reflect back what you hear: 'It sounds like on one hand you feel X, and on the other you feel Y.' Focus on their autonomy and strengths, and use their name to build rapport.",
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
    activeProfile: Profile;
    onSignOut: () => void;
}


export default function EmpathAIClient({ activeProfile, onSignOut }: EmpathAIClientProps) {
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isDeleteProfileOpen, setIsDeleteProfileOpen] = useState(false);

  const [deleteScope, setDeleteScope] = useState<DeletionScope>("all");


  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userInput, setUserInput] = useState("");

  // Settings state
  const [therapyStyle, setTherapyStyle] = useState(therapyStyles[0].prompt);
  const [selectedLanguage, setSelectedLanguage] = useState(supportedLanguages[0].code);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const [currentProfile, setCurrentProfile] = useState(activeProfile);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const speechRecognition = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userName = currentProfile.name;
  
  // Firestore document reference for the current user's chats
  const chatDocRef = useMemo(() => doc(db, "chats", currentProfile.id), [currentProfile.id]);


  useEffect(() => {
    setCurrentProfile(activeProfile);
  }, [activeProfile]);

  const handleSignOut = () => {
    onSignOut();
    setChats([]);
    setActiveChatId(null);
  }

  // Effect to listen for real-time chat updates from Firestore
  useEffect(() => {
    setIsDataLoading(true);
    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const chatsData = data.chats || [];
            
            setChats(chatsData);

            if (chatsData.length > 0 && !activeChatId) {
                const sortedChats = [...chatsData].sort((a, b) => b.createdAt - a.createdAt);
                setActiveChatId(sortedChats[0].id);
            } else if (chatsData.length === 0) {
                setActiveChatId(null);
            }
        } else {
            // No document yet for this user, set empty chats
            setChats([]);
            setActiveChatId(null);
        }
        setIsDataLoading(false);
    }, (error) => {
        console.error("Error fetching chats from Firestore:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load chat history."
        });
        setIsDataLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [chatDocRef, toast, activeChatId]);


  const updateChatsInFirestore = async (newChats: Chat[]) => {
    try {
        await setDoc(chatDocRef, { chats: newChats }, { merge: true });
    } catch (error) {
        console.error("Error saving chats to Firestore:", error);
        toast({
            variant: "destructive",
            title: "Sync Error",
            description: "Could not save your latest message. Please try again."
        });
    }
  };


  const handleProfileUpdate = (updatedProfile: Profile) => {
    setCurrentProfile(updatedProfile);

    const storedProfiles = localStorage.getItem("counselai-profiles");
    if (storedProfiles) {
        const profiles: Profile[] = JSON.parse(storedProfiles);
        const updatedProfiles = profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p);
        localStorage.setItem("counselai-profiles", JSON.stringify(updatedProfiles));
    }
    toast({
        title: "Profile Updated",
        description: "Your name has been successfully updated.",
    });
  };

  const handleDeleteProfile = async () => {
    // Delete Firestore document
    try {
        await setDoc(chatDocRef, { chats: [] }); // Clear the chats
    } catch (error) {
        console.error("Could not clear Firestore data:", error);
    }
    
    // Remove profile from localStorage
    const storedProfiles = localStorage.getItem("counselai-profiles");
    if (storedProfiles) {
        const profiles: Profile[] = JSON.parse(storedProfiles);
        const updatedProfiles = profiles.filter(p => p.id !== currentProfile.id);
        localStorage.setItem("counselai-profiles", JSON.stringify(updatedProfiles));
    }
    
    toast({
        title: "Profile Deleted",
        description: "Your profile and all data have been removed.",
    });
    
    handleSignOut();
  };
  
  const createNewChat = async () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      name: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    const updatedChats = [newChat, ...chats];
    await updateChatsInFirestore(updatedChats);
    setActiveChatId(newChat.id);
  };

  const handleDeleteChat = async (chatId: string) => {
    const remainingChats = chats.filter(c => c.id !== chatId);
    
    if (activeChatId === chatId) {
        if (remainingChats.length > 0) {
            const sortedRemaining = remainingChats.sort((a, b) => b.createdAt - a.createdAt);
            setActiveChatId(sortedRemaining[0].id);
        } else {
            setActiveChatId(null);
        }
    }
    await updateChatsInFirestore(remainingChats);
  };

  const handleScopedDelete = async () => {
    const now = Date.now();
    let chatsToKeep: Chat[];

    switch(deleteScope) {
        case 'today':
            chatsToKeep = chats.filter(chat => !isToday(new Date(chat.createdAt)));
            break;
        case 'week':
            const last7Days = sub(now, { days: 7 });
            chatsToKeep = chats.filter(chat => new Date(chat.createdAt) < last7Days);
            break;
        case 'month':
             const last30Days = sub(now, { days: 30 });
             chatsToKeep = chats.filter(chat => new Date(chat.createdAt) < last30Days);
            break;
        case 'all':
            chatsToKeep = [];
            break;
        default:
            chatsToKeep = chats;
            break;
    }
    
    await updateChatsInFirestore(chatsToKeep);

    if (chatsToKeep.length > 0) {
        const isCurrentChatDeleted = !chatsToKeep.some(c => c.id === activeChatId);
        if(isCurrentChatDeleted) {
            setActiveChatId(chatsToKeep.sort((a,b) => b.createdAt - a.createdAt)[0].id);
        }
    } else {
        setActiveChatId(null);
    }
    
    setIsBulkDeleteOpen(false);
  }

  const openDeleteDialog = (scope: DeletionScope) => {
    setDeleteScope(scope);
    setIsBulkDeleteOpen(true);
  }


  const activeChat = useMemo(() => chats.find(chat => chat.id === activeChatId), [chats, activeChatId]);

  const groupedChats = useMemo(() => {
    const now = new Date();
    const today: Chat[] = [];
    const yesterday: Chat[] = [];
    const last7Days: Chat[] = [];
    const last30Days: Chat[] = [];
    const older: Chat[] = [];

    const sortedChats = chats.sort((a, b) => b.createdAt - a.createdAt);

    sortedChats.forEach(chat => {
      const chatDate = new Date(chat.createdAt);
      if (isToday(chatDate)) {
        today.push(chat);
      } else if (isYesterday(chatDate)) {
        yesterday.push(chat);
      } else if (isWithinInterval(chatDate, { start: subDays(now, 7), end: now })) {
        last7Days.push(chat);
      } else if (isWithinInterval(chatDate, { start: subDays(now, 30), end: now })) {
        last30Days.push(chat);
      } else {
        older.push(chat);
      }
    });

    return [
        { label: "Today", chats: today },
        { label: "Yesterday", chats: yesterday },
        { label: "Previous 7 Days", chats: last7Days },
        { label: "Previous 30 Days", chats: last30Days },
        { label: "Older", chats: older }
    ].filter(group => group.chats.length > 0);

  }, [chats]);

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
        if (event.error === 'not-allowed') {
            toast({
              variant: "destructive",
              title: "Microphone Access Denied",
              description: "Please enable microphone access in your browser settings to use this feature.",
            });
        } else if (event.error === 'network') {
            toast({
              variant: "destructive",
              title: "Speech Recognition Error",
              description: "Network error. Please check your connection and try again.",
            });
        } else if (event.error !== 'no-speech') {
            console.error("Speech recognition error", event.error);
            toast({
              variant: "destructive",
              title: "Speech Recognition Error",
              description: "An unexpected error occurred. Please try again.",
            });
        }
        setIsListening(false);
      };

      speechRecognition.current = recognition;
    }
  }, [toast, selectedLanguage]);

  useEffect(() => {
    // This timeout ensures that the DOM has updated before we try to scroll.
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }, 100);
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
    if (!text.trim() || isLoading) return;

    let currentChatId = activeChatId;
    let currentChats = chats;

    // If no active chat, create one first
    if (!currentChatId || !activeChat) {
        const newChat: Chat = {
          id: `chat-${Date.now()}`,
          name: "New Chat",
          messages: [],
          createdAt: Date.now(),
        };
        currentChats = [newChat, ...chats];
        currentChatId = newChat.id;
        setActiveChatId(newChat.id);
        // Initial write for new chat
        await updateChatsInFirestore(currentChats);
    }

    const isFirstMessage = chats.find(c => c.id === currentChatId)?.messages.length === 0;

    const newUserMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
    };
    
    // Optimistically update the local state for a responsive UI
    const updatedChatsWithUserMessage = currentChats.map(chat =>
        chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, newUserMessage] }
            : chat
    );
    setChats(updatedChatsWithUserMessage);


    const history = updatedChatsWithUserMessage.find(c => c.id === currentChatId)?.messages.map(({ role, content }) => ({ role, content })) || [];

    setUserInput("");
    setIsLoading(true);
    handleStopSpeaking();
    if (isListening) {
        speechRecognition.current?.stop();
        setIsListening(false);
    }

    // Save user message to Firestore
    await updateChatsInFirestore(updatedChatsWithUserMessage);
    
    try {
        if (isFirstMessage) {
            try {
                const titleResult = await summarizeChat({ message: text });
                if (titleResult.title) {
                     const chatsWithTitle = updatedChatsWithUserMessage.map(chat =>
                        chat.id === currentChatId
                        ? { ...chat, name: titleResult.title }
                        : chat
                     );
                     setChats(chatsWithTitle);
                     await updateChatsInFirestore(chatsWithTitle);
                }
            } catch (titleError) {
                console.error("Failed to summarize chat title.", titleError);
            }
        }
        
        const aiResult = await personalizeTherapyStyle({
            userName: userName,
            therapyStyle: therapyStyle,
            userInput: text,
            history: history,
        });

        if (aiResult.response) {
            const newAssistantMessage: Message = {
                id: Date.now().toString() + "-ai",
                role: "assistant",
                content: aiResult.response,
            };

            const finalChats = (await (async () => {
                const currentDoc = await onSnapshot(chatDocRef, (doc) => {});
                // @ts-ignore
                const latestChats = (await db.collection("chats").doc(currentProfile.id).get()).data().chats;
                return latestChats.map((chat: Chat) =>
                  chat.id === currentChatId
                    ? { ...chat, messages: [...chat.messages, newAssistantMessage] }
                    : chat
                );
            })());

            setChats(finalChats);
            await updateChatsInFirestore(finalChats);

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
        // We don't save the AI error message to history
        // Let's revert the user message optimism
        setChats(currentChats); 
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

  const BulkDeleteDialog = () => {
    const scopeText = {
        today: "all chats from today",
        week: "all chats from the last 7 days",
        month: "all chats from the last 30 days",
        all: "all of your chat history"
    }
    return (
        <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {scopeText[deleteScope]}.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleScopedDelete}>
                Continue
            </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    );
  }

  const DeleteProfileDialog = () => (
    <AlertDialog open={isDeleteProfileOpen} onOpenChange={setIsDeleteProfileOpen}>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Delete Your Profile?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your profile and all associated chat history.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDeleteProfile}
            >
                Delete
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );

  const ChatMenuItem = ({ chat }: { chat: Chat }) => (
    <SidebarMenuItem key={chat.id}>
        <SidebarMenuButton 
            onClick={() => setActiveChatId(chat.id)}
            isActive={chat.id === activeChatId}
            className="truncate"
        >
            {chat.name}
        </SidebarMenuButton>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <SidebarMenuAction tooltip="Chat Options">
                    <MoreHorizontal/>
                </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDeleteChat(chat.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </SidebarMenuItem>
);

  return (
    <>
    <TooltipProvider>
      <BulkDeleteDialog />
      <DeleteProfileDialog />
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
        <EditProfileDialog 
            isOpen={isEditProfileOpen}
            onOpenChange={setIsEditProfileOpen}
            profile={currentProfile}
            onProfileUpdate={handleProfileUpdate}
        />
        <EmergencyResourcesDialog isOpen={isEmergencyOpen} onOpenChange={setIsEmergencyOpen} />
        <ResourcesLibrary isOpen={isLibraryOpen} onOpenChange={setIsLibraryOpen} />
        <MindfulToolkitDialog isOpen={isToolkitOpen} onOpenChange={setIsToolkitOpen} />

      <Sidebar>
        <SidebarHeader>
           <div className="flex items-center gap-2">
                <SidebarGroupLabel className="text-lg font-bold text-foreground">Chats</SidebarGroupLabel>
           </div>
            <SidebarMenuButton
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={createNewChat}
                tooltip="New Chat"
            >
                <MessageSquarePlus />
            </SidebarMenuButton>
        </SidebarHeader>

        <SidebarContent>
            <ScrollArea className="flex-1 -mx-2 px-2">
                <SidebarMenu>
                {groupedChats.map(group => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.chats.map(chat => (
                                <ChatMenuItem key={chat.id} chat={chat} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
                </SidebarMenu>
            </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="p-2 space-y-1">
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsEmergencyOpen(true)} className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Siren />
                        <span>Emergency</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsLibraryOpen(true)}>
                        <Library />
                        <span>Resources</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <header className="flex items-center justify-between p-4 border-b shrink-0">
            <div className="flex items-center gap-2">
                <SidebarTrigger tooltip="Toggle chat history" />
                <BrainLogo className="w-7 h-7"/>
                <h2 className="text-lg font-semibold">CounselAI</h2>
            </div>
             <div className="flex items-center gap-1">
                <ThemeToggle />
                <Tooltip>
                  <TooltipTrigger asChild={true}>
                    <Button variant="ghost" size="icon" onClick={() => setIsToolkitOpen(true)}><Sparkles size={20}/></Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Mindful Toolkit</p></TooltipContent>
                </Tooltip>
                
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => {}}><Trash2 size={20}/></Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p>Delete Chats</p></TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openDeleteDialog('today')}>Delete Today's Chats</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog('week')}>Delete Last 7 Days' Chats</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog('month')}>Delete Last 30 Days' Chats</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openDeleteDialog('all')} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            Delete All Chats
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                  <TooltipTrigger asChild={true}>
                    <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}><Settings size={20}/></Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Settings</p></TooltipContent>
                </Tooltip>
                <div className="flex items-center gap-3 p-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-destructive text-destructive-foreground font-bold">
                                        {userName ? userName.charAt(0).toUpperCase() : <User size={20} />}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled className="flex flex-col items-start gap-1">
                                <p className="font-semibold text-sm text-foreground">{userName}</p>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsEditProfileOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Profile</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => setIsDeleteProfileOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Profile</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
             </div>
          </header>
          <div className="flex-1 flex flex-col min-h-0">
             <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                    {(isDataLoading || (!activeChat || activeChat.messages.length === 0)) && !isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center h-[calc(100vh-200px)]">
                           {isDataLoading ? (
                             <p className="text-muted-foreground">Loading chats...</p>
                           ) : (
                            <>
                                <BrainLogo className="w-24 h-24 text-primary mb-4"/>
                                <h2 className="text-2xl font-bold">Welcome back, {userName}</h2>
                                <p className="text-muted-foreground">Start a new conversation by typing below or using the microphone.</p>
                            </>
                           )}
                        </div>
                    )}
                    {activeChat?.messages.map(message => (
                      <ChatMessage 
                        key={message.id} 
                        message={message} 
                        userName={userName}
                        onSpeak={(text) => speakText(text)}
                       />
                    ))}
                    {isLoading && <ChatMessage.Loading />}
                </div>
              </ScrollArea>
          </div>
          <footer className="p-4 border-t shrink-0">
            <div className="relative max-w-2xl mx-auto">
                <Textarea
                    placeholder="Ask anything..."
                    className="pr-24"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    { isSpeaking ? (
                        <Tooltip>
                            <TooltipTrigger asChild={true}>
                                <Button variant="ghost" size="icon" onClick={handleStopSpeaking}>
                                    <Square className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Stop Speaking</p></TooltipContent>
                        </Tooltip>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild={true}>
                                <Button 
                                    variant="ghost"
                                    size="icon" 
                                    onClick={handleMicClick}
                                    className={isListening ? "text-red-500" : ""}
                                >
                                    <Mic className="h-5 w-5"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Use Microphone</p></TooltipContent>
                        </Tooltip>
                    )}
                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Button variant="ghost" size="icon" onClick={() => handleSend( userInput)} disabled={isLoading || !userInput.trim()}>
                                <Send className="h-5 w-5"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Send Message</p></TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
                CounselAI can make mistakes. Consider checking important information.
            </p>
          </footer>
        </div>
      </SidebarInset>
    </TooltipProvider>
    </>
  );
}
