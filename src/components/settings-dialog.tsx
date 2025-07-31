
"use client";

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
import { therapyStyles } from "./empath-ai-client";

interface SettingsDialogProps {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  therapyStyle: string;
  setTherapyStyle: (style: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

export default function SettingsDialog({
  voices,
  selectedVoice,
  setSelectedVoice,
  therapyStyle,
  setTherapyStyle,
  isSettingsOpen,
  setIsSettingsOpen,
}: SettingsDialogProps) {

  const handleVoiceChange = (value: string) => {
    const voice = voices.find(v => v.name === value) || null;
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your app preferences here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="voice-select" className="text-right">
                Voice
            </Label>
            <Select
                value={selectedVoice?.name}
                onValueChange={handleVoiceChange}
            >
                <SelectTrigger id="voice-select" className="col-span-3">
                <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                {voices.map((voice, index) => (
                    <SelectItem key={`${voice.name}-${index}`} value={voice.name}>
                    {voice.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="therapy-style-select" className="text-right">
                Therapy Style
            </Label>
            <Select
                value={therapyStyle}
                onValueChange={handleTherapyStyleChange}
            >
                <SelectTrigger id="therapy-style-select" className="col-span-3">
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
