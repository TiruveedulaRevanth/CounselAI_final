
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import EmpathAIClient from "./empath-ai-client";
import type { Profile } from "./auth-page";

interface AppLayoutProps {
    activeProfile: Profile;
    onSignOut: () => void;
}

export default function AppLayout({ activeProfile, onSignOut }: AppLayoutProps) {
    return (
        <SidebarProvider collapsible="offcanvas">
            <EmpathAIClient activeProfile={activeProfile} onSignOut={onSignOut} />
        </SidebarProvider>
    );
}
