"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import type { Message } from "./empath-ai-client";

interface ChatMessageProps {
  message: Message;
  isInterim?: boolean;
}

export default function ChatMessage({ message, isInterim = false }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex items-start gap-4 w-full",
        isInterim && "opacity-60"
      )}
    >
      <Avatar className="h-8 w-8">
          <AvatarFallback className={cn(isAssistant ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground")}>
            {isAssistant ? <Bot size={20} /> : <User size={20} />}
          </AvatarFallback>
        </Avatar>
      <div className="flex-1">
        <p className="font-bold mb-1">{isAssistant ? "CounselAI" : "You"}</p>
        <div className={cn(
            "p-3 rounded-lg text-base leading-relaxed whitespace-pre-wrap",
            isAssistant ? "bg-assistant-bubble text-white" : "bg-user-bubble text-black"
        )}>
            {message.content}
        </div>
      </div>
    </div>
  );
}

const Loading = () => (
    <div className="flex items-start gap-4 w-full">
        <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot size={20} />
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
