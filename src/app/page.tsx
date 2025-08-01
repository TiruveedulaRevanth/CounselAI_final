
"use client";

import { useState, useEffect } from "react";
import AuthPage, { Profile } from "@/components/auth-page";
import AppLayout from "@/components/app-layout";

export default function Home() {
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
    }
  }, []);

  const handleSignInSuccess = (profile: Profile) => {
    localStorage.setItem("counselai-active-profile-id", profile.id);
    
    const existingProfiles = profiles.filter(p => p.id !== profile.id);
    const updatedProfiles = [...existingProfiles, profile];
    
    setProfiles(updatedProfiles);
    localStorage.setItem("counselai-profiles", JSON.stringify(updatedProfiles));
    setActiveProfile(profile);
  };
  
  const handleSignOut = () => {
    localStorage.removeItem("counselai-active-profile-id");
    setActiveProfile(null);
  }

  // Render nothing on the server to prevent hydration mismatch
  if (typeof window === 'undefined') {
    return null;
  }

  if (!activeProfile) {
    return <AuthPage onSignInSuccess={handleSignInSuccess} existingProfiles={profiles} />;
  }

  return <AppLayout userName={activeProfile.name} onSignOut={handleSignOut} />;
}
