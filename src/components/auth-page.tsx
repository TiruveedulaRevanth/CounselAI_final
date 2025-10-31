
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { BrainLogo } from "./brain-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

export type Profile = {
  id: string;
  name: string;
  region: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface AuthPageProps {
  onSignInSuccess: (profile: Profile) => void;
  existingProfiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
}

const loginSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
});


const phoneValidationSchemas = {
  IN: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian number."),
  US: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit US number."),
  GB: z.string().regex(/^07\d{9}$/, "Must be a valid 11-digit UK mobile number (starting with 07)."),
  ES: z.string().regex(/^[679]\d{8}$/, "Must be a valid 9-digit Spanish number."),
  FR: z.string().regex(/^0[67]\d{8}$/, "Must be a valid 10-digit French mobile number (starting with 06 or 07)."),
  CN: z.string().regex(/^1\d{10}$/, "Must be a valid 11-digit Chinese mobile number (starting with 1)."),
};

const regions = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'USA' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ES', name: 'Spain' },
  { code: 'FR', name: 'France' },
  { code: 'CN', name: 'China' },
] as const;


const createSignUpSchema = (existingProfiles: Profile[]) => z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  region: z.enum(["IN", "US", "GB", "ES", "FR", "CN"]),
  phone: z.string(),
  emergencyContactName: z.string().min(2, "Emergency contact name must be at least 2 characters"),
  emergencyContactPhone: z.string().min(1, "Emergency contact phone number is required"),
}).refine(data => !existingProfiles.some(p => p.phone === data.phone), {
    message: "This phone number is already registered.",
    path: ["phone"],
}).superRefine((data, ctx) => {
    const phoneSchema = phoneValidationSchemas[data.region];
    const userPhoneResult = phoneSchema.safeParse(data.phone);
    if (!userPhoneResult.success) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: userPhoneResult.error.errors[0].message,
            path: ["phone"],
        });
    }
    // Simple validation for emergency contact phone, can be improved
    const emergencyPhoneResult = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number.").safeParse(data.emergencyContactPhone);
    if (!emergencyPhoneResult.success) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: emergencyPhoneResult.error.errors[0].message,
            path: ["emergencyContactPhone"],
        });
    }
});


export default function AuthPage({ onSignInSuccess, existingProfiles, setProfiles }: AuthPageProps) {
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  
  useEffect(() => {
    if (existingProfiles.length === 0) {
        setAuthMode("signup");
    } else {
        setAuthMode("login");
    }
  }, [existingProfiles]);


  const LoginForm = () => {
    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { phone: "" },
      });

    const handleLoginSubmit = (values: z.infer<typeof loginSchema>) => {
        const profile = existingProfiles.find(p => p.phone === values.phone);
        if (profile) {
            toast({
                title: "Login Successful",
                description: `Welcome back, ${profile.name}!`,
                duration: 3000,
            });
            onSignInSuccess(profile);
        } else {
            loginForm.setError("phone", {
                type: "manual",
                message: "This phone number is not registered. Please sign up.",
            });
        }
    };
    
    return (
        <div className="w-full max-w-sm">
            <Card>
                <CardHeader className="text-center">
                    <BrainLogo className="w-20 h-20 mx-auto mb-4"/>
                    <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
                    <CardDescription>Enter your phone number to sign in.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                            <FormField
                                control={loginForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Enter phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full font-bold">
                                Continue
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <div className="mt-4 text-center text-sm">
                <p>Don't have an account?{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setAuthMode("signup")}>
                        Sign Up
                    </Button>
                </p>
            </div>
        </div>
      )
  }

  const SignUpForm = () => {
    const signUpSchema = createSignUpSchema(existingProfiles);
    const signUpForm = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { name: "", region: "IN", phone: "", emergencyContactName: "", emergencyContactPhone: "" },
    });

    const handleSignUp = (values: z.infer<typeof signUpSchema>) => {
        const newProfile: Profile = {
            id: `profile-${Date.now()}`,
            name: values.name,
            region: values.region,
            phone: values.phone,
            emergencyContactName: values.emergencyContactName,
            emergencyContactPhone: values.emergencyContactPhone,
        };
        toast({
            title: "Sign Up Successful",
            description: "You can now start using CounselAI.",
            duration: 3000,
        });
        const updatedProfiles = [...existingProfiles, newProfile];
        setProfiles(updatedProfiles);
        onSignInSuccess(newProfile);
    };

    return (
        <div className="w-full max-w-sm">
            <Card>
                <CardHeader className="text-center">
                    <BrainLogo className="w-20 h-20 mx-auto mb-4"/>
                    <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
                    <CardDescription>Sign up to start your journey with CounselAI.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...signUpForm}>
                        <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                            <FormField
                                control={signUpForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Full Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signUpForm.control}
                                name="region"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Region</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select your region" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {regions.map(r => <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>)}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signUpForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Separator className="my-6" />
                             <div className="space-y-2 text-center">
                                <FormLabel className="font-semibold">Emergency Contact</FormLabel>
                                <p className="text-xs text-muted-foreground">This person will be contacted if the AI detects a crisis.</p>
                             </div>
                             <FormField
                                control={signUpForm.control}
                                name="emergencyContactName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact's Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Emergency contact name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={signUpForm.control}
                                name="emergencyContactPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact's Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Emergency contact phone" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full font-bold">
                                Sign Up
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            {existingProfiles.length > 0 && (
                 <div className="mt-4 text-center text-sm">
                    <p>Have an account?{' '}
                        <Button variant="link" className="p-0 h-auto" onClick={() => { setAuthMode("login"); }}>
                            Log in
                        </Button>
                    </p>
                </div>
            )}
        </div>
    )
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 font-sans">
        {authMode === 'login' ? <LoginForm /> : <SignUpForm />}
    </div>
  );
}
