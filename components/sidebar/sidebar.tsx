import { StreamForm } from "./stream-form";
import { StreamList } from "./stream-list";
import { Stream } from "@/types/stream";
import { Button, buttonVariants } from "@/components/ui/button";
import { ShareButton } from "@/components/share/share-button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatControls } from "@/components/chat/chat-controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SidebarProps {
  isOpen: boolean;
  streams: Stream[];
  onClose: () => void;
  onAddStream: (platform: "twitch" | "kick", channel: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleChat: (id: string) => void;
  onToggleAllChats: (enabled: boolean) => void;
  onRefresh: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (streams: Stream[]) => void;
  maxColumns: number;
  setMaxColumns: (n: number) => void;
  isChatOpen?: boolean;
  activeStreamId?: string;
  setActiveStreamIndex?: (index: number) => void;
}

export function Sidebar({
  isOpen,
  streams,
  onClose,
  onAddStream,
  onToggleVisibility,
  onToggleChat,
  onToggleAllChats,
  onRefresh,
  onRemove,
  onReorder,
  maxColumns,
  setMaxColumns,
  isChatOpen,
  activeStreamId,
  setActiveStreamIndex,
}: SidebarProps) {
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) {
        setTheme(storedTheme as "light" | "dark");
      }


      // Restore streams from localStorage if available
      const storedStreams = localStorage.getItem("sidebar-streams");
      if (storedStreams) {
        try {
          const parsed = JSON.parse(storedStreams);
          if (Array.isArray(parsed) && parsed.every(s => s.id && s.channel && s.platform)) {
            // If you want to replace the prop, you need to lift state up. Otherwise, inform parent to use these.
            // For now, just log or you can call onReorder(parsed) if you want to update parent.
            onReorder(parsed);
          }
        } catch {}
      }
    }, []);
  
    useEffect(() => {
      localStorage.setItem("theme", theme);
    }, [theme]);


    // Persist streams whenever they change
    useEffect(() => {
      localStorage.setItem("sidebar-streams", JSON.stringify(streams));
    }, [streams]);




  return (
  <div
    className={cn(
      "h-full flex flex-col transition-all duration-300 overflow-hidden",
            "border-r border-muted shadow-2xl rounded-r-2xl",
            "bg-card",
            "p-0",
  isOpen ? "min-w-[360px] w-[380px]" : "w-16"
    )}
  >
  <div className="flex items-center justify-between px-3 py-2 min-h-[56px] rounded-xl bg-[rgba(40,40,50,0.85)] shadow-lg mb-3">
            <h2 className={cn("font-extrabold text-3xl tracking-tight min-w-0 truncate text-white drop-shadow-md", !isOpen && "hidden")}> 
          Stream Manager
        </h2>
        <div className="flex items-center gap-4 min-w-0">
          {isOpen && <ShareButton streams={streams} />}
          <Button
            variant="ghost"
            size="lg"
            className={cn("h-12 w-12 p-0 flex items-center justify-center transition-transform duration-150 hover:scale-110 hover:bg-accent/30", isOpen ? "rotate-180" : "rotate-0")}
            onClick={onClose}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
      </div>

        {isOpen && (
            <div className="flex-1 overflow-auto px-3 py-2">
                <StreamForm onAdd={onAddStream} />
                {/* Column selection moved to settings dialog below */}
        <div className="mb-1">
          <ChatControls
            streams={streams}
            onToggleAllChats={onToggleAllChats}
            compact
            isChatOpen={isChatOpen}
          />
        </div>
        <StreamList
          streams={streams}
          onToggleVisibility={onToggleVisibility}
          onToggleChat={onToggleChat}
          onRefresh={onRefresh}
          onRemove={onRemove}
          onReorder={onReorder}
          isChatOpen={isChatOpen}
          activeStreamId={activeStreamId}
          onSelectStream={setActiveStreamIndex}
        />
              
        <div className="mt-auto border-t border-muted p-4">
        <Dialog>
          <DialogTrigger asChild>
          <Button variant="ghost" className="w-full justify-start">Settings</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Application settings</DialogTitle>
              <DialogDescription>
                Configure the application settings to your liking.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="theme"
                  className="text-right text-sm font-medium"
                >
                  Theme
                </label>                                 
                                <Select onValueChange={v => setTheme(v as "light" | "dark")} defaultValue={theme}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="maxColumns" className="text-right text-sm font-medium">Columns</label>
                <select
                  id="maxColumns"
                  value={maxColumns}
                  onChange={e => setMaxColumns(Number(e.target.value))}
                  className="col-span-3 bg-card border border-muted rounded px-2 py-1 text-sm"
                >
                  {[1,2,3,4,5,6].map(n => (
                  <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
            </div>
        )}
    </div>   
  );
}