export type ChatSection = "current" | "completed" | "all" | "ai";

export type MessageStatus = "sent" | "delivered" | "read";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  online: boolean;
  lastSeen: string;
  about: string;
  tags: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  text: string;
  authorId: string; // contact id or "me"
  createdAt: string;
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  section: ChatSection;
  assignedToAI: boolean;
  pinned: boolean;
}
