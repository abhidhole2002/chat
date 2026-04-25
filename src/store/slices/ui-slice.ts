import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Theme = "light" | "dark";

interface State {
  theme: Theme;
  rightPanelOpen: boolean;
  mobileListOpen: boolean;
}

function initialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const initialState: State = {
  theme: initialTheme(),
  rightPanelOpen: true,
  mobileListOpen: true,
};

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
        document.documentElement.classList.toggle("dark", action.payload === "dark");
      }
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", state.theme);
        document.documentElement.classList.toggle("dark", state.theme === "dark");
      }
    },
    setRightPanelOpen(state, action: PayloadAction<boolean>) {
      state.rightPanelOpen = action.payload;
    },
    setMobileListOpen(state, action: PayloadAction<boolean>) {
      state.mobileListOpen = action.payload;
    },
  },
});

export const { setTheme, toggleTheme, setRightPanelOpen, setMobileListOpen } = slice.actions;
export default slice.reducer;
