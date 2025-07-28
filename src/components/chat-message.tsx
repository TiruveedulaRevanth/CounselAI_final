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
        "flex items-start gap-3",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot size={20} />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-sm md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl shadow-md",
          isAssistant
            ? "bg-card rounded-bl-none"
            : "bg-primary text-primary-foreground rounded-br-none",
          isInterim && "opacity-60"
        )}
      >
        <p className="text-base leading-relaxed">{message.content}</p>
      </div>
      {!isAssistant && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User size={20} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

const Loading = () => (
  <div className="flex items-start gap-3 justify-start">
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-primary text-primary-foreground">
        <Bot size={20} />
      </AvatarFallback>
    </Avatar>
    <div className="max-w-sm md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl shadow-md bg-card rounded-bl-none">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{animationDelay: '0ms'}}/>
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{animationDelay: '200ms'}}/>
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{animationDelay: '400ms'}}/>
      </div>
    </div>
  </div>
);

ChatMessage.Loading = Loading;
