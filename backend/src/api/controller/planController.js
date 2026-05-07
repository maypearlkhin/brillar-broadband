import Plan from "../../models/planModel.js";

export function serializePlanDoc(plan) {
  return {
    id: plan.id,
    name: plan.name,
    monthlyPrice: plan.monthlyPrice,
    downloadSpeedMbps: plan.downloadSpeedMbps,
    features: plan.features,
    categoryId: plan.categoryId,
    categoryTitle: plan.categoryTitle,
    categorySortOrder: plan.categorySortOrder,
    isActive: plan.isActive
  };
}

export async function listActivePlans(_req, res) {
  const plans = await Plan.find({ isActive: true })
    .sort({ categorySortOrder: 1, monthlyPrice: 1 })
    .lean();

  return res.json({
    plans: plans.map(serializePlanDoc)
  });
}

export async function getPlanById(req, res) {
  const plan = await Plan.findOne({ id: req.params.planId, isActive: true }).lean();

  if (!plan) {
    return res.status(404).json({ message: "Plan not found." });
  }

  return res.json({ plan: serializePlanDoc(plan) });
}

export async function listPlansAdmin(_req, res) {
  const plans = await Plan.find().sort({ categorySortOrder: 1, monthlyPrice: 1 }).lean();
  return res.json({ plans: plans.map(serializePlanDoc) });
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
    plan.categoryId = String(body.categoryId).trim() || plan.categoryId;
  }

  if (body.categoryTitle !== undefined) {
    plan.categoryTitle = String(body.categoryTitle).trim() || plan.categoryTitle;
  }

  if (body.categorySortOrder !== undefined) {
    const n = Number(body.categorySortOrder);
    plan.categorySortOrder = Number.isFinite(n) ? n : plan.categorySortOrder;
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
