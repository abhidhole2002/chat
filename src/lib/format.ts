import { format, formatDistanceToNow, isToday, isYesterday, type Locale } from "date-fns";
import { enUS, es, fr, arSA } from "date-fns/locale";

const LOCALES: Record<string, Locale> = {
  en: enUS,
  es,
  fr,
  ar: arSA,
};

function getLocale(lang?: string) {
  if (!lang) return enUS;
  return LOCALES[lang.split("-")[0]] ?? enUS;
}

export function formatRelative(iso: string, lang?: string) {
  const date = new Date(iso);
  const locale = getLocale(lang);
  if (isToday(date)) return format(date, "HH:mm", { locale });
  if (isYesterday(date)) return format(date, "EEE", { locale });
  return format(date, "dd/MM", { locale });
}

export function formatTime(iso: string, lang?: string) {
  return format(new Date(iso), "HH:mm", { locale: getLocale(lang) });
}

export function formatDayHeader(iso: string, lang?: string, todayLabel = "Today", yesterdayLabel = "Yesterday") {
  const date = new Date(iso);
  if (isToday(date)) return todayLabel;
  if (isYesterday(date)) return yesterdayLabel;
  return format(date, "PPP", { locale: getLocale(lang) });
}

export function formatLastSeen(iso: string, lang?: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: getLocale(lang) });
}
