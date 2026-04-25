import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import auth from "./slices/auth-slice";
import conversations from "./slices/conversations-slice";
import messages from "./slices/messages-slice";
import ui from "./slices/ui-slice";

export const store = configureStore({
  reducer: { auth, conversations, messages, ui },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
