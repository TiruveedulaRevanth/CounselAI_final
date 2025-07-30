
"use client";

import { personalizeTherapyStyle } from "@/ai/flows/therapy-style-personalization";
import { summarizeChat } from "@/ai/flows/summarize-chat-flow";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Mic, Plus, Send, Settings, Square, Trash2 } from "lucide-react";
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
import { subDays, isToday, isYesterday, isAfter } from 'date-fns';
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
import { BrainLogo } from "./brain-logo";
import { ThemeToggle } from "./theme-toggle";

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


interface EmpathAIClientProps {
    userName: string | null;
    onSignOut: () => void;
}


export default function EmpathAIClient({ userName, onSignOut }: EmpathAIClientProps) {
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);


  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userInput, setUserInput] = useState("");

  // Settings state
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [therapyStyle, setTherapyStyle] = useState(therapyStyles[0].prompt);

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
          createNewChat();
        }
      } else {
        createNewChat();
      }
    } catch (error) {
      console.error("Failed to load chats from local storage:", error);
      createNewChat();
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
                const newId = createNewChat();
                setActiveChatId(newId);
                return [{
                  id: newId,
                  name: "New Chat",
                  createdAt: new Date().toISOString(),
                  messages: [],
                }];
            }
        }
        return remainingChats;
    });
  };

  const activeChat = useMemo(() => chats.find(chat => chat.id === activeChatId), [chats, activeChatId]);

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
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
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          if (!selectedVoice) {
            const preferredVoice = availableVoices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || availableVoices[0];
            setSelectedVoice(preferredVoice);
          }
        }
      };
      
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      }
    }
  }, [selectedVoice]);

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

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
  }, [toast]);

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
    if (!text.trim() || isLoading || !activeChatId) return;
  
    const currentChatId = activeChatId;
    const isFirstMessage = (activeChat?.messages.length ?? 0) === 0;
  
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
  
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


  return (
    <>
       <SettingsDialog
          voices={voices}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          therapyStyle={therapyStyle}
          setTherapyStyle={setTherapyStyle}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
        />
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <BrainLogo className="h-8 w-8" />
                <h1 className="text-xl font-bold font-headline">CounselAI</h1>
              </div>
              <Button variant="ghost" size="icon" onClick={() => createNewChat()}>
                  <Plus className="h-6 w-6"/>
                  <span className="sr-only">New Chat</span>
              </Button>
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
                                            This action cannot be undone. This will permanently delete your
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
        <div className="flex flex-col h-screen bg-background font-body text-foreground">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-bold font-headline">CounselAI</h1>
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Sign Out</span>
                </Button>
            </div>
          </header>

          <main className="flex-1 flex flex-col overflow-hidden">
             {activeChat && activeChat.messages.length > 0 ? (
                <ScrollArea className="flex-grow h-0">
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
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <BrainLogo className="w-16 h-16 text-primary"/>
                    <h2 className="text-2xl font-bold">{userName && (!activeChat || activeChat.messages.length === 0) ? `Welcome back, ${userName}`: 'Ready when you are.'}</h2>
                    <p className="text-muted-foreground mt-2">Start a new conversation by typing below or using the microphone.</p>
                </div>
              )}
          </main>

          <footer className="p-4 w-full">
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
                      <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 shrink-0 rounded-full"
                      onClick={handleStopSpeaking}
                      >
                      <Square className="h-5 w-5" />
                      </Button>
                  ) : (
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
                  )}
                  <Button
                      size="icon"
                      onClick={() => handleSend(userInput)}
                      disabled={!userInput.trim() || isLoading || !activeChatId}
                      className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-600"
                  >
                      <Send className="h-5 w-5" />
                  </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2 h-4">
                {isListening ? "Listening... Press mic again to stop." : isSpeaking ? "Speaking..." : isLoading ? "Thinking..." : activeChatId ? "CounselAI can make mistakes. Consider checking important information." : "Create a new chat to begin."}
            </p>
          </footer>
        </div>
       </SidebarInset>
    </>
  );
}
