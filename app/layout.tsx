import type { Metadata } from "next";
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import Link from "next/link";
import Providers from "@/components/Providers";
import NavActions from "@/components/NavActions";

export const metadata: Metadata = {
  title: "Brillar Broadband",
  description: "Internet service provider MVP customer portal"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              bgcolor: "#b44cc1",
              color: "common.white",
              backdropFilter: "blur(10px)"
            }}
          >
            <Toolbar
              component={Container}
              maxWidth="lg"
              sx={{ width: "100%", gap: 2, justifyContent: "space-between", minHeight: 76 }}
            >
              <Stack
                component={Link}
                href="/"
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  color: "common.white",
                  textDecoration: "none"
                }}
              >
                <WifiTetheringIcon />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Brillar Broadband
                </Typography>
              </Stack>
              <Stack
                component="nav"
                direction="row"
                spacing={2.5}
                sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
              >
                {[
                  ["Home", "/"],
                  ["Features", "/#features"],
                  ["Review", "/#reviews"],
                  ["Product", "/#plans"],
                  ["Help", "/#help"]
                ].map(([label, href]) => (
                  <Button
                    component={Link}
                    href={href}
                    key={label}
                    size="small"
                    sx={{
                      color: "common.white",
                      opacity: label === "Home" ? 1 : 0.88,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.12)" }
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
              <NavActions />
            </Toolbar>
          </AppBar>
          <Box component="main">{children}</Box>
        </Providers>
      </body>
    </html>
  );
}
