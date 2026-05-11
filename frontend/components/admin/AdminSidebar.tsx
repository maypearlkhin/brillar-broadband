"use client";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CampaignIcon from "@mui/icons-material/Campaign";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import ExtensionIcon from "@mui/icons-material/Extension";
import RouterIcon from "@mui/icons-material/Router";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/dashboard", label: "Subscriptions", icon: AssignmentTurnedInIcon },
  { href: "/admin/plans", label: "Plan CMS", icon: DashboardCustomizeIcon },
  { href: "/admin/network", label: "Service status", icon: RouterIcon },
  { href: "/admin/announcements", label: "Announcements", icon: CampaignIcon },
  { href: "/admin/integration", label: "Integration", icon: ExtensionIcon },
  { href: "/admin/tickets", label: "Support Tickets", icon: SupportAgentIcon },
];

function linkSelected(pathname: string, href: string) {
  if (href === "/admin/dashboard") {
    return pathname === "/admin/dashboard";
  }

  return pathname.startsWith(href);
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          bgcolor: "#ffffff",
          px: 2,
          py: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.25, fontWeight: 700, color: "text.primary" }}>
          Console
        </Typography>
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
          {LINKS.map(({ href, label, icon: Icon }) => {
            const isSelected = linkSelected(pathname, href);

            return (
              <Button
                key={href}
                component={Link}
                href={href}
                variant={isSelected ? "contained" : "outlined"}
                color="primary"
                size="small"
                startIcon={<Icon />}
                sx={{
                  flexShrink: 0,
                  borderRadius: 1,
                  fontWeight: 600,
                }}
              >
                {label}
              </Button>
            );
          })}
        </Stack>
      </Box>

      <Box
        component="nav"
        aria-label="Admin operations"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          width: { md: 240 },
          flexShrink: 0,
          /* Sticky pin: header is 68px tall. Sidebar stays put while the right column scrolls. */
          position: "sticky",
          top: 68,
          alignSelf: "flex-start",
          height: "calc(100vh - 68px)",
          overflowY: "auto",
          bgcolor: "#ffffff",
          py: 3,
          px: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, fontWeight: 700, color: "text.primary", letterSpacing: "0.02em" }}
        >
          Operations
        </Typography>
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          {LINKS.map(({ href, label, icon: Icon }) => {
            const isSelected = linkSelected(pathname, href);

            return (
              <Button
                key={href}
                component={Link}
                href={href}
                variant={isSelected ? "contained" : "text"}
                color={isSelected ? "primary" : "inherit"}
                startIcon={<Icon />}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  px: 1.5,
                  borderRadius: 1,
                  fontWeight: 600,
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" },
                  ...(isSelected
                    ? {}
                    : {
                        color: "text.primary",
                        "&:hover": { bgcolor: "transparent", color: "primary.main", boxShadow: "none" },
                      }),
                }}
              >
                {label}
              </Button>
            );
          })}
        </Stack>
      </Box>
    </>
  );
}
