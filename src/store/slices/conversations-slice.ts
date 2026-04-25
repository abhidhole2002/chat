import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { chatService } from "@/lib/api";
import type { ChatSection, Conversation } from "@/lib/types";

interface State {
  items: Conversation[];
  status: "idle" | "loading" | "ready" | "error";
  activeId: string | null;
  section: ChatSection;
  search: string;
}

const initialState: State = {
  items: [],
  status: "idle",
  activeId: null,
  section: "current",
  search: "",
};

export const fetchConversations = createAsyncThunk("conversations/fetch", async () => {
  return chatService.listConversations();
});

export const updateConversation = createAsyncThunk(
  "conversations/update",
  async ({ id, patch }: { id: string; patch: Partial<Conversation> }) => {
    return chatService.updateConversation(id, patch);
  },
);

export const removeConversation = createAsyncThunk(
  "conversations/remove",
  async (id: string) => {
    await chatService.deleteConversation(id);
    return id;
  },
);

const slice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    setActive(state, action: PayloadAction<string | null>) {
      state.activeId = action.payload;
    },
    setSection(state, action: PayloadAction<ChatSection>) {
      state.section = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    bumpLastMessage(state, action: PayloadAction<{ id: string; text: string; at: string }>) {
      const c = state.items.find((x) => x.id === action.payload.id);
      if (c) {
        c.lastMessage = action.payload.text;
        c.lastMessageAt = action.payload.at;
      }
    },
    markRead(state, action: PayloadAction<string>) {
      const c = state.items.find((x) => x.id === action.payload);
      if (c) c.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchConversations.fulfilled, (s, a) => {
        s.items = a.payload;
        s.status = "ready";
      })
      .addCase(fetchConversations.rejected, (s) => {
        s.status = "error";
      })
      .addCase(updateConversation.fulfilled, (s, a) => {
        const idx = s.items.findIndex((c) => c.id === a.payload?.id);
        if (idx >= 0 && a.payload) s.items[idx] = a.payload;
      })
      .addCase(removeConversation.fulfilled, (s, a) => {
        s.items = s.items.filter((c) => c.id !== a.payload);
        if (s.activeId === a.payload) s.activeId = null;
      });
  },
});

export const { setActive, setSection, setSearch, bumpLastMessage, markRead } = slice.actions;
export default slice.reducer;
