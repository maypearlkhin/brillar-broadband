"use client";

import LogoutIcon from "@mui/icons-material/Logout";
import { Button } from "@mui/material";
import Link from "next/link";
import { clearAuthToken } from "@/lib/authStorage";

type LogoutButtonProps = {
  /** `navbar`: white text on pink app bar. `toolbar`: outlined in page body. */
  variant?: "navbar" | "toolbar";
};

export default function LogoutButton({ variant = "toolbar" }: LogoutButtonProps) {
  function handleLogout() {
    clearAuthToken();
  }

  const isNavbar = variant === "navbar";

  return (
    <Button
      component={Link}
      href="/logout"
      onClick={handleLogout}
      startIcon={<LogoutIcon />}
      variant={isNavbar ? "text" : "outlined"}
      color={isNavbar ? "inherit" : "primary"}
      size="small"
      sx={
        isNavbar
          ? { color: "common.white" }
          : {
              borderColor: "rgba(236, 72, 153, 0.45)",
              "&:hover": { borderColor: "primary.main" },
            }
      }
    >
      Sign out
    </Button>
  );
}
