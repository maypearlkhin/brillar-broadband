"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { getData, postData, deleteData } from "@/lib/api";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "isp_team";
  serviceZone?: { country: string; district: string; postalCode: string };
  createdAt: string;
};

const ROLE_TABS = ["All", "customer", "isp_team", "admin"];
const ROLE_LABELS: Record<string, string> = { customer: "Customer", admin: "Admin", isp_team: "ISP Team" };

function getRoleColor(role: string): "default" | "primary" | "success" | "warning" {
  switch (role) {
    case "admin": return "primary";
    case "isp_team": return "success";
    default: return "default";
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState("All");
  const [error, setError] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // Invite form state
  const [iName, setIName] = useState("");
  const [iEmail, setIEmail] = useState("");
  const [iPassword, setIPassword] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  async function loadUsers() {
    try {
      const res = await getData("/api/admin/users");
      setUsers(res.data.data || []);
    } catch {
      setError("Failed to load users.");
    }
  }

  useEffect(() => { loadUsers(); }, []);

  const filtered = tab === "All" ? users : users.filter((u) => u.role === tab);

  async function handleInvite() {
    setInviteError("");
    setInviteLoading(true);
    try {
      await postData("/api/admin/users/invite", { name: iName, email: iEmail, password: iPassword });
      setInviteOpen(false);
      setIName(""); setIEmail(""); setIPassword("");
      await loadUsers();
    } catch (err: any) {
      setInviteError(err?.response?.data?.message || "Failed to create account.");
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteData(`/api/admin/users/${deleteTarget._id}`);
      setDeleteTarget(null);
      await loadUsers();
    } catch {
      setError("Failed to remove user.");
      setDeleteTarget(null);
    }
  }

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={700}>Admin</Typography>
          <Typography variant="h5" fontWeight={600}>User Management</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            Manage all customer and ISP team accounts.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setInviteOpen(true)}
        >
          Invite ISP Team
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {ROLE_TABS.map((r) => (
            <Tab key={r} label={r === "All" ? "All" : ROLE_LABELS[r]} value={r} />
          ))}
        </Tabs>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name || "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip size="small" label={ROLE_LABELS[user.role] || user.role} color={getRoleColor(user.role)} />
                </TableCell>
                <TableCell>
                  {user.serviceZone
                    ? `${user.serviceZone.district}, ${user.serviceZone.country}`
                    : "—"}
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  {user.role !== "admin" && (
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(user)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>No users found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Invite ISP Team Dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Invite ISP Team Member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {inviteError && <Alert severity="error">{inviteError}</Alert>}
            <TextField label="Full Name" value={iName} onChange={(e) => setIName(e.target.value)} fullWidth required />
            <TextField label="Email" type="email" value={iEmail} onChange={(e) => setIEmail(e.target.value)} fullWidth required />
            <TextField label="Password" type="password" value={iPassword} onChange={(e) => setIPassword(e.target.value)} fullWidth required helperText="Minimum 6 characters" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)} disabled={inviteLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite} disabled={inviteLoading || !iName || !iEmail || !iPassword}>
            {inviteLoading ? <CircularProgress size={20} /> : "Create Account"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Remove User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{deleteTarget?.name || deleteTarget?.email}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Remove</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
