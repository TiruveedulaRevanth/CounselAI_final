
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
