
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import EmpathAIClient from "./empath-ai-client";

interface AppLayoutProps {
    userName: string | null;
    onSignOut: () => void;
}

export default function AppLayout({ userName, onSignOut }: AppLayoutProps) {
    return (
        <SidebarProvider>
            <EmpathAIClient userName={userName} onSignOut={onSignOut} />
        </SidebarProvider>
    );
}
