import Plan from "../../models/planModel.js";
import PlanCategory from "../../models/planCategoryModel.js";

function slugifyPlanId(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function cleanTitle(value) {
  return String(value ?? "").replace(/Â·/g, "·").trim();
}

export function serializePlanDoc(plan) {
  return {
    id: plan.id,
    name: plan.name,
    monthlyPrice: plan.monthlyPrice,
    downloadSpeedMbps: plan.downloadSpeedMbps,
    features: plan.features,
    categoryId: plan.categoryId,
    categoryTitle: cleanTitle(plan.categoryTitle),
    categorySortOrder: plan.categorySortOrder,
    planSortOrder: plan.planSortOrder,
    isActive: plan.isActive
  };
}

export async function listActivePlans(_req, res) {
  const categories = await PlanCategory.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  const plans = await Plan.find({ isActive: true, categoryId: { $in: categories.map((category) => category.id) } })
    .sort({ categorySortOrder: 1, planSortOrder: 1, monthlyPrice: 1 })
    .lean();

  return res.json({
    plans: plans.map((plan) => {
      const category = categoryById.get(plan.categoryId);
      return serializePlanDoc({
        ...plan,
        categoryTitle: category?.title ?? plan.categoryTitle,
        categorySortOrder: category?.sortOrder ?? plan.categorySortOrder
      });
    })
  });
}

export async function getPlanById(req, res) {
  const plan = await Plan.findOne({ id: req.params.planId, isActive: true }).lean();

  const category = plan ? await PlanCategory.findOne({ id: plan.categoryId, isActive: true }).lean() : null;

  if (!plan || !category) {
    return res.status(404).json({ message: "Plan not found." });
  }

  return res.json({
    plan: serializePlanDoc({
      ...plan,
      categoryTitle: category.title,
      categorySortOrder: category.sortOrder
    })
  });
}

export async function listPlansAdmin(_req, res) {
  const plans = await Plan.find().sort({ categorySortOrder: 1, planSortOrder: 1, monthlyPrice: 1 }).lean();
  return res.json({ plans: plans.map(serializePlanDoc) });
}

export async function createPlan(req, res) {
  const body = req.body;
  const name = String(body.name ?? "").trim();
  const monthlyPrice = Number(body.monthlyPrice);
  const downloadSpeedMbps = Number(body.downloadSpeedMbps);
  const categoryId = String(body.categoryId ?? "general").trim() || "general";
  const category = await PlanCategory.findOne({ id: categoryId }).lean();
  const categoryTitle = category?.title ?? (cleanTitle(body.categoryTitle ?? "Plans") || "Plans");
  const categorySortOrder = category?.sortOrder ?? Number(body.categorySortOrder);
  const planSortOrder = await Plan.countDocuments({ categoryId });
  const features = Array.isArray(body.features)
    ? body.features.map((feature) => String(feature).trim()).filter(Boolean)
    : [];

  if (!name) {
    return res.status(400).json({ message: "Plan name is required." });
  }

  if (!Number.isFinite(monthlyPrice) || monthlyPrice < 0) {
    return res.status(400).json({ message: "Monthly price must be a valid number." });
  }

  if (!Number.isFinite(downloadSpeedMbps) || downloadSpeedMbps < 1) {
    return res.status(400).json({ message: "Download speed must be at least 1 Mbps." });
  }

  const baseId = slugifyPlanId(body.id || name) || `plan_${Date.now()}`;
  let id = baseId;
  let suffix = 1;

  while (await Plan.exists({ id })) {
    suffix += 1;
    id = `${baseId}_${suffix}`;
  }

  const plan = await Plan.create({
    id,
    name,
    monthlyPrice,
    downloadSpeedMbps,
    features,
    categoryId,
    categoryTitle,
    categorySortOrder: Number.isFinite(categorySortOrder) ? categorySortOrder : 0,
    planSortOrder,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true
  });

  return res.status(201).json({
    plan: serializePlanDoc(plan)
  });
}

export async function updatePlan(req, res) {
  const plan = await Plan.findOne({ id: req.params.planId });

  if (!plan) {
    return res.status(404).json({ message: "Plan not found." });
  }

  const body = req.body;

  if (body.name !== undefined) {
    plan.name = body.name;
  }

  if (body.monthlyPrice !== undefined) {
    plan.monthlyPrice = body.monthlyPrice;
  }

  if (body.downloadSpeedMbps !== undefined) {
    plan.downloadSpeedMbps = body.downloadSpeedMbps;
  }

  if (body.features !== undefined) {
    plan.features = body.features;
  }

  if (body.categoryId !== undefined) {
    const categoryId = String(body.categoryId).trim() || plan.categoryId;
    const category = await PlanCategory.findOne({ id: categoryId }).lean();
    const movedCategory = categoryId !== plan.categoryId;
    plan.categoryId = categoryId;
    plan.categoryTitle = category?.title ?? plan.categoryTitle;
    plan.categorySortOrder = category?.sortOrder ?? plan.categorySortOrder;

    if (movedCategory) {
      plan.planSortOrder = await Plan.countDocuments({ categoryId });
    }
  }

  if (body.isActive !== undefined) {
    plan.isActive = body.isActive;
  }

  await plan.save();

  return res.json({
    plan: serializePlanDoc(plan)
  });
}

export async function deactivatePlan(req, res) {
  const plan = await Plan.findOneAndUpdate({ id: req.params.planId }, { $set: { isActive: false } }, { new: true });

  if (!plan) {
    return res.status(404).json({ message: "Plan not found." });
  }

  return res.json({
    message: "Plan deactivated.",
    plan: serializePlanDoc(plan)
  });
}
