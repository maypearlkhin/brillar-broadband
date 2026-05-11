"use client";

import LogoutIcon from "@mui/icons-material/Logout";
import { Button } from "@mui/material";
import { clearAuthToken, getAuthToken } from "@/lib/authStorage";
import { getData } from "@/lib/api";

type LogoutButtonProps = {
  /** `navbar`: white text on dark blue app bar. `toolbar`: outlined in page body. */
  variant?: "navbar" | "toolbar";
};

function getUserInfoFromToken() {
  const token = getAuthToken();
  if (!token) return { userId: null, role: null };
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { userId: payload.userId || null, role: payload.role || null };
  } catch (e) {
    return { userId: null, role: null };
  }
}

export default function LogoutButton({
  variant = "toolbar",
}: LogoutButtonProps) {
  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    const { userId, role } = getUserInfoFromToken();

    try {
      const intRes = await getData("/api/admin/integration");
      const integration = intRes?.data?.integration;
      if (integration?.token && integration?.endpointDomain && role === "customer") {
        const endpoint = `${integration.endpointDomain}/post-login/user-logout`;
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: integration.token,
          },
          body: JSON.stringify({
            userId,
            message: `User logged out successfully with userId: ${userId}`,
          }),
        });
      }
    } catch (err) {
      console.log("Failed calling api to Atenxion Backend for user logout", err);
    }

    clearAuthToken();
    window.location.assign("/logout");
  }

  const isNavbar = variant === "navbar";

  return (
    <Button
      onClick={handleLogout}
      startIcon={<LogoutIcon />}
      variant={isNavbar ? "text" : "outlined"}
      color={isNavbar ? "inherit" : "primary"}
      size="small"
      sx={
        isNavbar
          ? { color: "common.white" }
          : {
              borderColor: "rgba(13, 27, 50, 0.45)",
              "&:hover": { borderColor: "primary.main" },
            }
      }
    >
      Sign out
    </Button>
  );
}
