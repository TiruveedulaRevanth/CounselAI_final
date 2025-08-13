
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { therapyStyles, supportedLanguages, CustomPersona } from "./empath-ai-client";
import { Card, CardHeader } from "./ui/card";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { Slider } from "./ui/slider";
import { BrainLogo } from "./brain-logo";

type Persona = typeof therapyStyles[0];

interface SettingsDialogProps {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  therapyStyle: string;
  setTherapyStyle: (style: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  activePersona: Persona | { name: string };
  setActivePersona: (persona: Persona | { name: string, prompt: string }) => void;
  customPersona: CustomPersona;
  setCustomPersona: (persona: CustomPersona) => void;
}

export default function SettingsDialog({
  selectedLanguage,
  setSelectedLanguage,
  therapyStyle,
  setTherapyStyle,
  isSettingsOpen,
  setIsSettingsOpen,
  activePersona,
  setActivePersona,
  customPersona,
  setCustomPersona,
}: SettingsDialogProps) {
  
  const isCustomMode = activePersona.name === 'Custom';

  const generateCustomPrompt = (persona: CustomPersona): string => {
    const parts = Object.entries(persona)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => {
            const style = therapyStyles.find(s => s.name === name);
            return style ? `${value}% ${style.name}` : null;
        });
    
    if (parts.every(p => p === null)) {
      return "Act as a general, supportive AI assistant.";
    }

    return `Synthesize a personality that is a blend of the following traits, weighted by the given percentages: ${parts.filter(Boolean).join(', ')}. Ensure your response style reflects this blend.`;
  }
  
  useEffect(() => {
    if (isCustomMode) {
        const newPrompt = generateCustomPrompt(customPersona);
        setTherapyStyle(newPrompt);
    }
  }, [customPersona, isCustomMode, setTherapyStyle]);


  const handlePersonaSelect = (persona: Persona) => {
    setActivePersona(persona);
    setTherapyStyle(persona.prompt);
  };

  const handleCustomSelect = () => {
    setActivePersona({
        name: 'Custom',
        prompt: generateCustomPrompt(customPersona),
    });
  }

  const handleSliderChange = (personaName: string, value: number[]) => {
    const newCustomPersona = { ...customPersona, [personaName]: value[0] };

    // Normalize so the sum is 100
    const total = Object.values(newCustomPersona).reduce((sum, v) => sum + v, 0);
    if (total > 0) { // Avoid division by zero
        const scale = 100 / total;
        for (const key in newCustomPersona) {
            newCustomPersona[key] = Math.round(newCustomPersona[key] * scale);
        }
    }
    // Due to rounding, the sum might not be exactly 100. Let's adjust the largest value.
    const finalTotal = Object.values(newCustomPersona).reduce((sum, v) => sum + v, 0);
    const diff = 100 - finalTotal;
    if (diff !== 0) {
        const maxKey = Object.keys(newCustomPersona).reduce((a, b) => newCustomPersona[a] > newCustomPersona[b] ? a : b);
        newCustomPersona[maxKey] += diff;
    }
    
    setCustomPersona(newCustomPersona);
  }

  const personaCards = useMemo(() => therapyStyles.map((persona) => (
    <Card
      key={persona.name}
      onClick={() => handlePersonaSelect(persona)}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        activePersona.name === persona.name && "ring-2 ring-primary shadow-lg"
      )}
    >
      <CardHeader className="items-center text-center p-4">
        <BrainLogo className="w-[60px] h-[60px] mb-2" />
        <h3 className="font-semibold">{persona.name}</h3>
        <p className="text-xs text-muted-foreground">{persona.description}</p>
      </CardHeader>
    </Card>
  )), [activePersona.name, handlePersonaSelect]);


  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Choose your AI persona and manage other preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <Label className="text-base font-semibold">Choose Your AI Persona</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-2">
              {personaCards}
               <Card
                  onClick={handleCustomSelect}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-center text-center p-4",
                     isCustomMode && "ring-2 ring-primary shadow-lg"
                  )}
                >
                    <h3 className="font-semibold">Custom Personality</h3>
                    <p className="text-xs text-muted-foreground mt-2">Blend different personas to create your own ideal therapist.</p>
                </Card>
            </div>
          </div>
          
          {isCustomMode && (
            <div className="space-y-4 p-4 border rounded-lg">
              <Label className="font-semibold text-base">Customize Your Persona Blend</Label>
              <p className="text-sm text-muted-foreground -mt-2">Adjust the sliders to mix different personality traits.</p>
              {Object.entries(customPersona).map(([name, value]) => (
                <div key={name} className="grid gap-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor={`slider-${name}`}>{name}</Label>
                        <span className="text-sm font-medium text-primary">{value}%</span>
                    </div>
                  <Slider
                    id={`slider-${name}`}
                    min={0}
                    max={100}
                    step={1}
                    value={[value]}
                    onValueChange={(newValue) => handleSliderChange(name, newValue)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="language-select" className="font-semibold">Spoken Language</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger id="language-select">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This sets the language for both voice recognition and the AI's spoken responses.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
