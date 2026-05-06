import { Box } from "@mui/material";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SessionGreeting from "@/components/SessionGreeting";
import { getCurrentUserFromCookies } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUserFromCookies();

  if (!user) {
    redirect("/login?next=/admin/dashboard");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "stretch" },
        bgcolor: "#f1f5f9",
        minHeight: "calc(100vh - 64px)",
        flex: 1,
      }}
    >
      <AdminSidebar />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          py: { xs: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <SessionGreeting />
        {children}
      </Box>
    </Box>
  );
}
