
"use client";

import { useState } from "react";
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
import { Separator } from "./ui/separator";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

interface AuthPageProps {
  onSignInSuccess: (name: string) => void;
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").refine(val => val.endsWith('@gmail.com'), {
      message: "Only Gmail addresses are allowed",
  }),
  phone: z.string().regex(/^[6-9]\d{9}$/, {
      message: "Phone number must be a valid 10-digit Indian number.",
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.61,44,30.456,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function AuthPage({ onSignInSuccess }: AuthPageProps) {
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<"initial" | "login" | "signup">("initial");

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    // In a real app, you'd call an API here.
    // We'll simulate a login by using the email as the name.
    console.log("Login submitted with:", values);
    const name = values.email.split('@')[0];
    toast({
        title: "Login Successful",
        description: `Welcome back, ${name}!`,
    });
    onSignInSuccess(name);
  };
  
  const handleSignUp = (values: z.infer<typeof signUpSchema>) => {
    console.log("Sign up submitted with:", values);
    toast({
        title: "Sign Up Successful",
        description: "You can now start using CounselAI.",
    });
    onSignInSuccess(values.name);
  };
  
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const name = user.displayName || user.email?.split('@')[0] || "User";
        toast({
            title: "Sign In Successful",
            description: `Welcome, ${name}!`,
        });
        onSignInSuccess(name);
    } catch (error: any) {
        if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
            console.log("Google Sign-In cancelled by user.");
            return;
        }
        console.error("Google Sign-In Error:", error);
        toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: error.message,
        });
    }
  };


  const renderInitial = () => (
    <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <BrainLogo className="w-16 h-16 mx-auto text-primary mb-4"/>
            <CardTitle className="text-3xl">Welcome to CounselAI</CardTitle>
            <CardDescription>Your personal AI assistant for mental health.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <Button size="lg" className="w-full" onClick={() => setAuthMode("login")}>Log In</Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={() => setAuthMode("signup")}>Sign Up</Button>
        </CardContent>
    </Card>
  );

  const renderLogin = () => (
     <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="text-2xl">Log In</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                        control={loginForm.control}
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
                        control={loginForm.control}
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
                    <Button type="submit" className="w-full">Log In</Button>
                </form>
            </Form>
            <Button variant="link" className="mt-4 w-full" onClick={() => setAuthMode("initial")}>
                Back
            </Button>
        </CardContent>
    </Card>
  );

  const renderSignUp = () => (
    <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Sign up to start your journey with CounselAI.</CardDescription>
        </CardHeader>
        <CardContent>
             <Button variant="outline" className="w-full mb-4 flex items-center gap-2" onClick={handleGoogleSignIn}>
                <GoogleIcon />
                Sign up with Google
            </Button>
            <div className="flex items-center my-4">
                <Separator className="flex-1" />
                <span className="px-4 text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
            </div>

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
                    <Button type="submit" className="w-full !mt-6">Create Account</Button>
                </form>
            </Form>
            <Button variant="link" className="mt-4 w-full" onClick={() => setAuthMode("initial")}>
                Back
            </Button>
        </CardContent>
    </Card>
  )

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {authMode === "initial" && renderInitial()}
      {authMode === "login" && renderLogin()}
      {authMode === "signup" && renderSignUp()}
    </div>
  );
}
