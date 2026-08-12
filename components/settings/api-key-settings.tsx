"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink, FlaskConical, Loader2, ShieldCheck, Unplug } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function KickApiSettingsContent() {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/kick/session').then((response) => response.json()).then((data) => setConnected(Boolean(data.connected))).finally(() => setLoading(false));
    }, []);

    const handleLogin = () => {
        window.location.href = "/api/auth/kick";
    };

    const handleLogout = async () => {
        setLoading(true);
        await fetch('/api/kick/session', { method: 'DELETE' });
        localStorage.removeItem('kick_oauth_token');
        setConnected(false);
        setLoading(false);
    };

    return (
        <div className="rounded-2xl border border-white/8 bg-white/[.025] p-4">
            <div className="mb-4 flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#53FC18]/10 text-[#53FC18]"><ShieldCheck className="h-5 w-5" /></div>
                <div><p className="text-sm font-semibold">Kick account</p><p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Authorize chat access without exposing your token to the browser.</p></div>
            </div>
            {loading ? <div className="flex h-10 items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div> : connected ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-[#53FC18]/15 bg-[#53FC18]/5 px-3 py-2.5"><span className="flex items-center gap-2 text-sm font-medium text-[#53FC18]"><Check className="h-4 w-4" />Connected</span><span className="text-[10px] uppercase tracking-wider text-muted-foreground">chat:write</span></div>
                    <Button onClick={handleLogout} variant="outline" size="sm" className="w-full rounded-xl border-white/8"><Unplug className="mr-2 h-4 w-4" />Disconnect Kick</Button>
                </div>
            ) : (
                <div className="space-y-3">
                    <Button onClick={handleLogin} className="w-full rounded-xl bg-[#53FC18] text-black hover:bg-[#53FC18]/90">Connect with Kick<ExternalLink className="ml-2 h-4 w-4" /></Button>
                    <p className="text-center text-[11px] text-muted-foreground">You’ll be redirected to Kick to approve access.</p>
                </div>
            )}
        </div>
    );
}

export function ApiKeySettings() {
    const [experimentalPlayer, setExperimentalPlayer] = useState(false);
    useEffect(() => {
        // This browser-only preference is available after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setExperimentalPlayer(localStorage.getItem('experimental-kick-hls') === 'true');
    }, []);
    const toggleExperimentalPlayer = (enabled: boolean) => {
        localStorage.setItem('experimental-kick-hls', String(enabled));
        setExperimentalPlayer(enabled);
        window.dispatchEvent(new Event('kick-player-setting'));
    };
    return <div className="space-y-3"><KickApiSettingsContent /><div className="rounded-2xl border border-amber-400/15 bg-amber-400/[.04] p-4"><div className="flex items-start justify-between gap-4"><div className="flex gap-3"><FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><p className="text-sm font-semibold">Experimental quality selector</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Use Kick’s direct HLS feed and choose a rendition. Automatically falls back to the official player if blocked.</p></div></div><Switch checked={experimentalPlayer} onCheckedChange={toggleExperimentalPlayer} aria-label="Enable experimental Kick quality selector" /></div></div></div>
}
