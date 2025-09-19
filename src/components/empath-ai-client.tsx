
"use client";

import { personalizeTherapyStyle } from "@/ai/flows/therapy-style-personalization";
import { summarizeChat } from "@/ai/flows/summarize-chat-flow";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { suggestResource } from "@/ai/flows/suggest-resource-flow";
import { sendSms } from "@/ai/flows/send-sms-flow";
import { updateJournal } from "@/ai/flows/update-journal-flow";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Mic, Send, Settings, Trash2, MoreHorizontal, MessageSquarePlus, Square, Library, Sparkles, Siren, Edit, Archive, ArchiveX, FilePenLine, BookText } from "lucide-react";
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
import { isToday, isYesterday, isWithinInterval, subDays } from "date-fns";
import EmergencyResourcesDialog from "./emergency-resources-dialog";
import ResourcesLibrary from "./resources-library";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { User } from "lucide-react";
import type { Profile } from "./auth-page";
import EditProfileDialog from "./edit-profile-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Image from 'next/image';
import type { Journal } from "@/ai/schemas/journal";
import JournalDialog from "./journal-dialog";

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
  resourceId?: string;
  resourceTitle?: string;
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
    description: "A warm, validating partner for your emotional journey.",
    prompt:
      "Act as an Empathetic Friend. Your tone should be warm, validating, and supportive. Focus on listening and understanding the user's feelings. Use phrases that show you're paying attention and that you care. Avoid giving direct advice unless asked; prioritize making the user feel heard and less alone.",
  },
  {
    name: "Solution Focused",
    description: "Practical, goal-oriented guidance to find solutions.",
    prompt:
      "Act as a Solution-Focused therapist. Your tone is practical, clear, and goal-oriented. Help the user identify specific, achievable goals. Ask questions that shift focus from the problem to potential solutions, such as 'What would it look like if this problem were solved?' or 'What's one small step you could take?'. Use lists to organize suggestions and maintain a structured, forward-moving conversation.",
  },
  {
    name: "Wise Mentor",
    description: "Calm, philosophical insights to broaden your perspective.",
    prompt:
      "Embody a Wise Mentor. Your tone is calm, patient, and inquisitive. Respond with thoughtful, open-ended questions that encourage deep reflection. Use metaphors and analogies to offer new perspectives on the user's situation. Avoid giving direct advice; instead, guide the user to find their own wisdom and insights. The goal is to foster self-discovery and a broader understanding of their life.",
  },
  {
    name: "Motivational Speaker",
    description: "Energetic, uplifting encouragement to conquer your goals.",
    prompt:
      "You are a Motivational Speaker. Your tone is energetic, positive, and uplifting. Use powerful, encouraging language to inspire the user. Help them break down their goals into smaller, manageable challenges. Celebrate their efforts and reframe setbacks as learning opportunities. Your primary goal is to boost the user's confidence and motivation, acting as a high-energy partner in their corner.",
  },
  {
    name: "CBT",
    description: "Cognitive-Behavioral tools to reframe negative thoughts.",
    prompt:
        "Adopt a Cognitive-Behavioral Therapy (CBT) approach. Your tone is educational and collaborative. Focus on helping the user identify and challenge unhelpful thought patterns (cognitive distortions) and behaviors. Guide them to see the connection between their thoughts, feelings, and actions. Offer to guide them through structured exercises, such as thought records or behavioral experiments. For example, 'That sounds like a painful thought. Is there any evidence that contradicts it?' or 'Let's try to look at this from another angle.'",
  }
];

export const supportedLanguages = [
    { name: 'English', code: 'en-US' },
    { name: 'Français', code: 'fr-FR' },
    { name: 'Deutsch', code: 'de-DE' },
    { name: 'Español', code: 'es-ES' },
    { name: '中文 (Mandarin)', code: 'zh-CN' },
];

export type CustomPersona = {
    [key: string]: number;
}


interface EmpathAIClientProps {
    activeProfile: Profile;
    onSignOut: () => void;
}

const initialJournal: Journal = {
    personality: "Not yet analyzed.",
    strengths: "Not yet analyzed.",
    struggles: "Not yet analyzed.",
    suggestedSolutions: "Not yet analyzed.",
    progressSummary: "No progress to report yet."
};

export default function EmpathAIClient({ activeProfile, onSignOut }: EmpathAIClientProps) {
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [journal, setJournal] = useState<Journal>(initialJournal);
  const [userJournalEntries, setUserJournalEntries] = useState<string>("");
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isDeleteProfileOpen, setIsDeleteProfileOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState<Chat | null>(null);
  const [newChatName, setNewChatName] = useState("");


  const [deleteScope, setDeleteScope] = useState<DeletionScope>("all");


  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userInput, setUserInput] = useState("");

  // Settings state
  const [therapyStyle, setTherapyStyle] = useState(therapyStyles[0].prompt);
  const [selectedLanguage, setSelectedLanguage] = useState(supportedLanguages[0].code);
  const [activePersona, setActivePersona] = useState(therapyStyles[0]);
  const [customPersona, setCustomPersona] = useState<CustomPersona>({
    [therapyStyles[0].name]: 100,
    [therapyStyles[1].name]: 0,
    [therapyStyles[2].name]: 0,
    [therapyStyles[3].name]: 0,
    [therapyStyles[4].name]: 0,
  });
  
  const [currentProfile, setCurrentProfile] = useState(activeProfile);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const speechRecognition = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopSpeakingRef = useRef<boolean>(false);
  const userName = currentProfile.name;
  
  const helplineUrls: { [key: string]: string } = {
    IN: 'https://www.aasra.info/helpline.html',
    US: 'https://988lifeline.org/',
    GB: 'https://www.samaritans.org/',
    ES: 'https://telefonodelaesperanza.org/',
    FR: 'https://www.sos-amitie.com/',
    CN: 'https://www.lifelinechina.org/',
    DEFAULT: 'https://www.befrienders.org/',
  };

  useEffect(() => {
    setCurrentProfile(activeProfile);
    // When profile changes, load their chats and journal
    setIsDataLoading(true);
    try {
        const storedChats = localStorage.getItem(`counselai-chats-${activeProfile.id}`);
        const parsedChats = storedChats ? JSON.parse(storedChats) : [];
        setChats(parsedChats);

        const storedJournal = localStorage.getItem(`counselai-journal-${activeProfile.id}`);
        setJournal(storedJournal ? JSON.parse(storedJournal) : initialJournal);

        const storedUserJournal = localStorage.getItem(`counselai-user-journal-${activeProfile.id}`);
        setUserJournalEntries(storedUserJournal || "");

        // Load settings
        const storedStyle = localStorage.getItem(`counselai-therapy-style-${activeProfile.id}`);
        const storedPersonaName = localStorage.getItem(`counselai-persona-${activeProfile.id}`);
        const storedCustomPersona = localStorage.getItem(`counselai-custom-persona-${activeProfile.id}`);
        const persona = therapyStyles.find(p => p.name === storedPersonaName) || therapyStyles[0];
        
        if (storedPersonaName === 'Custom' && storedCustomPersona) {
            const customPersonaData = JSON.parse(storedCustomPersona);
            setCustomPersona(customPersonaData);
            setActivePersona({ name: 'Custom', description: '', prompt: storedStyle || ''});
        } else {
             setActivePersona(persona);
        }
        setTherapyStyle(storedStyle || persona.prompt);
        
        if (parsedChats.length > 0) {
            const sortedChats = [...parsedChats].sort((a, b) => b.createdAt - a.createdAt);
            setActiveChatId(sortedChats[0].id);
        } else {
            setActiveChatId(null);
        }

    } catch (error) {
        console.error("Failed to load data from local storage:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load your data."
        });
    } finally {
        setIsDataLoading(false);
    }

  }, [activeProfile, toast]);
  
  // Persist data to local storage whenever they change for the current profile
  useEffect(() => {
    if (!isDataLoading) {
        localStorage.setItem(`counselai-chats-${currentProfile.id}`, JSON.stringify(chats));
        localStorage.setItem(`counselai-journal-${currentProfile.id}`, JSON.stringify(journal));
        localStorage.setItem(`counselai-user-journal-${currentProfile.id}`, userJournalEntries);
        localStorage.setItem(`counselai-therapy-style-${currentProfile.id}`, therapyStyle);
        localStorage.setItem(`counselai-persona-${currentProfile.id}`, activePersona.name);
        if (activePersona.name === 'Custom') {
            localStorage.setItem(`counselai-custom-persona-${currentProfile.id}`, JSON.stringify(customPersona));
        }
    }
  }, [chats, journal, userJournalEntries, therapyStyle, activePersona, customPersona, currentProfile.id, isDataLoading]);


  const handleSignOut = () => {
    onSignOut();
    setChats([]);
    setActiveChatId(null);
  }

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
        description: "Your profile has been successfully updated.",
    });
  };

  const handleDeleteProfile = async () => {
    // Remove profile from localStorage
    const storedProfiles = localStorage.getItem("counselai-profiles");
    if (storedProfiles) {
        const profiles: Profile[] = JSON.parse(storedProfiles);
        const updatedProfiles = profiles.filter(p => p.id !== currentProfile.id);
        localStorage.setItem("counselai-profiles", JSON.stringify(updatedProfiles));
    }
     // Also delete associated data from localStorage
    localStorage.removeItem(`counselai-chats-${currentProfile.id}`);
    localStorage.removeItem(`counselai-therapy-style-${currentProfile.id}`);
    localStorage.removeItem(`counselai-persona-${currentProfile.id}`);
    localStorage.removeItem(`counselai-custom-persona-${currentProfile.id}`);
    localStorage.removeItem(`counselai-journal-${currentProfile.id}`);
    localStorage.removeItem(`counselai-user-journal-${currentProfile.id}`);
    
    toast({
        title: "Profile Deleted",
        description: "Your profile and all data have been removed.",
    });
    
    handleSignOut();
  };
  
  const createNewChat = () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      name: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setActiveChatId(newChat.id);
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter(c => c.id !== chatId);
    
    if (activeChatId === chatId) {
        const sortedRemaining = updatedChats.sort((a, b) => b.createdAt - a.createdAt);
        setActiveChatId(sortedRemaining[0]?.id || null);
    }
    setChats(updatedChats);
  };

  const openRenameDialog = (chat: Chat) => {
    setChatToRename(chat);
    setNewChatName(chat.name);
    setIsRenameDialogOpen(true);
  };

  const handleRenameChat = () => {
    if (!chatToRename || !newChatName.trim()) return;

    const updatedChats = chats.map(c => 
        c.id === chatToRename.id ? { ...c, name: newChatName.trim() } : c
    );
    setChats(updatedChats);

    toast({
        title: "Chat Renamed",
        description: `The chat has been renamed to "${newChatName.trim()}".`,
    });
    
    // Close and reset dialog state
    setIsRenameDialogOpen(false);
    setChatToRename(null);
    setNewChatName("");
  };

  const handleScopedDelete = () => {
    const now = Date.now();
    let chatsToKeep: Chat[];

    switch(deleteScope) {
        case 'today':
            chatsToKeep = chats.filter(chat => !isToday(new Date(chat.createdAt)));
            break;
        case 'week':
            const last7Days = subDays(now, 7);
            chatsToKeep = chats.filter(chat => new Date(chat.createdAt) < last7Days);
            break;
        case 'month':
             const last30Days = subDays(now, 30);
             chatsToKeep = chats.filter(chat => new Date(chat.createdAt) < last30Days);
            break;
        case 'all':
            chatsToKeep = [];
            break;
        default:
            chatsToKeep = chats;
            break;
    }
    
    setChats(chatsToKeep);

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
  
  const speakText = useCallback(async (text: string) => {
    if (isSpeaking) {
      handleStopSpeaking();
      return;
    }
  
    stopSpeakingRef.current = false;
    setIsSpeaking(true);
  
    try {
      const { audio } = await textToSpeech({ text });

      if (stopSpeakingRef.current) {
        setIsSpeaking(false);
        return;
      }
  
      if (audio) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = audio;
        audioRef.current.onended = () => {
          setIsSpeaking(false);
        };
        audioRef.current.play().catch(err => {
            console.error("Audio playback error:", err);
            setIsSpeaking(false);
        });
      } else {
         toast({
            variant: "destructive",
            title: "Speech Error",
            description: "Could not generate audio. Please try again.",
         });
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Error during TTS generation:", error);
      toast({
        variant: "destructive",
        title: "Speech Error",
        description: "Could not generate or play audio.",
      });
      setIsSpeaking(false);
    }
  }, [isSpeaking, toast]);

  const handleStopSpeaking = () => {
    stopSpeakingRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };


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
    let currentChats = [...chats];
    let currentChat = currentChats.find(c => c.id === currentChatId);

    // If no active chat, create one first
    if (!currentChatId || !currentChat) {
        const newChat: Chat = {
            id: `chat-${Date.now()}`,
            name: "New Chat",
            messages: [],
            createdAt: Date.now(),
        };
        currentChats = [newChat, ...currentChats];
        currentChat = newChat;
        currentChatId = newChat.id;
        setActiveChatId(newChat.id);
    }

    const isFirstMessage = currentChat.messages.length === 0;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    const updatedMessages = [...currentChat.messages, newUserMessage];
    const updatedChat = { ...currentChat, messages: updatedMessages };
    
    // Optimistically update the local state for a responsive UI
    const updatedChatsWithUserMessage = currentChats.map(chat =>
        chat.id === currentChatId ? updatedChat : chat
    );
    setChats(updatedChatsWithUserMessage);

    const historyForAI = updatedMessages.map(({ role, content }) => ({ role, content }));

    setUserInput("");
    setIsLoading(true);
    handleStopSpeaking();
    if (isListening) {
        speechRecognition.current?.stop();
        setIsListening(false);
    }
    
    try {
        // Start all AI calls in parallel
        const summarizePromise = isFirstMessage 
            ? summarizeChat({ message: text })
            : Promise.resolve(null);
            
        const resourcePromise = suggestResource({ query: text });

        const responsePromise = personalizeTherapyStyle({
            userName: userName,
            therapyStyle: therapyStyle,
            userInput: text,
            history: historyForAI.slice(0, -1), // Send history *before* the current message
            journal: journal,
        });

        // Trigger journal update in the background, but don't wait for it
        if (historyForAI.length > 0 && historyForAI.length % 3 === 0) { // Update journal every 3 messages
            updateJournal({ currentJournal: journal, history: historyForAI })
                .then(newJournal => setJournal(newJournal));
        }

        const [summarizeResult, resourceResult, aiResult] = await Promise.all([summarizePromise, resourcePromise, responsePromise]);

        // Check for crisis redirection
        if (aiResult.needsHelp) {
            // Send SMS to emergency contact
            if (currentProfile.emergencyContactPhone) {
                await sendSms({
                    userName: currentProfile.name,
                    emergencyContactPhone: currentProfile.emergencyContactPhone
                });
                toast({
                    title: "Emergency Contact Alerted",
                    description: "A message has been sent to your emergency contact.",
                    duration: 5000,
                });
            }

            // Redirect to helpline
            const regionUrl = helplineUrls[currentProfile.region] || helplineUrls.DEFAULT;
            window.location.href = regionUrl;
            return; // Stop further processing
        }
        
        let finalChats = updatedChatsWithUserMessage;

        if (summarizeResult?.title) {
            finalChats = finalChats.map(chat =>
                chat.id === currentChatId
                ? { ...chat, name: summarizeResult.title }
                : chat
            );
        }

        if (aiResult.response) {
            const newAssistantMessage: Message = {
                id: Date.now().toString() + "-ai",
                role: "assistant",
                content: aiResult.response,
                resourceId: resourceResult?.id,
                resourceTitle: resourceResult?.title,
            };
            finalChats = finalChats.map(chat =>
                chat.id === currentChatId
                    ? { ...chat, messages: [...chat.messages, newAssistantMessage] }
                    : chat
            );
        } else {
            throw new Error("Received an empty response from the AI.");
        }

        setChats(finalChats);

    } catch (error) {
        console.error("Error calling AI:", error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "Sorry, I encountered an error. Please try again.",
        });
        // Revert the optimistic update on error
         setChats(currentChats.map(chat =>
            chat.id === currentChatId
                ? { ...chat, messages: currentChat.messages }
                : chat
         ));
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

  const RenameChatDialog = () => (
    <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Rename Chat</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="chat-name" className="text-right">
                        Name
                    </Label>
                    <Input
                        id="chat-name"
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                        className="col-span-3"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleRenameChat();
                            }
                        }}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleRenameChat}>Save</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )

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
                <DropdownMenuItem onClick={() => openRenameDialog(chat)}>
                    <FilePenLine className="mr-2 h-4 w-4" />
                    Rename
                </DropdownMenuItem>
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
      <RenameChatDialog />
       <SettingsDialog
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          therapyStyle={therapyStyle}
          setTherapyStyle={setTherapyStyle}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          activePersona={activePersona}
          setActivePersona={setActivePersona}
          customPersona={customPersona}
          setCustomPersona={setCustomPersona}
        />
        <EditProfileDialog 
            isOpen={isEditProfileOpen}
            onOpenChange={setIsEditProfileOpen}
            profile={currentProfile}
            onProfileUpdate={handleProfileUpdate}
        />
        <EmergencyResourcesDialog isOpen={isEmergencyOpen} onOpenChange={setIsEmergencyOpen} />
        <ResourcesLibrary isOpen={isLibraryOpen} onOpenChange={setIsLibraryOpen} />
        <JournalDialog 
            isOpen={isJournalOpen}
            onOpenChange={setIsJournalOpen}
            journal={journal}
            userEntries={userJournalEntries}
            onUserEntriesChange={setUserJournalEntries}
        />

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
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsJournalOpen(true)}>
                        <BookText />
                        <span>Journal</span>
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
                <BrainLogo className="w-8 h-8"/>
                <h2 className="text-lg font-semibold">CounselAI - {activePersona.name}</h2>
            </div>
             <div className="flex items-center gap-1">
                <ThemeToggle />
                
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
