"use client";

import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import Link from "next/link";
import { getAccountHomePath } from "@/lib/accountPaths";
import LogoutButton from "@/components/LogoutButton";

type MobileNavUser = {
  role: string;
} | null;

type NavLink = {
  label: string;
  href: string;
};

function getNavLinks(user: MobileNavUser): NavLink[] {
  const links: NavLink[] = [];

  if (!user) {
    links.push({ label: "Plans", href: "/#plans" });
  }

  links.push(
    { label: "Enterprise", href: "/enterprise" },
    { label: "About Us", href: "/about" },
    { label: "Help Center & FAQ", href: "/faq" },
    { label: "Network Status", href: "/service-status" }
  );

  if (!user) {
    links.push({ label: "Register", href: "/register" });
  }

  return links;
}

export default function MobileNav({ user }: { user: MobileNavUser }) {
  const [open, setOpen] = useState(false);
  const navLinks = getNavLinks(user);

  const closeDrawer = () => setOpen(false);

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
        sx={{ display: { xs: "inline-flex", md: "none" }, ml: 0.5 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={closeDrawer}
        PaperProps={{
          sx: { width: { xs: "min(100vw, 320px)", sm: 320 }, bgcolor: "primary.main", color: "common.white" }
        }}
      >
        <Stack sx={{ height: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.14)" }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Menu
            </Typography>
            <IconButton color="inherit" aria-label="Close navigation menu" onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <List sx={{ flex: 1, py: 1 }}>
            {navLinks.map((link) => (
              <ListItemButton
                key={link.href}
                component={Link}
                href={link.href}
                onClick={closeDrawer}
                sx={{
                  color: "common.white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)" }
                }}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.14)" }} />

          {user ? (
            <Box sx={{ p: 2, display: { xs: "block", md: "none" } }}>
              <Stack spacing={1.25}>
                {user.role === "admin" ? (
                  <ListItemButton
                    component={Link}
                    href="/admin/dashboard"
                    onClick={closeDrawer}
                    sx={{ color: "common.white", borderRadius: 1, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}
                  >
                    <AdminPanelSettingsIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <ListItemText primary="Admin console" />
                  </ListItemButton>
                ) : (
                  <ListItemButton
                    component={Link}
                    href={getAccountHomePath(user.role)}
                    onClick={closeDrawer}
                    sx={{ color: "common.white", borderRadius: 1, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}
                  >
                    <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <ListItemText primary="My account" />
                  </ListItemButton>
                )}
                <LogoutButton variant="navbar" />
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </Drawer>
    </>
  );
}
