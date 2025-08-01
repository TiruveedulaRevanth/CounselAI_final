
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { BrainLogo } from "./brain-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { User, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export type Profile = {
  id: string;
  name: string;
  region: string;
  phone: string;
  password?: string; // Should be hashed in a real app
}

interface AuthPageProps {
  onSignInSuccess: (profile: Profile) => void;
  existingProfiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
}

const initialSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
});

const loginSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(1, "Password is required"),
});

const passwordValidation = z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

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
  password: passwordValidation,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
}).refine(data => !existingProfiles.some(p => p.phone === data.phone), {
    message: "This phone number is already registered.",
    path: ["phone"],
}).superRefine((data, ctx) => {
    const phoneSchema = phoneValidationSchemas[data.region];
    const result = phoneSchema.safeParse(data.phone);
    if (!result.success) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: result.error.errors[0].message,
            path: ["phone"],
        });
    }
});


export default function AuthPage({ onSignInSuccess, existingProfiles, setProfiles }: AuthPageProps) {
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<"initial" | "login" | "signup">("initial");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signUpSchema = createSignUpSchema(existingProfiles);

  useEffect(() => {
    if (existingProfiles.length === 0) {
        setAuthMode("signup");
    } else {
        setAuthMode("initial");
    }
    setIsLoading(false);
  }, [existingProfiles]);

  const initialForm = useForm<z.infer<typeof initialSchema>>({
    resolver: zodResolver(initialSchema),
    defaultValues: { phone: "" },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", region: "IN", phone: "", password: "", confirmPassword: "" },
  });

  const handleInitialSubmit = (values: z.infer<typeof initialSchema>) => {
    const profile = existingProfiles.find(p => p.phone === values.phone);
    if (profile) {
        setSelectedProfile(profile);
        loginForm.setValue("phone", profile.phone);
        setAuthMode("login");
    } else {
        initialForm.setError("phone", {
            type: "manual",
            message: "No account found with this number. Please sign up.",
        });
    }
  };
  
  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    if (!selectedProfile) return;
    if (values.password === selectedProfile.password) {
        toast({
            title: "Login Successful",
            description: `Welcome back, ${selectedProfile.name}!`,
        });
        onSignInSuccess(selectedProfile);
    } else {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid password. Please try again.",
        });
        loginForm.setError("password", {
            type: "manual",
            message: "Invalid password. Please try again.",
        });
    }
  };
  
  const handleSignUp = (values: z.infer<typeof signUpSchema>) => {
    const newProfile: Profile = {
        id: `profile-${Date.now()}`,
        name: values.name,
        region: values.region,
        phone: values.phone,
        password: values.password,
    };
    toast({
        title: "Sign Up Successful",
        description: "You can now start using CounselAI.",
    });
    const updatedProfiles = [...existingProfiles, newProfile];
    setProfiles(updatedProfiles);
    onSignInSuccess(newProfile);
  };

  const handleDeleteProfile = (profileId: string) => {
    // Also delete associated chats
    localStorage.removeItem(`counselai-chats-${profileId}`); 
    const updatedProfiles = existingProfiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);
    toast({
        title: "Profile Deleted",
        description: "The profile has been removed.",
    });
  };
  
  const FormSeparator = () => (
    <div className="flex items-center my-6">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-muted-foreground uppercase">Or</span>
        <div className="flex-grow border-t border-border"></div>
    </div>
  );

  const renderInitial = () => (
    <div className="w-full max-w-sm">
        <div className="p-1 rounded-xl bg-gradient-to-br from-[#8134AF] via-[#DD2A7B] to-[#FEDA77]">
            <Card className="border-none">
                <CardHeader className="text-center">
                    <BrainLogo className="w-16 h-16 mx-auto text-primary mb-4"/>
                    <CardTitle className="text-3xl">Welcome back</CardTitle>
                    <CardDescription>Enter your phone number to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...initialForm}>
                        <form onSubmit={initialForm.handleSubmit(handleInitialSubmit)} className="space-y-4">
                            <FormField
                                control={initialForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Phone number" {...field} autoFocus />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full text-white font-bold bg-gradient-to-r from-[#8134AF] via-[#DD2A7B] to-[#FEDA77] hover:from-[#8134AF]/90 hover:via-[#DD2A7B]/90 hover:to-[#FEDA77]/90">
                                Continue
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        <div className="mt-4 bg-card rounded-lg border p-4 flex items-center justify-center text-sm">
            <p>Don't have an account?</p>
            <Button variant="link" className="p-1 h-auto" onClick={() => setAuthMode("signup")}>
                Sign Up
            </Button>
      </div>
    </div>
  );

  const renderLogin = () => (
     <div className="w-full max-w-sm">
        <div className="p-1 rounded-xl bg-gradient-to-br from-[#8134AF] via-[#DD2A7B] to-[#FEDA77]">
            <Card className="border-none">
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold text-4xl">
                            {selectedProfile?.name.charAt(0).toUpperCase() ?? <User size={20} />}
                        </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl">{selectedProfile?.name}</CardTitle>
                    <CardDescription>Enter your password to continue.</CardDescription>
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
                            <Button type="submit" className="w-full !mt-4 text-white font-bold bg-gradient-to-r from-[#8134AF] via-[#DD2A7B] to-[#FEDA77] hover:from-[#8134AF]/90 hover:via-[#DD2A7B]/90 hover:to-[#FEDA77]/90">
                                Log In
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        <div className="mt-4 bg-card rounded-lg border p-4 text-center">
            <p className="text-sm">
                Not {selectedProfile?.name}?{' '}
                <Button variant="link" className="p-1 h-auto" onClick={() => { setAuthMode("initial"); setSelectedProfile(null); }}>
                    Use another account
                </Button>
            </p>
        </div>
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
                            name="region"
                            render={({ field }) => (
                                <FormItem>
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
        {existingProfiles.length > 0 && (
            <div className="mt-4 bg-card rounded-lg border p-4 text-center">
                <p className="text-sm">
                    Have an account?{' '}
                    <Button variant="link" className="p-1 h-auto" onClick={() => { setAuthMode("initial"); setSelectedProfile(null); }}>
                        Log in
                    </Button>
                </p>
            </div>
        )}
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
            return existingProfiles.length > 0 ? renderInitial() : renderSignUp();
        case "login":
            return renderLogin();
        case "signup":
            return renderSignUp();
        default:
            return renderSignUp();
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 font-sans">
      {getAuthContent()}
    </div>
  );
}
