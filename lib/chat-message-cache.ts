export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    username: string;
    slug: string;
    identity: {
      color: string;
      badges: Array<{ type: string; count?: number }>;
    };
  };
  created_at: string;
}

const MAX_MESSAGES = 200;
const messagesByChannel = new Map<string, ChatMessage[]>();

function key(channel: string) {
  return channel.trim().toLowerCase();
}

export function getCachedChatMessages(channel: string) {
  return messagesByChannel.get(key(channel)) ?? [];
}

export function appendCachedChatMessage(channel: string, message: ChatMessage) {
  const channelKey = key(channel);
  const existing = messagesByChannel.get(channelKey) ?? [];
  if (existing.some((candidate) => candidate.id && candidate.id === message.id)) return existing;
  const next = [...existing, message].slice(-MAX_MESSAGES);
  messagesByChannel.set(channelKey, next);
  return next;
}
