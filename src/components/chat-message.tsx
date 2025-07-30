
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User, Volume2 } from "lucide-react";
import type { Message } from "./empath-ai-client";
import { Button } from "./ui/button";
import { BrainLogo } from "./brain-logo";

interface ChatMessageProps {
  message: Message;
  userName: string | null;
  isInterim?: boolean;
  onSpeak?: (text: string) => void;
}

export default function ChatMessage({ message, userName, isInterim = false, onSpeak }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex items-start gap-4 w-full",
        !isAssistant && "justify-end",
        isInterim && "opacity-60"
      )}
    >
      {isAssistant && (
         <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-transparent">
                <BrainLogo />
            </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col", isAssistant ? "items-start" : "items-end")}>
        <p className="font-bold mb-1">{isAssistant ? "CounselAI" : "You"}</p>
        <div className={cn(
            "p-3 rounded-lg text-base leading-relaxed whitespace-pre-wrap max-w-md md:max-w-lg lg:max-w-xl",
            isAssistant ? "bg-assistant-bubble text-secondary-foreground" : "bg-user-bubble text-white"
        )}>
            {message.content}
        </div>
         {isAssistant && onSpeak && (
            <Button
              variant="ghost"
              size="icon"
              className="mt-2 h-7 w-7 text-muted-foreground"
              onClick={() => onSpeak(message.content)}
            >
              <Volume2 className="h-4 w-4" />
              <span className="sr-only">Speak</span>
            </Button>
          )}
      </div>
       {!isAssistant && (
         <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-destructive text-destructive-foreground font-bold">
                {userName ? userName.charAt(0).toUpperCase() : <User size={20} />}
            </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

const Loading = () => (
    <div className="flex items-start gap-4 w-full">
        <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-transparent">
                <BrainLogo />
            </AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <p className="font-bold mb-1">CounselAI</p>
            <div className="flex items-center gap-1.5 py-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '200ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
        </div>
    </div>
);

ChatMessage.Loading = Loading;
