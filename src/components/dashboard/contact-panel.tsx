import { useTranslation } from "react-i18next";
import { Mail, Phone, Tag, X, Bot, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import { setRightPanelOpen } from "@/store/slices/ui-slice";
import { removeConversation, updateConversation } from "@/store/slices/conversations-slice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function ContactPanel() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activeId = useAppSelector((s) => s.conversations.activeId);
  const conv = useAppSelector((s) => s.conversations.items.find((c) => c.id === activeId));
  if (!conv) return null;
  const { contact } = conv;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <h3 className="text-sm font-semibold">{t("panel.contactInfo")}</h3>
        <Button variant="ghost" size="icon" onClick={() => dispatch(setRightPanelOpen(false))} aria-label={t("panel.close")}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col items-center gap-3 px-6 pt-6 pb-4 text-center">
          <Avatar className="h-24 w-24 ring-4 ring-primary/10">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback>{contact.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-display text-lg font-semibold">{contact.name}</div>
            <div className="text-xs text-muted-foreground">
              {contact.online ? t("chat.online") : t("chat.offline")}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {contact.tags.map((tg) => (
              <Badge key={tg} variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" /> {tg}
              </Badge>
            ))}
            {conv.assignedToAI && (
              <Badge className="gap-1">
                <Bot className="h-3 w-3" /> AI
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4 px-6 py-4 text-sm">
          <div>
            <div className="text-xs font-medium text-muted-foreground">{t("panel.about")}</div>
            <p className="mt-1">{contact.about}</p>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">{t("panel.phone")}</div>
            <div className="mt-1 flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{contact.phone}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">{t("panel.email")}</div>
            <div className="mt-1 flex items-center gap-2 break-all"><Mail className="h-4 w-4 text-muted-foreground" />{contact.email}</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 px-6 py-4">
          <div className="text-xs font-medium text-muted-foreground">{t("panel.actions")}</div>
          {conv.section !== "completed" ? (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={async () => {
                await dispatch(updateConversation({ id: conv.id, patch: { section: "completed" } }));
                toast.success(t("chat.completed"));
              }}
            >
              <CheckCircle2 className="me-2 h-4 w-4" /> {t("chat.markCompleted")}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={async () => {
                await dispatch(updateConversation({ id: conv.id, patch: { section: "current" } }));
                toast.success(t("chat.reopened"));
              }}
            >
              <RotateCcw className="me-2 h-4 w-4" /> {t("chat.reopen")}
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => dispatch(updateConversation({ id: conv.id, patch: { assignedToAI: !conv.assignedToAI } }))}
          >
            <Bot className="me-2 h-4 w-4" />
            {conv.assignedToAI ? t("chat.unassignAI") : t("chat.assignAI")}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={async () => {
              await dispatch(removeConversation(conv.id));
              toast.success(t("chat.deleted"));
            }}
          >
            <Trash2 className="me-2 h-4 w-4" /> {t("chat.delete")}
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
