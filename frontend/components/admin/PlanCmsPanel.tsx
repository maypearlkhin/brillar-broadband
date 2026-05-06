"use client";

import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type PlanRow = {
  id: string;
  name: string;
  monthlyPrice: number;
  downloadSpeedMbps: number;
  features: string[];
  categoryId?: string;
  categoryTitle?: string;
  categorySortOrder?: number;
  isActive: boolean;
};

export default function PlanCmsPanel() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<PlanRow | null>(null);
  const [form, setForm] = useState({
    name: "",
    monthlyPrice: "",
    downloadSpeedMbps: "",
    featuresText: "",
    categoryId: "",
    categoryTitle: "",
    categorySortOrder: ""
  });

  async function loadPlans() {
    setLoadError("");
    const response = await fetch("/api/admin/plans", { cache: "no-store" });

    if (!response.ok) {
      setLoadError("Unable to load plans.");
      return;
    }

    const data = await response.json();
    setPlans(data.plans ?? []);
  }

  useEffect(() => {
    loadPlans();
  }, []);

  function openEdit(plan: PlanRow) {
    setEditing(plan);
    setForm({
      name: plan.name,
      monthlyPrice: String(plan.monthlyPrice),
      downloadSpeedMbps: String(plan.downloadSpeedMbps),
      featuresText: plan.features.join("\n"),
      categoryId: plan.categoryId ?? "",
      categoryTitle: plan.categoryTitle ?? "",
      categorySortOrder:
        plan.categorySortOrder !== undefined && plan.categorySortOrder !== null
          ? String(plan.categorySortOrder)
          : ""
    });
    setError("");
  }

  async function savePlan() {
    if (!editing) {
      return;
    }

    setError("");
    const monthlyPrice = Number(form.monthlyPrice);
    const downloadSpeedMbps = Number(form.downloadSpeedMbps);

    if (!Number.isFinite(monthlyPrice) || monthlyPrice < 0) {
      setError("Monthly price must be a valid number.");
      return;
    }

    if (!Number.isFinite(downloadSpeedMbps) || downloadSpeedMbps < 1) {
      setError("Download speed must be at least 1 Mbps.");
      return;
    }

    const features = form.featuresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const categorySortOrder = Number(form.categorySortOrder);
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      monthlyPrice,
      downloadSpeedMbps,
      features,
      categoryId: form.categoryId.trim(),
      categoryTitle: form.categoryTitle.trim()
    };

    if (form.categorySortOrder.trim() !== "" && Number.isFinite(categorySortOrder)) {
      payload.categorySortOrder = categorySortOrder;
    }

    const response = await fetch(`/api/plans/${encodeURIComponent(editing.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Update failed.");
      return;
    }

    setEditing(null);
    await loadPlans();
    router.refresh();
  }

  async function deactivatePlan(plan: PlanRow) {
    if (!window.confirm(`Deactivate plan "${plan.name}"? It will disappear from the storefront.`)) {
      return;
    }

    const response = await fetch(`/api/plans/${encodeURIComponent(plan.id)}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const data = await response.json();
      setLoadError(data.message || "Unable to deactivate.");
      return;
    }

    await loadPlans();
    router.refresh();
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Plan CMS</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Edit pricing and speeds. Changes apply immediately on the homepage for active plans.
        </Typography>
      </Box>

      {loadError && <Alert severity="error">{loadError}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Plan</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price / mo</TableCell>
              <TableCell align="right">Mbps</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <Typography fontWeight={700}>{plan.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {plan.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{plan.categoryTitle ?? "—"}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {plan.categoryId ?? ""}
                  </Typography>
                </TableCell>
                <TableCell align="right">${plan.monthlyPrice}</TableCell>
                <TableCell align="right">{plan.downloadSpeedMbps}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={plan.isActive ? "Active" : "Inactive"}
                    color={plan.isActive ? "success" : "default"}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="Edit plan"
                    onClick={() => openEdit(plan)}
                    disabled={!plan.isActive}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="Deactivate plan"
                    onClick={() => deactivatePlan(plan)}
                    disabled={!plan.isActive}
                  >
                    <BlockIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit plan</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Monthly price (USD)"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={form.monthlyPrice}
              onChange={(event) => setForm((f) => ({ ...f, monthlyPrice: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Download speed (Mbps)"
              type="number"
              inputProps={{ min: 1, step: 1 }}
              value={form.downloadSpeedMbps}
              onChange={(event) =>
                setForm((f) => ({ ...f, downloadSpeedMbps: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Features (one per line)"
              value={form.featuresText}
              onChange={(event) => setForm((f) => ({ ...f, featuresText: event.target.value }))}
              multiline
              minRows={4}
              fullWidth
            />
            <TextField
              label="Category ID"
              value={form.categoryId}
              onChange={(event) => setForm((f) => ({ ...f, categoryId: event.target.value }))}
              fullWidth
              helperText="Same ID on all plans in one catalogue line (e.g. res_everyday)."
            />
            <TextField
              label="Category title"
              value={form.categoryTitle}
              onChange={(event) => setForm((f) => ({ ...f, categoryTitle: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Category sort order"
              type="number"
              inputProps={{ step: 1 }}
              value={form.categorySortOrder}
              onChange={(event) => setForm((f) => ({ ...f, categorySortOrder: event.target.value }))}
              fullWidth
              helperText="Lower numbers appear first on the storefront."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={savePlan}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
