
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";
import { useState } from "react";
import { therapyStyles } from "./empath-ai-client";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";

interface SettingsDialogProps {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  therapyStyle: string;
  setTherapyStyle: (style: string) => void;
  children?: React.ReactNode;
}

const settingsSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }).refine(
    (email) => email.endsWith("@gmail.com"),
    {
      message: "Please enter a valid Gmail address.",
    }
  ),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, { message: "Phone number must be in (123) 456-7890 format." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});


export default function SettingsDialog({
  voices,
  selectedVoice,
  setSelectedVoice,
  therapyStyle,
  setTherapyStyle,
  children,
}: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
    },
  });
  
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

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    console.log(values);
    setIsOpen(false);
  }
    
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full justify-start gap-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your CounselAI experience and manage your account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Email</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input placeholder="name@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Phone</FormLabel>
                   <div className="col-span-3">
                      <FormControl>
                        <Input placeholder="(123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Password</FormLabel>
                   <div className="col-span-3">
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="voice" className="text-right">
                AI Voice
              </Label>
              <Select
                onValueChange={handleVoiceChange}
                value={selectedVoice?.name}
              >
                <SelectTrigger id="voice" className="col-span-3">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.length > 0 ? voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  )) : <SelectItem value="loading" disabled>Loading voices...</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="therapy-style" className="text-right">
                Therapy Style
              </Label>
              <Select
                onValueChange={handleTherapyStyleChange}
                value={therapyStyle}
              >
                <SelectTrigger id="therapy-style" className="col-span-3">
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
            <DialogFooter>
              <Button type="submit">Save & Close</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
