import { getTokenFromRequest, verifyJwt } from "../../auth.js";
import { getMySubscriptionPayload } from "./subscriptionController.js";
import Announcement from "../../models/announcementModel.js";
import NetworkIncident from "../../models/networkIncidentModel.js";
import Plan from "../../models/planModel.js";
import Subscription from "../../models/subscriptionModel.js";

function serializePlan(plan) {
  if (!plan) {
    return null;
  }

  return {
    id: plan.id,
    name: plan.name,
    monthlyPrice: plan.monthlyPrice,
    downloadSpeedMbps: plan.downloadSpeedMbps,
    price90Days: plan.price90Days ?? 0,
    price180Days: plan.price180Days ?? 0,
    price365Days: plan.price365Days ?? 0,
    features: plan.features ?? [],
    categoryId: plan.categoryId,
    categoryTitle: plan.categoryTitle,
    categorySortOrder: plan.categorySortOrder,
    planSortOrder: plan.planSortOrder,
    isActive: plan.isActive,
  };
}

function serializeSubscription(subscription) {
  const planDoc = subscription.planId;
  const billingTerm = subscription.billingTerm ?? "30";

  let currentTermPrice = planDoc?.monthlyPrice ?? 0;
  if (billingTerm === "90")
    currentTermPrice = planDoc?.price90Days || planDoc?.monthlyPrice * 3 || 0;
  else if (billingTerm === "180")
    currentTermPrice = planDoc?.price180Days || planDoc?.monthlyPrice * 6 || 0;
  else if (billingTerm === "365")
    currentTermPrice = planDoc?.price365Days || planDoc?.monthlyPrice * 12 || 0;

  const purchasedPrice = subscription.amount ?? 0;
  const hasPriceChanged = purchasedPrice !== currentTermPrice;

  return {
    id: subscription._id,
    userId: subscription.userId?._id ?? subscription.userId,
    status: subscription.status,
    planStatus: subscription.planStatus ?? "active",
    billingTerm,
    amount: purchasedPrice,
    purchasedPrice,
    currentTermPrice,
    hasPriceChanged,
    startDate: subscription.startDate ?? null,
    endDate: subscription.endDate ?? null,
    createdAt: subscription.createdAt,
    plan: serializePlan(planDoc),
  };
}

function getCurrentUser(req) {
  const token = getTokenFromRequest(req);
  return token ? verifyJwt(token) : null;
}

export async function getAllAnnouncementImpacts(_req, res) {
  const impacts = await NetworkIncident.find({ resolvedAt: null })
    .sort({ createdAt: -1 })
    .lean();
  const resolvedImpacts = await NetworkIncident.find({
    resolvedAt: { $ne: null },
  })
    .sort({ createdAt: -1 })
    .lean();
  const activeImpacts = impacts.map((impact) => ({
    id: impact._id,
    country: impact.country,
    district: impact.district,
    postalCode: impact.postalCode,
    message: impact.message,
    createdAt: impact.createdAt,
    resolvedAt: impact.resolvedAt ?? null,
  }));

  const resolvedImpactsList = resolvedImpacts.map((impact) => ({
    id: impact._id,
    country: impact.country,
    district: impact.district,
    postalCode: impact.postalCode,
    message: impact.message,
    createdAt: impact.createdAt,
    resolvedAt: impact.resolvedAt ?? null,
  }));

  return res.json({
    success: true,
    data: {
      activeImpacts,
      resolvedImpacts: resolvedImpactsList,
    },
  });
}

export async function getAllResolvedHistories(_req, res) {
  const resolved = await NetworkIncident.find({ resolvedAt: { $ne: null } })
    .sort({ resolvedAt: -1, createdAt: -1 })
    .lean();

  return res.json({
    success: true,
    data: resolved.map((incident) => ({
      id: incident._id,
      country: incident.country,
      district: incident.district,
      postalCode: incident.postalCode,
      message: incident.message,
      createdAt: incident.createdAt,
      resolvedAt: incident.resolvedAt,
    })),
  });
}

export async function getNotices(_req, res) {
  const announcements = await Announcement.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    success: true,
    data: announcements.map((announcement) => ({
      id: announcement._id,
      message: announcement.message,
      createdAt: announcement.createdAt,
    })),
  });
}

export async function getAllPlans(_req, res) {
  const plans = await Plan.find({ isActive: true })
    .sort({ categorySortOrder: 1, planSortOrder: 1, monthlyPrice: 1 })
    .lean();

  return res.json({
    success: true,
    data: plans.map(serializePlan),
  });
}

export async function getPlanById(req, res) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  const userId = currentUser?.userId;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "userId is required in request body." });
  }

  const subscription = await Subscription.findOne({ userId })
    .sort({ createdAt: -1 })
    .populate("planId")
    .lean();

  return res.json({
    success: true,
    data: subscription ? serializeSubscription(subscription) : null,
  });
}

export async function getMyOrderHistory(req, res) {
  const currentUser = getCurrentUser(req);

  if (!currentUser) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  const subscriptions = await Subscription.find({ userId: currentUser.userId })
    .sort({ createdAt: -1 })
    .populate("planId")
    .lean();

  return res.json({
    success: true,
    data: subscriptions.map(serializeSubscription),
  });
}

/**
 * Agent-compatible bundle: profile, current/latest subscription row, all subscription rows,
 * invoices (paidAt, invoice numbers), and optional area outage — same semantics as GET /api/me/subscription
 * wrapped in { success, data }.
 */
export async function getAgentMyAccountBilling(req, res) {
  const currentUser = getCurrentUser(req);

  if (!currentUser) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  try {
    const data = await getMySubscriptionPayload(currentUser.userId);
    const latest = data.invoices?.[0] ?? null;

    return res.json({
      success: true,
      data: {
        ...data,
        billingSummary: {
          latestPaidAt: latest?.paidAt ?? null,
          latestInvoiceNumber: latest?.invoiceNumber ?? null,
          latestInvoiceAmount: typeof latest?.amount === "number" ? latest.amount : null,
          latestInvoiceCurrency: latest?.currency ?? null,
          invoiceRowCount: data.invoices?.length ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("getAgentMyAccountBilling", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load account and billing.",
    });
  }
}

/** Invoices plus full subscription/order rows (canonical app shape) for receipts and timelines. */
export async function getAgentBillingHistory(req, res) {
  const currentUser = getCurrentUser(req);

  if (!currentUser) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  try {
    const payload = await getMySubscriptionPayload(currentUser.userId);
    return res.json({
      success: true,
      data: {
        invoices: payload.invoices,
        subscriptions: payload.subscriptions,
      },
    });
  } catch (error) {
    console.error("getAgentBillingHistory", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load billing history.",
    });
  }
}
