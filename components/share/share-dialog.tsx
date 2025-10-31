
import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Stream } from "@/types/stream";
import { encodeStreamsToUrl } from "@/lib/stream-utils";

interface ShareDialogProps {
  streams: Stream[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ streams, open, onOpenChange }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (open) {
      setShareUrl(encodeStreamsToUrl(streams));
      setCopied(false);
    }
  }, [open, streams]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Streams</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="w-full"
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
          <Button
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8"
            variant={copied ? "default" : "secondary"}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Share this link to let others view the same stream configuration.
        </p>
      </DialogContent>
    </Dialog>
  );
}