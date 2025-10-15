
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User, Volume2, StopCircle, Loader2 } from "lucide-react";
import type { Message } from "./empath-ai-client";
import { Button } from "./ui/button";
import { BrainLogo } from "./brain-logo";

interface ChatMessageProps {
  message: Message;
  userName: string | null;
  isInterim?: boolean;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
  isAudioLoading?: boolean;
  onStopSpeaking?: () => void;
}

export default function ChatMessage({ 
    message, 
    userName, 
    isInterim = false, 
    onSpeak,
    isSpeaking,
    isAudioLoading,
    onStopSpeaking,
}: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  const handleSpeakClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent the bubble click from triggering
    if (isSpeaking) {
      onStopSpeaking?.();
    } else {
      onSpeak?.(message.content);
    }
  }

  const handleBubbleClick = () => {
    if (isAssistant && isSpeaking) {
      onStopSpeaking?.();
    }
  }

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
        <p className="font-bold mb-1 text-sm text-foreground/80">{isAssistant ? "CounselAI" : "You"}</p>
        <div 
            className={cn(
                "p-3 rounded-lg text-base leading-relaxed whitespace-pre-wrap max-w-md md:max-w-lg lg:max-w-xl shadow",
                isAssistant ? "bg-assistant-bubble" : "bg-user-bubble text-primary-foreground",
                isAssistant && isSpeaking && "cursor-pointer hover:bg-assistant-bubble/80 transition-colors"
            )}
            onClick={handleBubbleClick}
        >
            {message.content}
        </div>
         {isAssistant && onSpeak && (
            <Button
              variant="ghost"
              size="icon"
              className="mt-2 h-7 w-7 text-muted-foreground"
              onClick={handleSpeakClick}
              disabled={isAudioLoading}
            >
              {isAudioLoading ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSpeaking ? (
                 <StopCircle className="h-4 w-4" />
              ) : (
                 <Volume2 className="h-4 w-4" />
              )}
              <span className="sr-only">{isSpeaking ? 'Stop speaking' : 'Speak'}</span>
            </Button>
          )}
      </div>
       {!isAssistant && (
         <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-accent text-accent-foreground font-bold">
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
        <div className="flex flex-col">
            <p className="font-bold mb-1 text-sm text-foreground/80">CounselAI</p>
            <div className="p-3 rounded-lg bg-secondary flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '200ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
        </div>
    </div>
);

ChatMessage.Loading = Loading;
