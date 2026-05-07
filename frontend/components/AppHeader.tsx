import RouterIcon from "@mui/icons-material/Router";
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import Link from "next/link";
import { getCurrentUserFromCookies } from "@/lib/auth";
import NavActions from "@/components/NavActions";

export default function AppHeader() {
  const user = getCurrentUserFromCookies();

  const logoHref =
    user?.role === "admin" ? "/admin/dashboard" : user ? "/dashboard" : "/";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#d946a8",
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
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Brillar Broadband
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, display: "block" }}>
              Fibre · SG &amp; MY
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          {!user && (
            <>
              <Button component={Link} href="/service-status" sx={{ color: "common.white" }} size="small">
                Service status
              </Button>
              <Button component={Link} href="/#plans" sx={{ color: "common.white" }} size="small">
                Plans
              </Button>
              <Button component={Link} href="/register" sx={{ color: "common.white" }} size="small">
                Register
              </Button>
            </>
          )}
        </Stack>

        <NavActions />
      </Toolbar>
    </AppBar>
  );
}
