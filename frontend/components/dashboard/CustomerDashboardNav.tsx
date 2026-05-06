"use client";

import { Button, Stack } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/plans", label: "Plans & upgrade" }
];

export default function CustomerDashboardNav() {
  const pathname = usePathname();

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap" }}>
      {ITEMS.map(({ href, label }) => {
        const active =
          href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

        return (
          <Button
            key={href}
            component={Link}
            href={href}
            variant={active ? "contained" : "outlined"}
            color="primary"
            size="small"
            sx={{ fontWeight: 600 }}
          >
            {label}
          </Button>
        );
      })}
    </Stack>
  );
}
