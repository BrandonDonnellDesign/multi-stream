import { describe, expect, it } from "vitest";
import { appendCachedChatMessage, getCachedChatMessages, ChatMessage } from "./chat-message-cache";

function message(id: string): ChatMessage {
  return {
    id,
    content: id,
    sender: { username: "viewer", slug: "viewer", identity: { color: "#fff", badges: [] } },
    created_at: new Date().toISOString(),
  };
}

describe("chat message cache", () => {
  it("restores messages case-insensitively and ignores duplicate IDs", () => {
    appendCachedChatMessage("RayC", message("one"));
    appendCachedChatMessage("rayc", message("one"));
    expect(getCachedChatMessages("RAYC").map((item) => item.id)).toEqual(["one"]);
  });

  it("keeps only the latest 200 messages", () => {
    for (let index = 0; index < 205; index += 1) {
      appendCachedChatMessage("bounded-channel", message(String(index)));
    }
    const cached = getCachedChatMessages("bounded-channel");
    expect(cached).toHaveLength(200);
    expect(cached[0].id).toBe("5");
  });
});
