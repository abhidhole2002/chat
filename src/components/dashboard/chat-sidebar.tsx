import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, MessageSquare, LogOut, Bot, CheckCircle2, Inbox, MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import { setActive, setSearch, setSection, markRead } from "@/store/slices/conversations-slice";
import { setMobileListOpen } from "@/store/slices/ui-slice";
import { logout } from "@/store/slices/auth-slice";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ChatSection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";

const SECTION_ICONS: Record<ChatSection, React.ComponentType<{ className?: string }>> = {
  current: MessagesSquare,
  completed: CheckCircle2,
  all: Inbox,
  ai: Bot,
};

export function ChatSidebar() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, activeId, search, section } = useAppSelector((s) => s.conversations);
  const user = useAppSelector((s) => s.auth.user);

  const counts = useMemo(() => {
    const base: Record<ChatSection, number> = { current: 0, completed: 0, all: items.length, ai: 0 };
    for (const c of items) {
      if (c.section === "current") base.current++;
      if (c.section === "completed") base.completed++;
      if (c.assignedToAI) base.ai++;
    }
    return base;
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((c) => {
        if (section === "all") return true;
        if (section === "ai") return c.assignedToAI;
        return c.section === section;
      })
      .filter((c) => {
        if (!q) return true;
        return (
          c.contact.name.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt));
  }, [items, search, section]);

  const sections: ChatSection[] = ["current", "completed", "all", "ai"];

  const onSignOut = async () => {
    await dispatch(logout());
    toast.success(t("auth.signedOut"));
    navigate({ to: "/login" });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{user?.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user?.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={onSignOut} aria-label={t("auth.signOut")}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-sidebar-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            placeholder={t("chat.searchPlaceholder")}
            className="ps-8"
          />
        </div>
      </div>

      {/* Section tabs */}
      <div className="grid grid-cols-4 gap-1 border-b border-sidebar-border px-2 py-2">
        {sections.map((s) => {
          const Icon = SECTION_ICONS[s];
          const active = section === s;
          return (
            <button
              key={s}
              onClick={() => dispatch(setSection(s))}
              className={cn(
                "group flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[11px] font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <span className="relative">
                <Icon className="h-4 w-4" />
                {counts[s] > 0 && (
                  <span className="absolute -end-1.5 -top-1.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                    {counts[s]}
                  </span>
                )}
              </span>
              <span className="truncate">{t(`nav.${s}`)}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <ScrollArea className="flex-1 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 opacity-40" />
            <div className="text-sm font-medium">{t("chat.noChats")}</div>
            <div className="text-xs">{t("chat.noChatsHint")}</div>
          </div>
        ) : (
          <ul className="flex flex-col">
            {filtered.map((c) => {
              const isActive = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      dispatch(setActive(c.id));
                      dispatch(markRead(c.id));
                      dispatch(setMobileListOpen(false));
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-3 text-start transition-colors",
                      isActive ? "bg-primary/10" : "hover:bg-sidebar-accent/60",
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={c.contact.avatar} alt={c.contact.name} />
                        <AvatarFallback>{c.contact.name[0]}</AvatarFallback>
                      </Avatar>
                      {c.contact.online && (
                        <span className="absolute end-0 bottom-0 h-3 w-3 rounded-full border-2 border-sidebar bg-success" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("truncate text-sm font-semibold", isActive && "text-primary")}>
                          {c.contact.name}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatRelative(c.lastMessageAt, i18n.language)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted-foreground">{c.lastMessage}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {c.assignedToAI && (
                            <Badge variant="secondary" className="h-4 gap-1 px-1 text-[9px]">
                              <Bot className="h-2.5 w-2.5" /> AI
                            </Badge>
                          )}
                          {c.unreadCount > 0 && (
                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
