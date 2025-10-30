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
}: SidebarProps) {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [maxColumns, setMaxColumns] = useState<number>(4);

    useEffect(() => {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) {
        setTheme(storedTheme as "light" | "dark");
      }

      const storedMaxColumns = localStorage.getItem("maxColumns");
      if (storedMaxColumns) {
        setMaxColumns(parseInt(storedMaxColumns));
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

    useEffect(() => {
      localStorage.setItem("maxColumns", maxColumns.toString());
    }, [maxColumns]);

    // Persist streams whenever they change
    useEffect(() => {
      localStorage.setItem("sidebar-streams", JSON.stringify(streams));
    }, [streams]);




  return (
    <div
        className={cn(
            "h-full bg-secondary transition-all duration-300 flex flex-col",
            "border-r border-muted shadow-lg rounded-r-lg", // Added shadow and rounded border
            isOpen ? "w-auto" : "w-16",
        )}
    >
        <div className="flex items-center justify-between px-3 py-2 border-b border-muted">
            <h2 className={cn("font-bold text-lg", !isOpen && "hidden")}>
          Stream Manager
        </h2>
        <div className="flex items-center gap-2">
          {isOpen && <ShareButton streams={streams} />}
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", isOpen ? "rotate-180" : "rotate-0")}          
            onClick={onClose}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

        {isOpen && (
            <div className="flex-1 overflow-auto px-3 py-2">
                <StreamForm onAdd={onAddStream} />
                <div className="mb-2">
                    <ChatControls
                        streams={streams}
                        onToggleAllChats={onToggleAllChats}
                    />
                </div>
                <StreamList
                    streams={streams}
                    onToggleVisibility={onToggleVisibility}
                    onToggleChat={onToggleChat}
                    onRefresh={onRefresh}
                    onRemove={onRemove}
                    onReorder={onReorder}
                />
              
{/*               <div className="mt-auto border-t border-muted p-4">
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
                                <Select onValueChange={setTheme} defaultValue={theme}>
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
                                <label htmlFor="maxColumns" className="text-right text-sm font-medium">Max Columns</label>
                                <Input id="maxColumns" type="number" value={maxColumns} onChange={(e) => setMaxColumns(parseInt(e.target.value))} className="col-span-3" />
                            </div>
                        </div>
                        
                        
                    </DialogContent>
                </Dialog>
              </div> */}
            </div>
        )}
    </div>   
  );
}