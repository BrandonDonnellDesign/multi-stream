"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function KickApiSettingsContent() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("kick_oauth_token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const handleLogin = () => {
        window.location.href = "/api/auth/kick";
    };

    const handleLogout = () => {
        localStorage.removeItem("kick_oauth_token");
        setToken(null);
    };

    return (
        <div className="grid gap-2">
            <Label>Kick Account</Label>
            {token ? (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Connected
                    </div>
                    <p className="text-xs text-muted-foreground">You are ready to send messages.</p>
                    <Button onClick={handleLogout} variant="destructive" size="sm" className="w-full">
                        Disconnect
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <Button onClick={handleLogin} className="w-full bg-[#53FC18] text-black hover:bg-[#53FC18]/90">
                        Connect with Kick
                    </Button>
                    <p className="text-[0.8rem] text-muted-foreground">
                        Log in to authorize sending messages to chat.
                    </p>
                </div>
            )}
        </div>
    );
}

export function ApiKeySettings() {
    return <KickApiSettingsContent />
}
