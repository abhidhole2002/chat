import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchConversations } from "@/store/slices/conversations-slice";
import { setMobileListOpen } from "@/store/slices/ui-slice";
import { ChatSidebar } from "./chat-sidebar";
import { ChatWindow } from "./chat-window";
import { ContactPanel } from "./contact-panel";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  useTranslation();
  const dispatch = useAppDispatch();
  const { activeId, status } = useAppSelector((s) => s.conversations);
  const rightOpen = useAppSelector((s) => s.ui.rightPanelOpen);
  const mobileListOpen = useAppSelector((s) => s.ui.mobileListOpen);

  useEffect(() => {
    if (status === "idle") void dispatch(fetchConversations());
  }, [dispatch, status]);

  // On mobile: when a chat is selected, hide the list
  const showMobileList = useMemo(() => mobileListOpen && !activeId, [mobileListOpen, activeId]);
  const showMobileChat = !!activeId;

  return (
    <div className="grid h-screen w-full overflow-hidden bg-background md:grid-cols-[340px_1fr] xl:grid-cols-[340px_1fr_320px]">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-screen min-h-0 flex-col border-e border-sidebar-border bg-sidebar md:flex",
          showMobileList ? "flex" : "hidden md:flex",
        )}
      >
        <ChatSidebar />
      </aside>

      {/* Chat window */}
      <main
        className={cn(
          "min-w-0 flex h-screen min-h-0 flex-col bg-chat-pattern md:flex",
          showMobileChat ? "flex" : "hidden md:flex",
        )}
      >
        <ChatWindow onBack={() => dispatch(setMobileListOpen(true))} />
      </main>

      {/* Right panel: only on xl+, when open and chat selected */}
      {rightOpen && activeId && (
        <aside className="hidden h-screen min-h-0 border-s border-sidebar-border bg-sidebar xl:block">
          <ContactPanel />
        </aside>
      )}
    </div>
  );
}
