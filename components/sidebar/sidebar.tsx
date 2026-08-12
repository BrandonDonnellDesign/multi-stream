import { StreamForm } from "./stream-form";
import { StreamList } from "./stream-list";
import { Stream, StreamPlatform } from "@/types/stream";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Columns3, Moon, Radio, Settings2, SlidersHorizontal, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatControls } from "@/components/chat/chat-controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ApiKeySettings as KickApiSettings } from "@/components/settings/api-key-settings";

interface SidebarProps {
  isOpen: boolean;
  streams: Stream[];
  onClose: () => void;
  onAddStream: (platform: StreamPlatform, channel: string) => void;
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
}: SidebarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "h-full flex shrink-0 flex-col overflow-hidden border-r border-white/8 bg-card/70 backdrop-blur-xl transition-all duration-300 z-40",
        isOpen
          ? "min-w-[360px] w-[380px] max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:min-w-0 max-sm:w-[min(380px,100vw)]"
          : "w-16 max-sm:w-0 max-sm:border-0"
      )}
    >
      <div className="flex min-h-[72px] items-center justify-between border-b border-white/8 px-4">
        <div className={cn("flex items-center gap-3", !isOpen && "hidden")}>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/.25)]"><Radio className="h-5 w-5" /></div>
          <div><h1 className="text-base font-bold tracking-tight">MULTI<span className="text-primary">{"//"}</span>STREAM</h1><p className="text-[10px] font-medium uppercase tracking-[.22em] text-muted-foreground">Broadcast desk</p></div>
        </div>
        <div className="flex items-center min-w-0">
          <Button
            variant="ghost"
            size="lg"
            className={cn("h-9 w-9 rounded-xl", !isOpen && "rotate-180")}
            onClick={onClose}
            aria-label={isOpen ? "Close stream manager" : "Open stream manager"}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-1 flex-col overflow-auto px-3 py-4">
          <div className="mb-3 flex items-center justify-between px-1"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground">Your lineup</span><span className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-muted-foreground">{streams.length} sources</span></div>
          <StreamForm onAdd={onAddStream} />
          {/* Column selection moved to settings dialog below */}
          <div className="mb-3">
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
          />

          <div className="mt-auto border-t border-white/8 pt-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start rounded-xl text-muted-foreground"><Settings2 className="mr-2 h-4 w-4" />Settings</Button>
              </DialogTrigger>
              <DialogContent className="overflow-hidden border-white/10 bg-card/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-[560px]">
                <DialogHeader>
                  <div className="border-b border-white/8 px-6 py-5"><div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><SlidersHorizontal className="h-5 w-5" /></div><DialogTitle className="text-xl">Workspace settings</DialogTitle><DialogDescription className="mt-1">Tune the stage and connect your chat services.</DialogDescription></div>
                </DialogHeader>
                <div className="grid gap-5 px-6 py-5">
                  <section><p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground">Appearance & layout</p><div className="divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[.025] px-4">
                    <div className="flex items-center justify-between py-3.5"><div className="flex items-center gap-3">{theme === 'light' ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}<div><p className="text-sm font-medium">Color theme</p><p className="text-xs text-muted-foreground">Choose your workspace appearance</p></div></div><Select onValueChange={setTheme} value={theme ?? "dark"}><SelectTrigger className="h-9 w-28 rounded-xl border-white/8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent></Select></div>
                    <div className="flex items-center justify-between py-3.5"><div className="flex items-center gap-3"><Columns3 className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">Stage columns</p><p className="text-xs text-muted-foreground">Maximum streams per row</p></div></div><Select value={String(maxColumns)} onValueChange={(value) => setMaxColumns(Number(value))}><SelectTrigger className="h-9 w-28 rounded-xl border-white/8"><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4,5,6].map((n) => <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'column' : 'columns'}</SelectItem>)}</SelectContent></Select></div>
                  </div></section>
                  <section><p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground">Connections</p><KickApiSettings /></section>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}
