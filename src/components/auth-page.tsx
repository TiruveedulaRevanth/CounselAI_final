
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { BrainLogo } from "./brain-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { User, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

export type Profile = {
  id: string;
  name: string;
  email: string;
}

interface AuthPageProps {
  onSignInSuccess: (profile: Profile) => void;
  existingProfiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const passwordValidation = z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");


const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").refine(val => val.endsWith('@gmail.com'), {
      message: "Only Gmail addresses are allowed",
  }),
  phone: z.string().regex(/^[6-9]\d{9}$/, {
      message: "Phone number must be a valid 10-digit Indian number.",
  }),
  password: passwordValidation,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});


export default function AuthPage({ onSignInSuccess, existingProfiles, setProfiles }: AuthPageProps) {
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<"initial" | "login" | "signup">("initial");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs on the client and determines the initial auth mode.
    // It prevents hydration mismatch by ensuring server and client render the same initial null state.
    if (existingProfiles.length === 0) {
        setAuthMode("signup");
    } else {
        setAuthMode("initial");
    }
    setIsLoading(false);
  }, [existingProfiles]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    // In a real app, you'd call an API here to verify password.
    // For this prototype, we'll assume it's correct.
    if (!selectedProfile) return;
    
    console.log("Login submitted for:", selectedProfile.email, "with password:", values.password);
    toast({
        title: "Login Successful",
        description: `Welcome back, ${selectedProfile.name}!`,
    });
    onSignInSuccess(selectedProfile);
  };
  
  const handleSignUp = (values: z.infer<typeof signUpSchema>) => {
    console.log("Sign up submitted with:", values);
    const newProfile: Profile = {
        id: `profile-${Date.now()}`,
        name: values.name,
        email: values.email,
    };
    toast({
        title: "Sign Up Successful",
        description: "You can now start using CounselAI.",
    });
    // also update the profiles in the parent component
    const updatedProfiles = [...existingProfiles, newProfile];
    setProfiles(updatedProfiles);
    onSignInSuccess(newProfile);
  };
  
  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile);
    loginForm.setValue("email", profile.email);
    setAuthMode("login");
  }
  
  const FormSeparator = () => (
    <div className="flex items-center my-6">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-muted-foreground uppercase">Or</span>
        <div className="flex-grow border-t border-border"></div>
    </div>
  );

  const renderInitial = () => (
    <div className="w-full max-w-sm">
        <Card>
            <CardHeader className="text-center">
                <BrainLogo className="w-16 h-16 mx-auto text-primary mb-4"/>
                <CardTitle className="text-3xl">Welcome back</CardTitle>
                <CardDescription>Select a profile to continue.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
            {existingProfiles.map(profile => (
                <Button key={profile.id} variant="secondary" size="lg" className="w-full justify-start gap-4 h-14" onClick={() => handleProfileSelect(profile)}>
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                            {profile.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                        <p className="font-bold">{profile.name}</p>
                        <p className="text-sm text-muted-foreground -mt-1">{profile.email}</p>
                    </div>
                </Button>
            ))}
            </CardContent>
        </Card>
        <Card className="mt-4">
            <CardContent className="p-4 flex items-center justify-center text-sm">
                <p>Want to use a different account?</p>
                <Button variant="link" className="p-1" onClick={() => setAuthMode("signup")}>
                    Create New Profile
                </Button>
            </CardContent>
        </Card>
    </div>
  );

  const renderLogin = () => (
     <div className="w-full max-w-sm">
        <Card>
            <CardHeader className="items-center text-center">
                 <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-4xl">
                        {selectedProfile?.name.charAt(0).toUpperCase() ?? <User size={20} />}
                    </AvatarFallback>
                </Avatar>
                 <CardTitle className="text-2xl">{selectedProfile?.name}</CardTitle>
                 <CardDescription>{selectedProfile?.email}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
                        <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="password" placeholder="Password" {...field} autoFocus className="text-center"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full !mt-4">Log In</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        <Card className="mt-4">
            <CardContent className="p-4 text-center">
                <p className="text-sm">
                    Not {selectedProfile?.name}?{' '}
                    <Button variant="link" className="p-1 h-auto" onClick={() => { setAuthMode("initial"); setSelectedProfile(null); }}>
                        Use another account
                    </Button>
                </p>
            </CardContent>
        </Card>
    </div>
  );

  const renderSignUp = () => (
    <div className="w-full max-w-sm">
        <div className="p-1 rounded-xl bg-gradient-to-br from-[#8134AF] via-[#DD2A7B] to-[#FEDA77]">
            <div className="w-full bg-background rounded-lg p-8">
                <div className="text-center mb-6">
                    <BrainLogo className="w-12 h-12 mx-auto text-primary mb-4"/>
                    <h2 className="font-semibold text-muted-foreground">Sign up to start your journey with CounselAI.</h2>
                </div>
                
                <FormSeparator />

                <Form {...signUpForm}>
                    <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-3">
                        <FormField
                            control={signUpForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Full Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Email address (@gmail.com)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="password" placeholder="Password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="password" placeholder="Confirm Password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full !mt-6 text-white font-bold bg-gradient-to-r from-[#8134AF] via-[#DD2A7B] to-[#FEDA77] hover:from-[#8134AF]/90 hover:via-[#DD2A7B]/90 hover:to-[#FEDA77]/90">
                            Sign Up
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
         <Card className="mt-4">
            <CardContent className="p-4 text-center">
                 <p className="text-sm">
                    Have an account?{' '}
                    <Button variant="link" className="p-1 h-auto" onClick={() => { setAuthMode("initial"); setSelectedProfile(null); }}>
                    Log in
                    </Button>
                </p>
            </CardContent>
        </Card>
    </div>
  )

  const getAuthContent = () => {
    if (isLoading) {
        return (
             <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Loading profiles...</p>
             </div>
        );
    }
    switch (authMode) {
        case "initial":
            return renderInitial();
        case "login":
            return renderLogin();
        case "signup":
            return renderSignUp();
        default:
            return renderSignUp(); // Default to signup if no profiles exist
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 font-sans">
      {getAuthContent()}
    </div>
  );
}
