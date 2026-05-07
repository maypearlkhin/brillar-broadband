"use client";

import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
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
  featuresText: string;
  isActive: boolean;
};

const emptyPlanForm: PlanForm = {
  name: "",
  monthlyPrice: "",
  downloadSpeedMbps: "",
  featuresText: "",
  isActive: true
};

function formFromPlan(plan: PlanRow): PlanForm {
  return {
    name: plan.name,
    monthlyPrice: String(plan.monthlyPrice),
    downloadSpeedMbps: String(plan.downloadSpeedMbps),
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

    const features = planForm.featuresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      name: planForm.name.trim(),
      monthlyPrice,
      downloadSpeedMbps,
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

  async function setPlanActive(plan: PlanRow, isActive: boolean) {
    try {
      if (isActive) {
        await putData(`/api/plans/${encodeURIComponent(plan.id)}`, { isActive: true });
      } else {
        await deleteData(`/api/plans/${encodeURIComponent(plan.id)}`);
      }

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
                      <IconButton
                        aria-label={plan.isActive ? "Deactivate plan" : "Reactivate plan"}
                        onClick={() => setPlanActive(plan, !plan.isActive)}
                      >
                        {plan.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
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
    </Stack>
  );
}
