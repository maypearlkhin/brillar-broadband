"use client";

import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <Button onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ color: "common.white" }}>
      Logout
    </Button>
  );
}
