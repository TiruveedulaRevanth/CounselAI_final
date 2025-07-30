
"use client";

import { useState, useEffect } from "react";
import AuthPage from "@/components/auth-page";
import AppLayout from "@/components/app-layout";

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null); // Start with null
  const [userName, setUserName] = useState<string | null>(null);
  
  // This effect will run once on the client to check local storage.
  useEffect(() => {
    const signedInStatus = localStorage.getItem("counselai-signed-in") === "true";
    const storedName = localStorage.getItem("counselai-user-name");
    setIsSignedIn(signedInStatus);
    setUserName(storedName);
  }, []);

  const handleSignInSuccess = (name: string) => {
    localStorage.setItem("counselai-signed-in", "true");
    localStorage.setItem("counselai-user-name", name);
    setIsSignedIn(true);
    setUserName(name);
  };
  
  const handleSignOut = () => {
    localStorage.removeItem("counselai-signed-in");
    localStorage.removeItem("counselai-user-name");
    setIsSignedIn(false);
    setUserName(null);
  }

  // Render nothing until the client-side check is complete.
  // This ensures server and client render the same initial null.
  if (isSignedIn === null) {
    return null; // Or a loading spinner
  }

  if (!isSignedIn) {
    return <AuthPage onSignInSuccess={handleSignInSuccess} />;
  }

  return <AppLayout userName={userName} onSignOut={handleSignOut} />;
}
