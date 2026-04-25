import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, MoreVertical, Send, Bot, CheckCircle2, RotateCcw, Trash2, Info, Check, CheckCheck, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchMessages, sendMessage } from "@/store/slices/messages-slice";
import {
  removeConversation,
  updateConversation,
} from "@/store/slices/conversations-slice";
import { setRightPanelOpen } from "@/store/slices/ui-slice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { setActive } from "@/store/slices/conversations-slice";
import { cn } from "@/lib/utils";
import { formatDayHeader, formatLastSeen, formatTime } from "@/lib/format";

export function ChatWindow({ onBack }: { onBack: () => void }) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const activeId = useAppSelector((s) => s.conversations.activeId);
  const conversation = useAppSelector((s) =>
    s.conversations.items.find((c) => c.id === activeId),
  );
  const messages = useAppSelector((s) => (activeId ? s.messages.byConversation[activeId] : undefined));
  const loading = useAppSelector((s) => s.messages.loadingId === activeId);
  const sending = useAppSelector((s) => s.messages.sendingId === activeId);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeId && !messages) void dispatch(fetchMessages(activeId));
  }, [activeId, messages, dispatch]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, activeId]);

  const grouped = useMemo(() => {
    const groups: Array<{ day: string; items: typeof messages extends infer M ? M : never }> = [];
    if (!messages) return groups as Array<{ day: string; items: NonNullable<typeof messages> }>;
    const todayLabel = t("chat.today");
    const yesterdayLabel = t("chat.yesterday");
    const result: Array<{ day: string; items: NonNullable<typeof messages> }> = [];
    let currentDay = "";
    for (const m of messages) {
      const day = formatDayHeader(m.createdAt, i18n.language, todayLabel, yesterdayLabel);
      if (day !== currentDay) {
        result.push({ day, items: [] });
        currentDay = day;
      }
      result[result.length - 1].items.push(m);
    }
    return result;
  }, [messages, i18n.language, t]);

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="rounded-full bg-primary/10 p-6">
          <Send className="h-10 w-10 text-primary" />
        </div>
        <h2 className="font-display text-xl font-semibold">{t("chat.selectChat")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t("chat.selectChatHint")}</p>
      </div>
    );
  }

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || !activeId) return;
    setText("");
    const res = await dispatch(sendMessage({ conversationId: activeId, text: value }));
    if (sendMessage.rejected.match(res)) {
      toast.error(t("chat.sendFailed"));
      setText(value);
    }
  };

  const onComplete = async () => {
    await dispatch(updateConversation({ id: conversation.id, patch: { section: "completed" } }));
    toast.success(t("chat.completed"));
  };
  const onReopen = async () => {
    await dispatch(updateConversation({ id: conversation.id, patch: { section: "current" } }));
    toast.success(t("chat.reopened"));
  };
  const onToggleAI = async () => {
    await dispatch(
      updateConversation({
        id: conversation.id,
        patch: { assignedToAI: !conversation.assignedToAI },
      }),
    );
  };
  const onDelete = async () => {
    await dispatch(removeConversation(conversation.id));
    toast.success(t("chat.deleted"));
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-border bg-card/80 px-3 py-2.5 backdrop-blur md:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => {
              dispatch(setActive(null));
              onBack();
            }}
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarImage src={conversation.contact.avatar} alt={conversation.contact.name} />
            <AvatarFallback>{conversation.contact.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{conversation.contact.name}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {conversation.contact.online
                ? t("chat.online")
                : t("chat.lastSeen", { time: formatLastSeen(conversation.contact.lastSeen, i18n.language) })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hidden xl:inline-flex"
            onClick={() => dispatch(setRightPanelOpen(true))}
            aria-label={t("panel.contactInfo")}
          >
            <Info className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {conversation.section !== "completed" ? (
                <DropdownMenuItem onClick={onComplete}>
                  <CheckCircle2 className="me-2 h-4 w-4" /> {t("chat.markCompleted")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onReopen}>
                  <RotateCcw className="me-2 h-4 w-4" /> {t("chat.reopen")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onToggleAI}>
                <Bot className="me-2 h-4 w-4" />
                {conversation.assignedToAI ? t("chat.unassignAI") : t("chat.assignAI")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="me-2 h-4 w-4" /> {t("chat.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        <div className="mx-auto w-full max-w-3xl px-3 py-4 md:px-6">
          {loading && !messages ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            grouped.map((group, gi) => (
              <div key={gi} className="space-y-1.5">
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-card/90 px-3 py-1 text-[10px] font-medium text-muted-foreground shadow-soft">
                    {group.day}
                  </span>
                </div>
                {group.items.map((m, idx) => {
                  const fromMe = m.authorId === "me";
                  const prev = group.items[idx - 1];
                  const isGrouped = prev && prev.authorId === m.authorId;
                  return (
                    <div
                      key={m.id}
                      className={cn("flex", fromMe ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-soft",
                          fromMe
                            ? "bg-chat-bubble-out text-chat-bubble-out-foreground"
                            : "bg-chat-bubble-in text-chat-bubble-in-foreground",
                          isGrouped && "mt-0.5",
                          fromMe ? "rounded-ee-sm" : "rounded-es-sm",
                        )}
                      >
                        <div className="whitespace-pre-wrap break-words">{m.text}</div>
                        <div
                          className={cn(
                            "mt-1 flex items-center gap-1 text-[10px]",
                            fromMe ? "justify-end text-chat-bubble-out-foreground/70" : "text-muted-foreground",
                          )}
                        >
                          <span>{formatTime(m.createdAt, i18n.language)}</span>
                          {fromMe && (m.status === "read" ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : m.status === "delivered" ? (
                            <CheckCheck className="h-3 w-3 opacity-60" />
                          ) : (
                            <Check className="h-3 w-3 opacity-60" />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Composer */}
      <form
        onSubmit={onSend}
        className="flex items-center gap-2 border-t border-border bg-card/80 p-3 backdrop-blur"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("chat.typeMessage")}
          className="flex-1"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={!text.trim() || sending} aria-label={t("chat.send")}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:-scale-x-100" />}
        </Button>
      </form>
    </div>
  );
}
