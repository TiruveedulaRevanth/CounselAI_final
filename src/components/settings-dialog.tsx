
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  therapyStyle: string;
  setTherapyStyle: (style: string) => void;
  isSignUpOpen: boolean;
  setIsSignUpOpen: (isOpen: boolean) => void;
  onSignUpSuccess: (name: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").refine(val => val.endsWith('@gmail.com'), {
        message: "Only Gmail addresses are allowed",
    }),
    phone: z.string().regex(/^[6-9]\d{9}$/, {
        message: "Phone number must be a valid 10-digit Indian number.",
    }),
    password: z.string().min(8, "Password must be at least 8 characters"),
});


export default function SettingsDialog({
  voices,
  selectedVoice,
  setSelectedVoice,
  therapyStyle,
  setTherapyStyle,
  isSignUpOpen,
  setIsSignUpOpen,
  onSignUpSuccess,
  isSettingsOpen,
  setIsSettingsOpen,
}: SettingsDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Sign up successful with:", values);
    toast({
        title: "Sign Up Successful",
        description: "You can now start using CounselAI.",
    });
    onSignUpSuccess(values.name);
  };

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

  if (isSignUpOpen) {
    return (
        <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
        <DialogContent className="sm:max-w-[425px]" hideCloseButton={true}>
            <DialogHeader>
            <DialogTitle>Welcome to CounselAI</DialogTitle>
            <DialogDescription>
                Please create an account to get started.
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4">
                                <FormLabel className="text-right">Name</FormLabel>
                                <FormControl className="col-span-3">
                                    <Input placeholder="Your Name" {...field} />
                                </FormControl>
                                <FormMessage className="col-span-4 text-right" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4">
                                <FormLabel className="text-right">Email</FormLabel>
                                <FormControl className="col-span-3">
                                    <Input placeholder="user@gmail.com" {...field} />
                                </FormControl>
                                <FormMessage className="col-span-4 text-right" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4">
                                <FormLabel className="text-right">Phone</FormLabel>
                                <FormControl className="col-span-3">
                                    <Input placeholder="10-digit number" {...field} />
                                </FormControl>
                                <FormMessage className="col-span-4 text-right" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4">
                                <FormLabel className="text-right">Password</FormLabel>
                                <FormControl className="col-span-3">
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage className="col-span-4 text-right" />
                            </FormItem>
                        )}
                    />
                    
                    <DialogFooter>
                        <Button type="submit">Sign Up</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
        </Dialog>
    );
  }
    
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
                {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
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
