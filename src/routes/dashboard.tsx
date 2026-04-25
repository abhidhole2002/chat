import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppSelector } from "@/store";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ChatDash" },
      { name: "description", content: "Manage your conversations across sections." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (!token) navigate({ to: "/login", replace: true });
  }, [token, navigate]);

  if (!token) return null;
  return <DashboardLayout />;
}
