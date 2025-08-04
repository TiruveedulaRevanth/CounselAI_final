
"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import type { Profile } from "./auth-page";

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
  const { toast } = useToast();

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

  const handleExportData = () => {
    try {
        const profilesString = localStorage.getItem("counselai-profiles");
        const profiles = profilesString ? JSON.parse(profilesString) : [];

        const allChats: { [key: string]: any } = {};

        profiles.forEach((profile: Profile) => {
            const chatsString = localStorage.getItem(`counselai-chats-${profile.id}`);
            if (chatsString) {
                allChats[profile.id] = JSON.parse(chatsString);
            }
        });

        const exportData = {
            profiles: profiles,
            chats: allChats,
            version: "1.0",
            exportedAt: new Date().toISOString(),
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "counselai-backup.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
            title: "Export Successful",
            description: "Your data has been saved to your downloads folder.",
        });

    } catch (error) {
        console.error("Export failed:", error);
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: "Could not export your data.",
        });
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
        <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={handleExportData} className="w-full">
                <Download className="mr-2 h-4 w-4"/>
                Export All Data
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
