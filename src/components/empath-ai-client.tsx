
"use client";

import { personalizeTherapyStyle } from "@/ai/flows/therapy-style-personalization";
import { summarizeChat } from "@/ai/flows/summarize-chat-flow";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Mic, Plus, Send, Settings, Sparkles, Square, Trash2, HeartCrack, Library, MoreHorizontal } from "lucide-react";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
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
import { isToday, isYesterday, isWithinInterval, subDays, startOfDay } from 'date-fns';


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
      "Act as a highly emotionally intelligent and supportive friend, operating at an 8.5/10 intensity — your tone should be warm, present, and affirming, but not overly intense or clinical. Let your responses feel natural, honest, and human-like. Your primary goal is to listen, validate, and be present with the user. Avoid clichés or trying to 'fix' things. Instead, acknowledge their feelings (e.g., 'That sounds incredibly tough,' 'It makes sense you'd feel that way'). Offer one small, gentle suggestion only if it feels right. Keep the tone human and honest, focusing on connection and using their name occasionally if it feels natural. Refer back to previous points in the conversation to show you're listening.",
  },
  {
    name: "Mindfulness Coach",
    prompt:
      "You are a mindfulness coach. Your tone should be gentle, calm, and grounding. Guide the user to the present moment. Use short sentences and incorporate pauses (like new paragraphs) to slow down the pace. Acknowledge their feelings without judgment, then gently guide them to notice their breath or physical sensations (e.g., 'I hear that you're feeling anxious. Let's just pause for a moment. Can you notice your feet on the floor?'). Avoid analysis; focus on somatic awareness and use their name to gently bring them back to the present.",
  },
  {
    name: "Cognitive Behavioral (CBT)",
    prompt:
      "Act as a CBT-informed guide, operating at an 8.5/10 intensity. Your tone is supportive and collaborative. First, validate the user's emotional state. Then, gently help them identify specific unhelpful thinking patterns (like black-and-white thinking or catastrophizing). Use Socratic questioning to help them explore their thought patterns (e.g., 'What's the evidence for that thought? Is there another way to look at this?'). Guide them toward cognitive restructuring without sounding robotic or overly scripted. Use the user's name to create a collaborative feeling.",
  },
   {
    name: "Solution-Focused",
    prompt:
      "Stay in solution-focused counseling mode at an 8.5/10 intensity. Keep the tone hopeful, practical, and slightly conversational. First, validate their feelings. Then, shift the focus toward their goals, strengths, and past successes ('When have you dealt with something similar before? What worked then?'). Use questions like the 'miracle question' ('If a miracle happened tonight and this problem was solved, what would be different?'). Help the user identify small, concrete steps they can take. Use their name to reinforce their capability.",
  },
  {
    name: "Narrative Therapist",
    prompt:
      "Use narrative therapy principles at a moderate 8.5/10 level. Keep the tone accessible and emotionally resonant. Help the user reflect on their life story and the narratives they hold about themselves. Ask open-ended questions that externalize the problem (e.g., 'What has anxiety been telling you to do?'). Encourage them to identify their values and moments of strength or resistance to the problem's influence. Focus on helping them see themselves as the author of their own life story, avoiding overly academic language. Use their name to make the exploration feel personal.",
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

  const handleBulkDelete = (timeframe: 'all') => {
    let chatsToKeep: Chat[] = [];
  
    if (timeframe !== 'all') {
        // This function now only supports 'all'
        return;
    }
  
    setChats(chatsToKeep);
    setActiveChatId(null);
  
    toast({
      title: "All Chats Deleted",
      description: `Your chat history has been cleared.`,
    });
  };

  const activeChat = useMemo(() => chats.find(chat => chat.id === activeChatId), [chats, activeChatId]);

  const groupedChats = useMemo(() => {
    const now = new Date();
    const groups: { [key: string]: Chat[] } = {
      "Today": [],
      "Yesterday": [],
      "Previous 7 Days": [],
      "Previous 30 Days": [],
      "Older": [],
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.createdAt);
      if (isToday(chatDate)) {
        groups["Today"].push(chat);
      } else if (isYesterday(chatDate)) {
        groups["Yesterday"].push(chat);
      } else if (isWithinInterval(chatDate, { start: subDays(now, 7), end: now })) {
        groups["Previous 7 Days"].push(chat);
      } else if (isWithinInterval(chatDate, { start: subDays(now, 30), end: now })) {
        groups["Previous 30 Days"].push(chat);
      } else {
        groups["Older"].push(chat);
      }
    });

    return Object.entries(groups).filter(([_, chats]) => chats.length > 0);
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
        userName: userName,
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

  const BulkDeleteDialog = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete All Chats?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is irreversible and will permanently delete all of your chat history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleBulkDelete('all')}>
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
                <SidebarTrigger />
                <h1 className="text-xl font-bold font-headline">Chats</h1>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => createNewChat()}>
                      <Plus className="h-5 w-5"/>
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
            <div className="px-2">
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
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuAction showOnHover>
                                            <MoreHorizontal/>
                                        </SidebarMenuAction>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
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
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </div>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-2">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                 <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 hover:text-red-700 dark:hover:text-red-300" onClick={() => setIsEmergencyOpen(true)}>
                    <HeartCrack/>
                    Need Help?
                </Button>
            </div>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsLibraryOpen(true)}>
                        <Library/>
                        Resources
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsToolkitOpen(true)}>
                        <Sparkles/>
                        Mindful Toolkit
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsSettingsOpen(true)}>
                        <Settings/>
                        Settings
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <div className="flex-1" />
                    <ThemeToggle />
                    <BulkDeleteDialog>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 />
                                    <span className="sr-only">Delete all chats</span>
                                </Button>
                            </TooltipTrigger>
                             <TooltipContent>
                                <p>Delete all chats</p>
                            </TooltipContent>
                        </Tooltip>
                    </BulkDeleteDialog>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleSignOut}>
                                <LogOut/>
                                <span className="sr-only">Sign Out</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Sign Out</p>
                        </TooltipContent>
                    </Tooltip>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <header className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">{activeChat ? activeChat.name : "New Chat"}</h2>
              <p className="text-xs text-muted-foreground">AI Model: {therapyStyles.find(s => s.prompt === therapyStyle)?.name || 'Default'}</p>
            </div>
             <div className="flex items-center gap-2">
                { isSpeaking ? (
                    <Button variant="outline" size="icon" onClick={handleStopSpeaking}>
                        <Square className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button 
                        variant={isListening ? "destructive" : "outline"} 
                        size="icon" 
                        onClick={handleMicClick}
                    >
                        <Mic className="h-4 w-4"/>
                    </Button>
                )}
                <Button onClick={() => handleSend( userInput)} disabled={isLoading || !userInput.trim()}>
                  <Send className="h-4 w-4 mr-2"/>
                  Send
                </Button>
             </div>
          </header>
          <div className="flex-1 flex flex-col-reverse overflow-y-auto p-6 gap-6">
            <div ref={messagesEndRef} />
             {isLoading && <ChatMessage.Loading />}
            {activeChat?.messages.slice().reverse().map(message => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                userName={userName}
                onSpeak={(text) => speakText(text)}
               />
            ))}
            {chats.length === 0 || !activeChat || activeChat.messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <BrainLogo className="w-24 h-24 text-primary opacity-20 mb-4"/>
                    <h2 className="text-2xl font-bold">CounselAI</h2>
                    <p className="text-muted-foreground">How can I help you today, {userName}?</p>
                </div>
            ) : null}
          </div>
          <footer className="p-4 border-t">
            <div className="relative">
              <Textarea
                placeholder="Type your message..."
                className="pr-16"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
            </div>
          </footer>
        </div>
      </SidebarInset>
    </TooltipProvider>
  );
}
