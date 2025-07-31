
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { Resource } from "./resources-library";
import { BookOpen } from "lucide-react";

interface ResourceCardProps {
  resource: Resource;
  onReadMore: () => void;
}

export default function ResourceCard({ resource, onReadMore }: ResourceCardProps) {
  const gradients = {
    'Core Mental Health': "from-sky-200 to-blue-200",
    'Stress & Burnout': "from-amber-200 to-orange-200",
    'Sleep': "from-slate-300 to-gray-400",
    'Relationships': "from-pink-200 to-rose-200",
    'Academic/Work Pressure': 'from-orange-200 to-red-200',
    'Self-Care': 'from-green-200 to-emerald-200',
    'Crisis Support': 'from-red-300 to-rose-300',
  };
  const darkGradients = {
    'Core Mental Health': "dark:from-sky-900 dark:to-blue-900",
    'Stress & Burnout': "dark:from-amber-900 dark:to-orange-900",
    'Sleep': "dark:from-slate-800 dark:to-gray-700",
    'Relationships': "dark:from-pink-900 dark:to-rose-900",
    'Academic/Work Pressure': 'dark:from-orange-900 dark:to-red-900',
    'Self-Care': 'dark:from-green-900 dark:to-emerald-900',
    'Crisis Support': 'dark:from-red-800 dark:to-rose-800',
  }

  const gradientClass = `${gradients[resource.category]} ${darkGradients[resource.category]}`;


  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex-1 flex flex-col">
         <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
            <div
                className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}
                data-ai-hint={`${resource.category.toLowerCase()} abstract`}
            />
         </div>
        <Badge variant="secondary" className="w-fit mb-2">{resource.category}</Badge>
        <CardTitle className="text-lg mt-1 flex-grow">{resource.title}</CardTitle>
        <CardDescription className="line-clamp-3 mt-1 text-sm">{resource.description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto pt-4">
        <Button onClick={onReadMore} className="w-full">
          <BookOpen className="mr-2 h-4 w-4"/>
          Read Article
        </Button>
      </CardFooter>
    </Card>
  );
}

    

    