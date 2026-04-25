import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { mockConversations, mockMessages, mockUser } from "./mock-data";
import type { Conversation, Message } from "./types";

// Centralized axios instance
export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — global error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message ?? error.message ?? "Request failed";
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      toast.error("Session expired");
    } else if ((error.response?.status ?? 0) >= 500) {
      toast.error("Server error", { description: message });
    }
    return Promise.reject(error);
  },
);

// ----- Mock adapter (frontend-only) -----
// Intercepts requests and resolves with in-memory mock data.
const STORE = {
  conversations: [...mockConversations],
  messages: structuredClone(mockMessages) as Record<string, Message[]>,
};

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

api.interceptors.request.use(async (config) => {
  // Hijack: throw a fake adapter that returns mock data
  config.adapter = async () => {
    await delay(150 + Math.random() * 250);
    const url = (config.url ?? "").replace(/^\//, "");
    const method = (config.method ?? "get").toLowerCase();

    const ok = (data: unknown) => ({
      data,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });

    // POST /auth/login
    if (url === "auth/login" && method === "post") {
      const body = JSON.parse(config.data ?? "{}");
      if (!body.email || !body.password) {
        throw new AxiosError("Invalid credentials", "ERR_BAD_REQUEST", config, null, {
          data: { message: "Email and password required" },
          status: 400,
          statusText: "Bad Request",
          headers: {},
          config,
        });
      }
      return ok({ token: "mock-jwt-token", user: mockUser });
    }

    if (url === "auth/me" && method === "get") return ok(mockUser);
    if (url === "auth/logout" && method === "post") return ok({ success: true });

    // GET /conversations
    if (url === "conversations" && method === "get") {
      return ok(STORE.conversations);
    }

    // GET /conversations/:id/messages
    const msgMatch = url.match(/^conversations\/([^/]+)\/messages$/);
    if (msgMatch && method === "get") {
      return ok(STORE.messages[msgMatch[1]] ?? []);
    }
    if (msgMatch && method === "post") {
      const body = JSON.parse(config.data ?? "{}");
      const conversationId = msgMatch[1];
      const msg: Message = {
        id: `m-${conversationId}-${Date.now()}`,
        conversationId,
        text: body.text,
        authorId: "me",
        createdAt: new Date().toISOString(),
        status: "sent",
      };
      STORE.messages[conversationId] = [...(STORE.messages[conversationId] ?? []), msg];
      const conv = STORE.conversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.lastMessage = body.text;
        conv.lastMessageAt = msg.createdAt;
      }
      return ok(msg);
    }

    // PATCH /conversations/:id
    const convMatch = url.match(/^conversations\/([^/]+)$/);
    if (convMatch && method === "patch") {
      const body = JSON.parse(config.data ?? "{}");
      const conv = STORE.conversations.find((c) => c.id === convMatch[1]);
      if (conv) Object.assign(conv, body);
      return ok(conv);
    }
    if (convMatch && method === "delete") {
      STORE.conversations = STORE.conversations.filter((c) => c.id !== convMatch[1]);
      delete STORE.messages[convMatch[1]];
      return ok({ success: true });
    }

    throw new AxiosError(`Unhandled mock route: ${method.toUpperCase()} ${url}`, "ERR_NOT_FOUND", config, null, {
      data: { message: "Not found" },
      status: 404,
      statusText: "Not Found",
      headers: {},
      config,
    });
  };
  return config;
});

// Service helpers
export const authService = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: typeof mockUser }>("/auth/login", { email, password }).then((r) => r.data),
  me: () => api.get<typeof mockUser>("/auth/me").then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
};

export const chatService = {
  listConversations: () => api.get<Conversation[]>("/conversations").then((r) => r.data),
  listMessages: (id: string) => api.get<Message[]>(`/conversations/${id}/messages`).then((r) => r.data),
  sendMessage: (id: string, text: string) =>
    api.post<Message>(`/conversations/${id}/messages`, { text }).then((r) => r.data),
  updateConversation: (id: string, patch: Partial<Conversation>) =>
    api.patch<Conversation>(`/conversations/${id}`, patch).then((r) => r.data),
  deleteConversation: (id: string) => api.delete(`/conversations/${id}`).then((r) => r.data),
};
