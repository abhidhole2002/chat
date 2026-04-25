import type { Conversation, Message } from "./types";

const NAMES = [
  "Sofia Martinez", "Liam Chen", "Aisha Khan", "Noah Williams", "Emma Dubois",
  "Arjun Patel", "Olivia Brown", "Mateo Rossi", "Yuki Tanaka", "Hugo Lefebvre",
  "Zara Ahmed", "Lucas Silva", "Mia Johansson", "Ethan O'Brien", "Layla Hassan",
];

const MESSAGES = [
  "Hi, can you help me with my order?",
  "Thanks for the quick response!",
  "Could you send me the invoice please?",
  "Perfect, that works for me.",
  "I'll check and get back to you.",
  "Is the issue resolved now?",
  "Looking forward to your reply.",
  "Sounds great, let's proceed.",
  "Can we schedule a call tomorrow?",
  "Appreciate your help!",
];

const TAGS = ["VIP", "New", "Support", "Sales", "Returning"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function avatarFor(name: string) {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

function generateConversations(): Conversation[] {
  const sections: Conversation["section"][] = ["current", "completed", "all", "ai"];
  return NAMES.map((name, i) => {
    const id = `c-${i + 1}`;
    const section = i < 6 ? "current" : i < 10 ? "completed" : i < 13 ? "all" : "ai";
    const minsAgo = Math.floor(Math.random() * 60 * 48);
    const date = new Date(Date.now() - minsAgo * 60 * 1000);
    return {
      id,
      contact: {
        id: `u-${i + 1}`,
        name,
        avatar: avatarFor(name),
        phone: `+1 555 0${100 + i}`,
        email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@example.com`,
        online: Math.random() > 0.5,
        lastSeen: date.toISOString(),
        about: "Available",
        tags: [rand(TAGS)],
      },
      lastMessage: rand(MESSAGES),
      lastMessageAt: date.toISOString(),
      unreadCount: section === "current" && Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0,
      section,
      assignedToAI: section === "ai",
      pinned: i < 2,
    };
  });
}

function generateMessages(conversations: Conversation[]): Record<string, Message[]> {
  const result: Record<string, Message[]> = {};
  for (const c of conversations) {
    const count = 6 + Math.floor(Math.random() * 8);
    const msgs: Message[] = [];
    for (let i = 0; i < count; i++) {
      const fromMe = i % 2 === 1;
      const minsAgo = (count - i) * (5 + Math.floor(Math.random() * 20));
      msgs.push({
        id: `m-${c.id}-${i}`,
        conversationId: c.id,
        text: rand(MESSAGES),
        authorId: fromMe ? "me" : c.contact.id,
        createdAt: new Date(Date.now() - minsAgo * 60 * 1000).toISOString(),
        status: fromMe ? rand(["sent", "delivered", "read"] as const) : "read",
      });
    }
    result[c.id] = msgs;
  }
  return result;
}

export const mockConversations = generateConversations();
export const mockMessages = generateMessages(mockConversations);

export const mockUser = {
  id: "me",
  name: "Alex Morgan",
  email: "alex@chatdash.app",
  avatar: avatarFor("Alex Morgan"),
  role: "Support Agent",
};
