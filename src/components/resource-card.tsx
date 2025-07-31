
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Resource } from "./resources-library";
import { Video, BookOpen } from "lucide-react";

interface ResourceCardProps {
  resource: Resource;
  onReadMore: () => void;
}

export default function ResourceCard({ resource, onReadMore }: ResourceCardProps) {
  const gradients = {
    Anxiety: "from-blue-200 to-cyan-200",
    Depression: "from-indigo-200 to-purple-200",
    Sleep: "from-slate-300 to-gray-400",
    Stress: "from-amber-200 to-orange-200",
    Relationships: "from-pink-200 to-rose-200",
  };
  const darkGradients = {
    Anxiety: "dark:from-blue-900 dark:to-cyan-900",
    Depression: "dark:from-indigo-900 dark:to-purple-900",
    Sleep: "dark:from-slate-800 dark:to-gray-700",
    Stress: "dark:from-amber-900 dark:to-orange-900",
    Relationships: "dark:from-pink-900 dark:to-rose-900",
  }

  const gradientClass = `${gradients[resource.category]} ${darkGradients[resource.category]}`;


  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader>
         <div className="relative w-full h-40 mb-4 rounded-t-lg">
            <div
                className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-50`}
                data-ai-hint={`${resource.category.toLowerCase()} abstract`}
            />
         </div>
        <Badge variant="secondary" className="w-fit">{resource.category}</Badge>
        <CardTitle className="text-lg mt-2">{resource.title}</CardTitle>
        <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Button onClick={onReadMore} className="w-full">
          {resource.type === 'video' ? <Video className="mr-2 h-4 w-4"/> : <BookOpen className="mr-2 h-4 w-4"/>}
          {resource.type === 'video' ? 'Watch Video' : 'Read More'}
        </Button>
      </CardFooter>
    </Card>
  );
}
