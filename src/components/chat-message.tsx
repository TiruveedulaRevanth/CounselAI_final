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
        "flex items-start gap-4",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Bot size={24} />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-md md:max-w-lg lg:max-w-xl px-5 py-3 shadow-lg transition-all",
          isAssistant
            ? "bg-gradient-to-br from-card to-muted rounded-3xl rounded-bl-lg"
            : "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-3xl rounded-br-lg",
          isInterim && "opacity-60"
        )}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
      {!isAssistant && (
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User size={24} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

const Loading = () => (
  <div className="flex items-start gap-4 justify-start">
    <Avatar className="h-10 w-10">
      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <Bot size={24} />
      </AvatarFallback>
    </Avatar>
    <div className="max-w-sm md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-3xl rounded-bl-lg shadow-lg bg-gradient-to-br from-card to-muted">
      <div className="flex items-center gap-1.5 py-2">
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{animationDelay: '0ms'}}/>
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{animationDelay: '200ms'}}/>
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{animationDelay: '400ms'}}/>
      </div>
    </div>
  </div>
);

ChatMessage.Loading = Loading;
