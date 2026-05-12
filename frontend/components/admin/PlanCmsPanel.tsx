"use client";

import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { deleteData, getData, postData, putData } from "@/lib/api";

export type PlanRow = {
  id: string;
  name: string;
  monthlyPrice: number;
  downloadSpeedMbps: number;
  price90Days?: number;
  price180Days?: number;
  price365Days?: number;
  features: string[];
  categoryId?: string;
  categoryTitle?: string;
  categorySortOrder?: number;
  planSortOrder?: number;
  isActive: boolean;
};

type PlanCategory = {
  id: string;
  title: string;
  sortOrder: number;
  isActive: boolean;
};

type PlanForm = {
  name: string;
  monthlyPrice: string;
  downloadSpeedMbps: string;
  price90Days: string;
  price180Days: string;
  price365Days: string;
  featuresText: string;
  isActive: boolean;
};

const emptyPlanForm: PlanForm = {
  name: "",
  monthlyPrice: "",
  downloadSpeedMbps: "",
  price90Days: "",
  price180Days: "",
  price365Days: "",
  featuresText: "",
  isActive: true
};

function formFromPlan(plan: PlanRow): PlanForm {
  return {
    name: plan.name,
    monthlyPrice: String(plan.monthlyPrice),
    downloadSpeedMbps: String(plan.downloadSpeedMbps),
    price90Days: plan.price90Days !== undefined ? String(plan.price90Days) : "",
    price180Days: plan.price180Days !== undefined ? String(plan.price180Days) : "",
    price365Days: plan.price365Days !== undefined ? String(plan.price365Days) : "",
    featuresText: plan.features.join("\n"),
    isActive: plan.isActive
  };
}

export default function PlanCmsPanel() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [categories, setCategories] = useState<PlanCategory[]>([]);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [editingPlan, setEditingPlan] = useState<PlanRow | null>(null);
  const [planCategory, setPlanCategory] = useState<PlanCategory | null>(null);
  const [planForm, setPlanForm] = useState<PlanForm>(emptyPlanForm);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PlanCategory | null>(null);
  const [categoryTitle, setCategoryTitle] = useState("");
  
  const [planToDelete, setPlanToDelete] = useState<PlanRow | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");

  const sections = useMemo(
    () =>
      [...categories]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => ({
          category,
          plans: plans
            .filter((plan) => plan.categoryId === category.id)
            .sort((a, b) => {
              const ao = a.planSortOrder ?? 999;
              const bo = b.planSortOrder ?? 999;
              if (ao !== bo) {
                return ao - bo;
              }
              return a.monthlyPrice - b.monthlyPrice;
            })
        })),
    [categories, plans]
  );

  async function loadData() {
    setLoadError("");
    try {
      const [plansResponse, categoriesResponse] = await Promise.all([
        getData("/api/admin/plans"),
        getData("/api/plan-categories")
      ]);
      setPlans(plansResponse.data.plans ?? []);
      setCategories(categoriesResponse.data.categories ?? []);
    } catch {
      setLoadError("Unable to load plan categories.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCategoryCreate() {
    setEditingCategory(null);
    setCategoryTitle("");
    setCategoryDialogOpen(true);
    setError("");
  }

  function openCategoryEdit(category: PlanCategory) {
    setEditingCategory(category);
    setCategoryTitle(category.title);
    setCategoryDialogOpen(true);
    setError("");
  }

  async function saveCategory() {
    setError("");

    if (!categoryTitle.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      if (editingCategory) {
        await putData(`/api/plan-categories/${encodeURIComponent(editingCategory.id)}`, {
          title: categoryTitle.trim()
        });
      } else {
        await postData("/api/plan-categories", { title: categoryTitle.trim() });
      }

      setCategoryDialogOpen(false);
      setEditingCategory(null);
      await loadData();
      router.refresh();
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || "Category save failed." : "Category save failed.");
    }
  }

  async function setCategoryActive(category: PlanCategory, isActive: boolean) {
    try {
      await putData(`/api/plan-categories/${encodeURIComponent(category.id)}`, { isActive });
      await loadData();
      router.refresh();
    } catch (err) {
      setLoadError(
        isAxiosError(err)
          ? err.response?.data?.message || "Unable to update category."
          : "Unable to update category."
      );
    }
  }

  function openPlanCreate(category: PlanCategory) {
    setEditingPlan(null);
    setPlanCategory(category);
    setPlanForm(emptyPlanForm);
    setError("");
  }

  function openPlanEdit(plan: PlanRow, category: PlanCategory) {
    setEditingPlan(plan);
    setPlanCategory(category);
    setPlanForm(formFromPlan(plan));
    setError("");
  }

  function closePlanDialog() {
    setEditingPlan(null);
    setPlanCategory(null);
    setError("");
  }

  async function savePlan() {
    if (!planCategory) {
      return;
    }

    setError("");
    const monthlyPrice = Number(planForm.monthlyPrice);
    const downloadSpeedMbps = Number(planForm.downloadSpeedMbps);
    const price90Days = Number(planForm.price90Days || 0);
    const price180Days = Number(planForm.price180Days || 0);
    const price365Days = Number(planForm.price365Days || 0);

    if (!planForm.name.trim()) {
      setError("Plan name is required.");
      return;
    }

    if (!Number.isFinite(monthlyPrice) || monthlyPrice < 0) {
      setError("Monthly price must be a valid number.");
      return;
    }

    if (!Number.isFinite(downloadSpeedMbps) || downloadSpeedMbps < 1) {
      setError("Download speed must be at least 1 Mbps.");
      return;
    }

    if (![price90Days, price180Days, price365Days].every((price) => Number.isFinite(price) && price >= 0)) {
      setError("90Days, 180Days, and 365Days amounts must be valid numbers.");
      return;
    }

    const features = planForm.featuresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      name: planForm.name.trim(),
      monthlyPrice,
      downloadSpeedMbps,
      price90Days,
      price180Days,
      price365Days,
      features,
      categoryId: planCategory.id,
      isActive: planForm.isActive
    };

    try {
      if (editingPlan) {
        await putData(`/api/plans/${encodeURIComponent(editingPlan.id)}`, payload);
      } else {
        await postData("/api/plans", payload);
      }

      closePlanDialog();
      await loadData();
      router.refresh();
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || "Plan save failed." : "Plan save failed.");
    }
  }

  function promptDelete(plan: PlanRow) {
    setPlanToDelete(plan);
  }

  async function executeDelete() {
    if (!planToDelete) return;
    const plan = planToDelete;
    setPlanToDelete(null);

    try {
      const response = await deleteData(`/api/plans/${encodeURIComponent(plan.id)}`);

      if (response.data?.softDeleted) {
        setDeleteMessage(response.data.message);
      }

      await loadData();
      router.refresh();
    } catch (err) {
      setLoadError(
        isAxiosError(err) ? err.response?.data?.message || "Unable to delete plan." : "Unable to delete plan."
      );
    }
  }

  async function setPlanActive(plan: PlanRow, isActive: boolean) {
    try {
      await putData(`/api/plans/${encodeURIComponent(plan.id)}`, { isActive });
      await loadData();
      router.refresh();
    } catch (err) {
      setLoadError(isAxiosError(err) ? err.response?.data?.message || "Unable to update plan." : "Unable to update plan.");
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h4">Plan CMS</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Create category grids, then add plan cards inside each category.
          </Typography>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openCategoryCreate}>
          Add category
        </Button>
      </Stack>

      {loadError && <Alert severity="error">{loadError}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Stack spacing={4}>
        {sections.map(({ category, plans: categoryPlans }) => (
          <Box key={category.id}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ mb: 2 }}
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {category.title}
                  </Typography>
                  <Chip
                    size="small"
                    label={category.isActive ? "Active" : "Inactive"}
                    color={category.isActive ? "success" : "default"}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {categoryPlans.length} {categoryPlans.length === 1 ? "plan" : "plans"}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<AddIcon />} onClick={() => openPlanCreate(category)}>
                  Add plan
                </Button>
                <IconButton aria-label="Edit category" onClick={() => openCategoryEdit(category)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  aria-label={category.isActive ? "Deactivate category" : "Reactivate category"}
                  title={category.isActive ? "Deactivate category" : "Reactivate category"}
                  color={category.isActive ? "default" : "success"}
                  onClick={() => setCategoryActive(category, !category.isActive)}
                >
                  {category.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                </IconButton>
              </Stack>
            </Stack>

            <Grid container spacing={2}>
              {categoryPlans.map((plan) => (
                <Grid item xs={12} md={4} key={plan.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 1,
                      borderTop: "3px solid",
                      borderTopColor: plan.isActive ? "primary.main" : "divider",
                      opacity: plan.isActive ? 1 : 0.62
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Box>
                            <Typography variant="h6" fontWeight={700}>
                              {plan.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {plan.id}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={plan.isActive ? "Active" : "Inactive"}
                            color={plan.isActive ? "success" : "default"}
                          />
                        </Stack>
                        <Stack direction="row" spacing={2} alignItems="baseline">
                          <Typography variant="h4" fontWeight={700}>
                            S${plan.monthlyPrice}
                          </Typography>
                          <Typography color="text.secondary">{plan.downloadSpeedMbps} Mbps</Typography>
                        </Stack>
                        <Grid container spacing={1}>
                          {[
                            ["90Days", plan.price90Days ?? 0],
                            ["180Days", plan.price180Days ?? 0],
                            ["365Days", plan.price365Days ?? 0]
                          ].map(([label, value]) => (
                            <Grid item xs={4} key={String(label)}>
                              <Box
                                sx={{
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: 1,
                                  px: 1,
                                  py: 0.75,
                                  bgcolor: "rgba(253, 184, 64, 0.04)"
                                }}
                              >
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {label}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  S${value}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                        <Divider />
                        <Stack spacing={0.75}>
                          {plan.features.map((feature) => (
                            <Typography key={feature} variant="body2" color="text.secondary">
                              {feature}
                            </Typography>
                          ))}
                        </Stack>
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => openPlanEdit(plan, category)}>
                        Edit
                      </Button>
                      <Stack direction="row" spacing={0}>
                        <IconButton
                          aria-label={plan.isActive ? "Deactivate plan" : "Reactivate plan"}
                          onClick={() => setPlanActive(plan, !plan.isActive)}
                        >
                          {plan.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                        <IconButton aria-label="Delete plan" color="error" onClick={() => promptDelete(plan)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Stack>

      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingCategory ? "Edit category" : "Add category"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Category name"
            value={categoryTitle}
            onChange={(event) => setCategoryTitle(event.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveCategory}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(planCategory)} onClose={closePlanDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPlan ? "Edit plan" : `Add plan to ${planCategory?.title ?? "category"}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={planForm.name}
              onChange={(event) => setPlanForm((f) => ({ ...f, name: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Monthly price (SGD)"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={planForm.monthlyPrice}
              onChange={(event) => setPlanForm((f) => ({ ...f, monthlyPrice: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Download speed (Mbps)"
              type="number"
              inputProps={{ min: 1, step: 1 }}
              value={planForm.downloadSpeedMbps}
              onChange={(event) => setPlanForm((f) => ({ ...f, downloadSpeedMbps: event.target.value }))}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="90Days amount"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={planForm.price90Days}
                  onChange={(event) => setPlanForm((f) => ({ ...f, price90Days: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="180Days amount"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={planForm.price180Days}
                  onChange={(event) => setPlanForm((f) => ({ ...f, price180Days: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="365Days amount"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={planForm.price365Days}
                  onChange={(event) => setPlanForm((f) => ({ ...f, price365Days: event.target.value }))}
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField
              label="Features (one per line)"
              value={planForm.featuresText}
              onChange={(event) => setPlanForm((f) => ({ ...f, featuresText: event.target.value }))}
              multiline
              minRows={4}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={planForm.isActive}
                  onChange={(event) => setPlanForm((f) => ({ ...f, isActive: event.target.checked }))}
                />
              }
              label="Active on storefront"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePlanDialog}>Cancel</Button>
          <Button variant="contained" onClick={savePlan}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(planToDelete)} onClose={() => setPlanToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete the plan <strong>{planToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={executeDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteMessage)} onClose={() => setDeleteMessage("")} maxWidth="sm" fullWidth>
        <DialogTitle>Plan Archived</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            {deleteMessage}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteMessage("")} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
