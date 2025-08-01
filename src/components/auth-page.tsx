
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

export type Profile = {
  id: string;
  name: string;
  email: string;
}

interface AuthPageProps {
  onSignInSuccess: (profile: Profile) => void;
  existingProfiles: Profile[];
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


export default function AuthPage({ onSignInSuccess, existingProfiles }: AuthPageProps) {
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<"initial" | "login" | "signup">("initial");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (existingProfiles.length === 0) {
        setAuthMode("signup");
    }
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
    onSignInSuccess(newProfile);
  };
  
  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile);
    loginForm.setValue("email", profile.email);
    setAuthMode("login");
  }

  const renderInitial = () => (
    <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <BrainLogo className="w-16 h-16 mx-auto text-primary mb-4"/>
            <CardTitle className="text-3xl">Welcome to CounselAI</CardTitle>
            <CardDescription>Select a profile to continue or create a new one.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
           {existingProfiles.map(profile => (
            <Button key={profile.id} variant="secondary" size="lg" className="w-full justify-start gap-4 h-14" onClick={() => handleProfileSelect(profile)}>
                 <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-destructive text-destructive-foreground font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="text-left">
                    <p className="font-bold">{profile.name}</p>
                    <p className="text-sm text-muted-foreground -mt-1">{profile.email}</p>
                </div>
            </Button>
           ))}
            <Button size="lg" className="w-full mt-2" onClick={() => setAuthMode("signup")}>
                <UserPlus className="mr-2 h-5 w-5"/>
                Create New Profile
            </Button>
        </CardContent>
    </Card>
  );

  const renderLogin = () => (
     <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <Avatar className="h-16 w-16 mx-auto">
                <AvatarFallback className="bg-destructive text-destructive-foreground font-bold text-3xl">
                    {selectedProfile?.name.charAt(0).toUpperCase() ?? <User size={20} />}
                </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl pt-2">Welcome back, {selectedProfile?.name}</CardTitle>
            <CardDescription>Enter your password to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                     <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="hidden">
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="user@gmail.com" {...field} readOnly />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} autoFocus/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">Log In</Button>
                </form>
            </Form>
            <Button variant="link" className="mt-4 w-full" onClick={() => { setAuthMode("initial"); setSelectedProfile(null); }}>
                Back to profiles
            </Button>
        </CardContent>
    </Card>
  );

  const renderSignUp = () => (
    <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="text-2xl">Create a New Profile</CardTitle>
            <CardDescription>Sign up to start your journey with CounselAI.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-3">
                     <FormField
                        control={signUpForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Name" {...field} />
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
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="user@gmail.com" {...field} />
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
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="10-digit number" {...field} />
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
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
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full !mt-6">Create Account</Button>
                </form>
            </Form>
            { existingProfiles.length > 0 && 
                <Button variant="link" className="mt-4 w-full" onClick={() => setAuthMode("initial")}>
                    Back to profiles
                </Button>
            }
        </CardContent>
    </Card>
  )

  const renderLoading = () => (
    <div className="flex items-center justify-center min-h-screen">
        {/* You can replace this with a proper spinner component */}
        <p>Loading profiles...</p>
    </div>
  )

  const getAuthContent = () => {
    switch (authMode) {
        case "initial":
            return renderInitial();
        case "login":
            return renderLogin();
        case "signup":
            return renderSignUp();
        default:
            return renderLoading();
    }
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {getAuthContent()}
    </div>
  );
}
