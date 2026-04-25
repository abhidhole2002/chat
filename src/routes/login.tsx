import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { MessageSquare, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { login } from "@/store/slices/auth-slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/language-switcher";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ChatDash" },
      { name: "description", content: "Sign in to your ChatDash account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, status } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("alex@chatdash.app");
  const [password, setPassword] = useState("demo1234");

  useEffect(() => {
    if (token) navigate({ to: "/dashboard", replace: true });
  }, [token, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if (login.fulfilled.match(res)) {
      toast.success(t("auth.signedIn", { name: res.payload.user.name }));
      navigate({ to: "/dashboard" });
    } else {
      toast.error(t("auth.invalid"));
    }
  };

  const loading = status === "loading";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: hero panel */}
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,oklch(0.85_0.18_295/0.4),transparent_60%),radial-gradient(circle_at_80%_70%,oklch(0.75_0.2_240/0.45),transparent_55%)]" />
        <div className="relative flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-6 w-6" />
          <span className="font-display tracking-tight">{t("app.name")}</span>
        </div>
        <div className="relative space-y-4">
          <h1 className="font-display text-4xl leading-tight font-bold tracking-tight">
            {t("auth.welcome")}
          </h1>
          <p className="max-w-md text-primary-foreground/80">{t("app.tagline")}</p>
        </div>
        <div className="relative text-sm text-primary-foreground/60">© ChatDash</div>
      </div>

      {/* Right: form */}
      <div className="flex flex-col">
        <div className="flex justify-end p-4">
          <LanguageSwitcher />
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center lg:text-start">
              <Link to="/" className="inline-flex items-center gap-2 lg:hidden">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="font-display font-semibold">{t("app.name")}</span>
              </Link>
              <h2 className="font-display text-2xl font-semibold">{t("auth.welcome")}</h2>
              <p className="text-sm text-muted-foreground">{t("auth.subtitle")}</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.passwordPlaceholder")}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t("auth.signingIn")}
                </>
              ) : (
                t("auth.signIn")
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">{t("auth.demoHint")}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
