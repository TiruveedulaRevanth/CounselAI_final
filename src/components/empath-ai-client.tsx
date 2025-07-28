"use client";

import { personalizeTherapyStyle } from "@/ai/flows/therapy-style-personalization";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bot, BrainCircuit, Mic, Send, Settings, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ChatMessage from "./chat-message";
import SettingsDialog from "./settings-dialog";

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

export default function EmpathAIClient() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm EmpathAI, your personal mental health assistant. I'm here to listen and support you. Tap the microphone to begin.",
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");

  // Settings state
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [therapyStyle, setTherapyStyle] = useState(
    "An empathetic, supportive, and non-judgmental friend who listens carefully and responds in a calm, reassuring tone. Adapt to the user's emotional state."
  );

  const speechRecognition = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSpokenInitialMessage = useRef(false);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(availableVoices[0]);
        }
      };
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
      
      if (!hasSpokenInitialMessage.current && messages.length > 0) {
        setTimeout(() => {
          speakText(messages[0].content);
          hasSpokenInitialMessage.current = true;
        }, 100);
      }
    }

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
        toast({
          variant: "destructive",
          title: "Speech Recognition Error",
          description: event.error,
        });
        setIsListening(false);
      };

      speechRecognition.current = recognition;
    }
  }, [selectedVoice]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleMicClick = () => {
    if (isListening) {
      speechRecognition.current?.stop();
      if(userInput.trim()) {
        handleSend(userInput);
      }
    } else {
      speechRecognition.current?.start();
      setUserInput("");
    }
    setIsListening(!isListening);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const result = await personalizeTherapyStyle({
        therapyStyle: therapyStyle,
        userInput: text,
      });

      if (result.response) {
        const newAssistantMessage: Message = {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          content: result.response,
        };
        setMessages((prev) => [...prev, newAssistantMessage]);
        speakText(result.response);
      } else {
        throw new Error("Received an empty response from the AI.");
      }
    } catch (error) {
      console.error("Error calling AI:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description:
          "Sorry, I encountered an error. Please try again.",
      });
      // Optionally remove the user message or add an error message to the chat
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background font-body text-foreground">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline">EmpathAI</h1>
        </div>
        <SettingsDialog
          voices={voices}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          therapyStyle={therapyStyle}
          setTherapyStyle={setTherapyStyle}
        />
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <Card className="flex-1 flex flex-col shadow-lg">
          <CardContent className="flex-1 p-2 md:p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isListening && userInput && (
                 <ChatMessage message={{id: 'interim', role: 'user', content: userInput}} isInterim/>
              )}
              {isLoading && <ChatMessage.Loading />}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="p-4 flex flex-col items-center justify-center space-y-4">
        <p className="text-sm text-muted-foreground text-center">
            {isListening ? "Listening... Click the mic to send." : "Tap the microphone to start speaking."}
        </p>
        <Button
          size="icon"
          className={`h-20 w-20 rounded-full shadow-2xl transition-all duration-300 ${
            isListening ? "bg-destructive animate-pulse" : "bg-primary"
          }`}
          onClick={handleMicClick}
          disabled={isLoading}
        >
          <Mic className="h-10 w-10" />
        </Button>
      </footer>
    </div>
  );
}
