import { redirect } from "next/navigation";
import CustomerShell from "@/components/dashboard/CustomerShell";
import { getCurrentUserFromCookies } from "@/lib/auth";

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUserFromCookies();
  if (user?.role === "isp_team") {
    redirect("/isp/dashboard");
  }
  if (user?.role === "admin") {
    redirect("/admin/dashboard");
  }
  return <CustomerShell>{children}</CustomerShell>;
}
