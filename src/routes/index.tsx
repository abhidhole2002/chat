import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppSelector } from "@/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  useEffect(() => {
    navigate({ to: token ? "/dashboard" : "/login", replace: true });
  }, [token, navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-muted-foreground">Loading…</div>
    </div>
  );
}
