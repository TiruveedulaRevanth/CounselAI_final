
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
import { therapyStyles, supportedLanguages } from "./empath-ai-client";

interface SettingsDialogProps {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  therapyStyle: string;
  setTherapyStyle: (style: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

export default function SettingsDialog({
  selectedLanguage,
  setSelectedLanguage,
  therapyStyle,
  setTherapyStyle,
  isSettingsOpen,
  setIsSettingsOpen,
}: SettingsDialogProps) {

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
                <Label htmlFor="language-select">Spoken Language</Label>
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
