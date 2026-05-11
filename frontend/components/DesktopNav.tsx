"use client";

import { useState } from "react";
import { Button, Menu, MenuItem, Stack } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Link from "next/link";

export default function DesktopNav({ user }: { user: any }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
      {!user && (
        <Button component={Link} href="/#plans" sx={{ color: "common.white" }} size="small">
          Plans
        </Button>
      )}
      <Button component={Link} href="/enterprise" sx={{ color: "common.white" }} size="small">
        Enterprise
      </Button>

      <Button component={Link} href="/about" sx={{ color: "common.white" }} size="small">
        About Us
      </Button>

      <Button
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ color: "common.white" }}
        size="small"
      >
        Support
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'support-button' }}
      >
        <MenuItem onClick={handleClose} component={Link} href="/faq">Help Center &amp; FAQ</MenuItem>
        <MenuItem onClick={handleClose} component={Link} href="/service-status">Network Status</MenuItem>
      </Menu>

      {!user && (
        <Button component={Link} href="/register" sx={{ color: "common.white" }} size="small">
          Register
        </Button>
      )}
    </Stack>
  );
}
