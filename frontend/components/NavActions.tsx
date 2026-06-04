import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LoginIcon from "@mui/icons-material/Login";
import { Box, Button } from "@mui/material";
import Link from "next/link";
import { getAccountHomePath, getCurrentUserFromCookies } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default function NavActions() {
  const currentUser = getCurrentUserFromCookies();

  if (!currentUser) {
    return (
      <Box sx={{ display: "flex", gap: 1.25, alignItems: "center", flexShrink: 0 }}>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          size="small"
          startIcon={<LoginIcon sx={{ display: { xs: "none", sm: "inline-flex" } }} />}
          sx={{
            bgcolor: "#FEC556",
            color: "#000000",
            minWidth: { xs: 72, sm: 64 },
            px: { xs: 1.5, sm: 2 },
            "&:hover": { bgcolor: "#FDB840" },
          }}
        >
          Sign in
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1.25, alignItems: "center", flexShrink: 0 }}>
      {currentUser.role === "admin" ? (
        <Button
          component={Link}
          href="/admin/dashboard"
          startIcon={<AdminPanelSettingsIcon />}
          sx={{ color: "common.white" }}
          size="small"
        >
          Admin console
        </Button>
      ) : (
        <Button
          component={Link}
          href={getAccountHomePath(currentUser.role)}
          startIcon={<AccountCircleIcon />}
          sx={{ color: "common.white" }}
          size="small"
        >
          My account
        </Button>
      )}
      <LogoutButton variant="navbar" />
    </Box>
  );
}
