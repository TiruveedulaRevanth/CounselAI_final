
"use client";

import { useState, useEffect } from "react";
import AuthPage, { Profile } from "@/components/auth-page";
import AppLayout from "@/components/app-layout";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // This effect will run once on the client to check local storage.
  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem("counselai-profiles");
      const storedActiveProfileId = localStorage.getItem("counselai-active-profile-id");

      const parsedProfiles = storedProfiles ? JSON.parse(storedProfiles) : [];
      setProfiles(parsedProfiles);

      if (storedActiveProfileId && parsedProfiles.length > 0) {
        const foundProfile = parsedProfiles.find((p: Profile) => p.id === storedActiveProfileId);
        if (foundProfile) {
          setActiveProfile(foundProfile);
        }
      }
    } catch (error) {
      console.error("Failed to load profile data from local storage:", error);
      // Ensure we don't stay in a loading state if local storage fails
      setActiveProfile(null); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist profiles to local storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("counselai-profiles", JSON.stringify(profiles));
    }
  }, [profiles, isLoading]);

  const handleSignInSuccess = (profile: Profile) => {
    localStorage.setItem("counselai-active-profile-id", profile.id);
    
    // Avoid duplicates when signing in with an existing profile
    const existingProfiles = profiles.filter(p => p.id !== profile.id);
    const updatedProfiles = [...existingProfiles, profile];
    
    setProfiles(updatedProfiles);
    setActiveProfile(profile);
  };
  
  const handleSignOut = () => {
    localStorage.removeItem("counselai-active-profile-id");
    setActiveProfile(null);
  }

  // Render a loading state on both server and client initially
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            {/* You can replace this with a proper spinner component if you have one */}
            <p className="text-muted-foreground">Loading...</p>
        </div>
    );
  }

  if (!activeProfile) {
    return <AuthPage onSignInSuccess={handleSignInSuccess} existingProfiles={profiles} setProfiles={setProfiles} />;
  }

  return <AppLayout userName={activeProfile.name} onSignOut={handleSignOut} />;
}

    