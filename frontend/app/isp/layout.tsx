"use client";

import { Box } from "@mui/material";
import { Button, Stack, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EngineeringIcon from "@mui/icons-material/Engineering";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/isp/dashboard", label: "Team Calendar", icon: DashboardIcon },
  { href: "/isp/appointments", label: "Appointments", icon: CalendarMonthIcon },
];

function ISPSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile nav */}
      <Box sx={{ display: { xs: "block", md: "none" }, bgcolor: "#ffffff", px: 2, py: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.25, fontWeight: 700 }}>ISP Team</Typography>
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              component={Link}
              href={href}
              variant={pathname.startsWith(href) ? "contained" : "outlined"}
              color="primary"
              size="small"
              startIcon={<Icon />}
              sx={{ flexShrink: 0, borderRadius: 1, fontWeight: 600 }}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Desktop sidebar */}
      <Box
        component="nav"
        aria-label="ISP Team"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          width: { md: 240 },
          flexShrink: 0,
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
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <EngineeringIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: "0.02em" }}>
            ISP Team Portal
          </Typography>
        </Stack>
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          {LINKS.map(({ href, label, icon: Icon }) => {
            const isSelected = pathname.startsWith(href);
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
                  ...(!isSelected && { color: "text.primary", "&:hover": { bgcolor: "transparent", color: "primary.main", boxShadow: "none" } }),
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

export default function ISPLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "stretch" },
        bgcolor: "#f1f5f9",
        minHeight: "calc(100vh - 68px)",
        flex: 1,
      }}
    >
      <ISPSidebar />
      <Box sx={{ flex: 1, minWidth: 0, py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
        {children}
      </Box>
    </Box>
  );
}
