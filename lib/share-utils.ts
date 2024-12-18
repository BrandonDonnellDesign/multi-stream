import { Stream } from "@/types/stream";

export async function shareStreams(url: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if running in a secure context
    if (!window.isSecureContext) {
      throw new Error("Sharing requires a secure context (HTTPS)");
    }

    // Check if Web Share API is available and we're in a supported context
    if (navigator.share && window.isSecureContext) {
      await navigator.share({
        title: 'Multi Stream Viewer',
        text: 'Check out these streams!',
        url,
      });
      return { success: true, message: "Shared successfully" };
    }
    
    // Fallback to clipboard
    await navigator.clipboard.writeText(url);
    return { success: true, message: "Link copied to clipboard" };
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        return { success: false, message: "Share action was cancelled" };
      }
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to share" };
  }
}