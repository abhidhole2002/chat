import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { chatService } from "@/lib/api";
import type { Message } from "@/lib/types";

interface State {
  byConversation: Record<string, Message[]>;
  loadingId: string | null;
  sendingId: string | null;
}

const initialState: State = {
  byConversation: {},
  loadingId: null,
  sendingId: null,
};

export const fetchMessages = createAsyncThunk(
  "messages/fetch",
  async (conversationId: string) => {
    const data = await chatService.listMessages(conversationId);
    return { conversationId, data };
  },
);

export const sendMessage = createAsyncThunk(
  "messages/send",
  async ({ conversationId, text }: { conversationId: string; text: string }) => {
    return chatService.sendMessage(conversationId, text);
  },
);

const slice = createSlice({
  name: "messages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (s, a) => {
        s.loadingId = a.meta.arg;
      })
      .addCase(fetchMessages.fulfilled, (s, a) => {
        s.byConversation[a.payload.conversationId] = a.payload.data;
        s.loadingId = null;
      })
      .addCase(fetchMessages.rejected, (s) => {
        s.loadingId = null;
      })
      .addCase(sendMessage.pending, (s, a) => {
        s.sendingId = a.meta.arg.conversationId;
      })
      .addCase(sendMessage.fulfilled, (s, a) => {
        const list = s.byConversation[a.payload.conversationId] ?? [];
        s.byConversation[a.payload.conversationId] = [...list, a.payload];
        s.sendingId = null;
      })
      .addCase(sendMessage.rejected, (s) => {
        s.sendingId = null;
      });
  },
});

export default slice.reducer;
