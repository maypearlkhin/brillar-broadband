import RouterIcon from "@mui/icons-material/Router";
import {
  AppBar,
  Box,
  Container,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import Link from "next/link";
import { getAccountHomePath, getCurrentUserFromCookies } from "@/lib/auth";
import NavActions from "@/components/NavActions";
import DesktopNav from "@/components/DesktopNav";
import MobileNav from "@/components/MobileNav";

export default function AppHeader() {
  const user = getCurrentUserFromCookies();

  const logoHref = user ? getAccountHomePath(user.role) : "/";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "primary.main",
        color: "common.white",
        borderBottom: "1px solid rgba(255,255,255,0.14)"
      }}
    >
      <Toolbar
        component={Container}
        maxWidth="lg"
        sx={{ width: "100%", gap: 2, justifyContent: "space-between", minHeight: 68 }}
      >
        <Stack
          component={Link}
          href={logoHref}
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{
            color: "common.white",
            textDecoration: "none",
            "&:hover": { opacity: 0.92 }
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.15)",
              display: "grid",
              placeItems: "center"
            }}
          >
            <RouterIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: { xs: "0.95rem", sm: "1rem" } }}
            >
              Brillar Broadband
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.85, display: { xs: "none", sm: "block" } }}
            >
              Fibre · SG &amp; MY
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
          <DesktopNav user={user} />
          <NavActions />
          <MobileNav user={user} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
