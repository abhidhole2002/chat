import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { authService } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (creds: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authService.login(creds.email, creds.password);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message ?? err.message ?? "Login failed");
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

export const restoreSession = createAsyncThunk(
  "auth/restore",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.me();
    } catch {
      return rejectWithValue("no session");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = "authenticated";
        s.user = a.payload.user;
        s.token = a.payload.token;
        if (typeof window !== "undefined") localStorage.setItem("auth_token", a.payload.token);
      })
      .addCase(login.rejected, (s, a) => {
        s.status = "error";
        s.error = (a.payload as string) ?? "Login failed";
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.token = null;
        s.status = "idle";
        if (typeof window !== "undefined") localStorage.removeItem("auth_token");
      })
      .addCase(restoreSession.fulfilled, (s, a) => {
        s.user = a.payload;
        s.status = "authenticated";
      })
      .addCase(restoreSession.rejected, (s) => {
        s.token = null;
        if (typeof window !== "undefined") localStorage.removeItem("auth_token");
      });
  },
});

export const { setToken } = authSlice.actions;
export default authSlice.reducer;
