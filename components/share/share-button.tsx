"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Stream } from "@/types/stream";
import { ShareDialog } from "./share-dialog";

interface ShareButtonProps {
  streams: Stream[];
}

export function ShareButton({ streams }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpen(true)}
              className="h-8 w-8"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share streams</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <ShareDialog 
        streams={streams}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}