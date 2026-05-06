import { Box, Button } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Link from "next/link";
import { getCurrentUserFromCookies } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default function NavActions() {
  const currentUser = getCurrentUserFromCookies();

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      {currentUser ? (
        <>
          {currentUser.role === "admin" ? (
            <Button
              component={Link}
              href="/admin"
              startIcon={<AdminPanelSettingsIcon />}
              sx={{ color: "common.white" }}
            >
              Admin
            </Button>
          ) : (
            <Button
              component={Link}
              href="/dashboard"
              startIcon={<AccountCircleIcon />}
              sx={{ color: "common.white" }}
            >
              Dashboard
            </Button>
          )}
          <LogoutButton />
        </>
      ) : (
        <Button
          component={Link}
          href="/login"
          variant="contained"
          color="secondary"
          startIcon={<LoginIcon />}
        >
          Login
        </Button>
      )}
    </Box>
  );
}
