
"use client";

import { useMemo } from "react";
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
import { therapyStyles, supportedLanguages } from "./empath-ai-client";

interface SettingsDialogProps {
  availableVoices: SpeechSynthesisVoice[];
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  therapyStyle: string;
  setTherapyStyle: (style: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

export default function SettingsDialog({
  availableVoices,
  selectedLanguage,
  setSelectedLanguage,
  selectedVoice,
  setSelectedVoice,
  therapyStyle,
  setTherapyStyle,
  isSettingsOpen,
  setIsSettingsOpen,
}: SettingsDialogProps) {

  const voicesForLanguage = useMemo(() => {
    return availableVoices
      .filter(voice => voice.lang.startsWith(selectedLanguage.substring(0, 2)))
      .slice(0, 2); // Get first 2 available voices for the selected language
  }, [availableVoices, selectedLanguage]);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    // Reset voice selection when language changes
    const newVoices = availableVoices.filter(v => v.lang.startsWith(value.substring(0,2)));
    setSelectedVoice(newVoices[0] || null);
  };

  const handleVoiceChange = (value: string) => {
    const voice = availableVoices.find(v => v.name === value) || null;
    setSelectedVoice(voice);
  };

  const handleTherapyStyleChange = (value: string) => {
    const style = therapyStyles.find(s => s.prompt === value);
    if (style) {
      setTherapyStyle(style.prompt);
    }
  };
    
  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your app preferences and data here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="language-select">Language</Label>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
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
            </div>
             <div className="space-y-2">
                <Label htmlFor="voice-select">Voice</Label>
                <Select
                    value={selectedVoice?.name}
                    onValueChange={handleVoiceChange}
                    disabled={voicesForLanguage.length === 0}
                >
                    <SelectTrigger id="voice-select">
                    <SelectValue placeholder={voicesForLanguage.length === 0 ? "No voices available" : "Select a voice"} />
                    </SelectTrigger>
                    <SelectContent>
                    {voicesForLanguage.map((voice, index) => (
                        <SelectItem key={`${voice.name}-${index}`} value={voice.name}>
                        {index === 0 ? "Nova" : "Orion"}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="therapy-style-select">Therapy Style</Label>
                <Select
                    value={therapyStyle}
                    onValueChange={handleTherapyStyleChange}
                >
                    <SelectTrigger id="therapy-style-select">
                    <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                    {therapyStyles.map((style) => (
                        <SelectItem key={style.name} value={style.prompt}>
                        {style.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
