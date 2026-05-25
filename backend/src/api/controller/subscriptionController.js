import crypto from "crypto";
import { getTokenFromRequest, verifyJwt } from "../../auth.js";
import Invoice from "../../models/invoiceModel.js";
import NetworkIncident from "../../models/networkIncidentModel.js";
import Plan from "../../models/planModel.js";
import Subscription from "../../models/subscriptionModel.js";
import User from "../../models/userModel.js";
import mongoose from "mongoose";

function generateInvoiceNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `BR-INV-${y}${m}${day}-${suffix}`;
}

function normalizeBillingTerm(term) {
  return term === "90" || term === "180" || term === "365" ? term : "30";
}

function addDays(from, days) {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date;
}

export async function checkout(req, res) {
  try {
    const token = getTokenFromRequest(req);
    const currentUser = token ? verifyJwt(token) : null;
    const uId = req.body.userId;

    if (!currentUser) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const { planId, billingTerm, amount } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "planId is required." });
    }

    // ── One active plan per user ──────────────────────────────────
    const activeSub = await Subscription.findOne({
      userId: currentUser.userId,
      status: { $in: ["Pending", "Scheduled", "Installed", "Active", "Blocked"] }
    });

    if (activeSub) {
      return res.status(409).json({
        message: "You already have an active plan. Please cancel your current plan before purchasing a new one.",
        existingSubscription: {
          id: activeSub._id,
          status: activeSub.status
        }
      });
    }

    const normalizedPlanId = String(planId).trim();
    const match = [{ id: normalizedPlanId }];

    if (mongoose.Types.ObjectId.isValid(normalizedPlanId)) {
      match.push({ _id: normalizedPlanId });
    }

    const plan = await Plan.findOne({
      isActive: true,
      $or: match
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    const userDoc = await User.findById(currentUser.userId).select("name email").lean();
    if (!userDoc) {
      return res.status(404).json({ message: "User not found." });
    }

    // ── Check for existing router from previous subscription ─────
    // If the customer already had a router installed (renew/upgrade/downgrade),
    // skip the installation flow entirely → status starts at "Installed"
    // so admin can directly activate WiFi access.
    const previousWithRouter = await Subscription.findOne({
      userId: currentUser.userId,
      routerId: { $ne: null, $exists: true },
      status: { $in: ["Cancelled", "Rejected", "Active", "Blocked"] }
    }).sort({ createdAt: -1 });

    const hasExistingRouter = Boolean(previousWithRouter?.routerId);

    const normalizedTerm = normalizeBillingTerm(String(billingTerm ?? ""));
    const paidAmount = Number(amount ?? 0);
    const purchasedAt = new Date();
    /** Service credit runs from installation completion (set when ISP completes install). Renewals with existing router start immediately. */
    const termDays = Number(normalizedTerm);
    const startDate = hasExistingRouter ? purchasedAt : null;
    const endDate = hasExistingRouter ? addDays(purchasedAt, termDays) : null;

    const subscription = await Subscription.create({
      userId: currentUser.userId,
      planId: plan._id,
      status: hasExistingRouter ? "Installed" : "Pending",
      planStatus: "active",
      billingTerm: normalizedTerm,
      amount: Number.isFinite(paidAmount) ? paidAmount : 0,
      startDate,
      endDate,
      // Carry over the router ID from the previous subscription
      routerId: hasExistingRouter ? previousWithRouter.routerId : null,
      installedAt: hasExistingRouter ? purchasedAt : null
    });

    const billingTermDays = Number(normalizedTerm);
    const recordedAmount = Number.isFinite(paidAmount) ? paidAmount : 0;

    let invoiceDoc;
    try {
      invoiceDoc = await Invoice.create({
        invoiceNumber: generateInvoiceNumber(),
        userId: currentUser.userId,
        subscriptionId: subscription._id,
        amount: recordedAmount,
        currency: "SGD",
        billingTermDays,
        paidAt: purchasedAt,
        planName: plan.name,
        planDownloadSpeedMbps: plan.downloadSpeedMbps,
        customerName: userDoc.name ?? "",
        customerEmail: userDoc.email ?? ""
      });
    } catch (invoiceErr) {
      console.error("Invoice record failed after checkout", invoiceErr);
      await Subscription.deleteOne({ _id: subscription._id });
      return res.status(500).json({ message: "Unable to finalize billing record. Please try again." });
    }

    const isRenewal = hasExistingRouter;

    return res.status(201).json({
      message: isRenewal
        ? "Plan purchased. Router already installed — awaiting admin activation."
        : "Purchase complete. Please schedule your installation appointment.",
      isRenewal,
      routerCarriedOver: isRenewal ? previousWithRouter.routerId : null,
      invoice: {
        id: invoiceDoc._id.toString(),
        invoiceNumber: invoiceDoc.invoiceNumber,
        paidAt: invoiceDoc.paidAt.toISOString(),
        billingTermDays: invoiceDoc.billingTermDays,
        amount: invoiceDoc.amount,
        currency: invoiceDoc.currency
      },
      subscription: {
        id: subscription._id,
        status: subscription.status,
        planId: plan.id,
        userId: currentUser.userId,
        billingTerm: subscription.billingTerm,
        amount: subscription.amount,
        routerId: subscription.routerId,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        createdAt:
          subscription.createdAt instanceof Date
            ? subscription.createdAt.toISOString()
            : new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Checkout error", error);
    return res.status(500).json({ message: "Unable to complete checkout." });
  }
}

function serializeSubscription(sub) {
  if (!sub) {
    return null;
  }

  const plan = sub.planId;

  return {
    _id: sub._id,
    userId: sub.userId,
    planId: plan,
    status: sub.status,
    planStatus: sub.planStatus ?? "active",
    billingTerm: sub.billingTerm ?? "30",
    amount: sub.amount ?? 0,
    startDate: sub.startDate ?? null,
    endDate: sub.endDate ?? null,
    routerId: sub.routerId ?? null,
    installationAppointmentId: sub.installationAppointmentId ?? null,
    installedAt: sub.installedAt ?? null,
    activatedAt: sub.activatedAt ?? null,
    blockedAt: sub.blockedAt ?? null,
    createdAt: sub.createdAt
  };
}

/** Core payload shared by GET /api/me/subscription and agent billing wrappers (same shape). */
export async function getMySubscriptionPayload(userId) {
  const [user, subscriptions, invoices] = await Promise.all([
    User.findById(userId).lean(),
    Subscription.find({ userId })
      .sort({ createdAt: -1 })
      .populate("planId")
      .populate("installationAppointmentId")
      .lean(),
    Invoice.find({ userId }).sort({ paidAt: -1 }).lean()
  ]);

  let activeOutage = null;

  if (user?.serviceZone) {
    const incident = await NetworkIncident.findOne({
      country: user.serviceZone.country,
      district: user.serviceZone.district,
      postalCode: user.serviceZone.postalCode,
      resolvedAt: null
    })
      .sort({ createdAt: -1 })
      .lean();

    if (incident) {
      activeOutage = {
        id: incident._id.toString(),
        message: incident.message,
        location: {
          country: incident.country,
          district: incident.district,
          postalCode: incident.postalCode
        },
        createdAt: incident.createdAt
      };
    }
  }

  const serializedInvoices = invoices.map((inv) => ({
    id: inv._id.toString(),
    invoiceNumber: inv.invoiceNumber,
    subscriptionId: inv.subscriptionId.toString(),
    paidAt: inv.paidAt instanceof Date ? inv.paidAt.toISOString() : inv.paidAt,
    amount: inv.amount ?? 0,
    currency: inv.currency ?? "SGD",
    billingTermDays: inv.billingTermDays,
    planName: inv.planName,
    planDownloadSpeedMbps: inv.planDownloadSpeedMbps,
    customerName: inv.customerName ?? ""
  }));

  return {
    user: user
      ? {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone || "",
          role: user.role,
          serviceZone: user.serviceZone
        }
      : null,
    subscription: subscriptions[0] ? serializeSubscription(subscriptions[0]) : null,
    subscriptions: subscriptions.map(serializeSubscription),
    invoices: serializedInvoices,
    activeOutage
  };
}

export async function getMySubscription(req, res) {
  const token = getTokenFromRequest(req);
  const currentUser = token ? verifyJwt(token) : null;

  if (!currentUser) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const payload = await getMySubscriptionPayload(currentUser.userId);
  return res.json(payload);
}

export async function listSubscriptionsAdmin(_req, res) {
  const subscriptions = await Subscription.find()
    .sort({ createdAt: -1 })
    .populate("userId")
    .populate("planId")
    .populate("installationAppointmentId")
    .lean();

  return res.json({ subscriptions });
}

export async function patchSubscriptionAdmin(req, res) {
  const { subscriptionId, action } = req.body;

  const validActions = ["activate", "block", "unblock", "reject", "cancel"];
  if (!subscriptionId || !validActions.includes(action ?? "")) {
    return res.status(400).json({
      message: "subscriptionId and a valid action (activate, block, unblock, reject, cancel) are required."
    });
  }

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found." });
  }

  const now = new Date();

  if (action === "activate") {
    if (subscription.status !== "Installed") {
      return res.status(400).json({
        message: "Cannot activate WiFi access. Installation must be completed first."
      });
    }
    subscription.status = "Active";
    subscription.activatedAt = now;
  } else if (action === "block") {
    if (subscription.status !== "Active") {
      return res.status(400).json({
        message: "Can only block an active subscription."
      });
    }
    subscription.status = "Blocked";
    subscription.blockedAt = now;
  } else if (action === "unblock") {
    if (subscription.status !== "Blocked") {
      return res.status(400).json({
        message: "Can only unblock a blocked subscription."
      });
    }
    subscription.status = "Active";
    subscription.blockedAt = null;
  } else if (action === "reject") {
    if (subscription.status !== "Pending") {
      return res.status(400).json({
        message: "Can only reject a pending subscription."
      });
    }
    subscription.status = "Rejected";
  } else if (action === "cancel") {
    if (["Cancelled", "Rejected"].includes(subscription.status)) {
      return res.status(400).json({
        message: "Subscription is already cancelled or rejected."
      });
    }
    subscription.status = "Cancelled";
    subscription.planStatus = "cancelled";
    subscription.endDate = now;
  }

  await subscription.save();

  return res.json({
    message: `Subscription ${action} successful.`,
    subscription: {
      id: subscription._id,
      status: subscription.status,
      planStatus: subscription.planStatus,
      routerId: subscription.routerId,
      activatedAt: subscription.activatedAt,
      blockedAt: subscription.blockedAt
    }
  });
}

export async function listInvoicesAdmin(_req, res) {
  const invoices = await Invoice.find()
    .sort({ paidAt: -1 })
    .populate("userId", "name email phone")
    .populate({
      path: "subscriptionId",
      populate: { path: "planId", select: "name downloadSpeedMbps monthlyPrice id" },
    })
    .lean();

  const rows = invoices.map((inv) => {
    const user = inv.userId;
    const sub = inv.subscriptionId;

    return {
      id: inv._id.toString(),
      invoiceNumber: inv.invoiceNumber,
      paidAt: inv.paidAt instanceof Date ? inv.paidAt.toISOString() : inv.paidAt,
      amount: inv.amount ?? 0,
      currency: inv.currency ?? "SGD",
      billingTermDays: inv.billingTermDays,
      planName: inv.planName,
      planDownloadSpeedMbps: inv.planDownloadSpeedMbps,
      customerName:
        typeof user === "object" && user?.name ? user.name : inv.customerName ?? "",
      customerEmail:
        typeof user === "object" && user?.email ? user.email : inv.customerEmail ?? "",
      customerPhone: typeof user === "object" && user?.phone ? user.phone ?? "" : "",
      subscriptionId:
        sub && typeof sub === "object" && sub._id ? sub._id.toString() : String(inv.subscriptionId),
      subscriptionStatus: sub && typeof sub === "object" ? sub.status : null,
      serviceStart:
        sub && typeof sub === "object" && sub.startDate
          ? sub.startDate instanceof Date
            ? sub.startDate.toISOString()
            : sub.startDate
          : null,
      serviceEnd:
        sub && typeof sub === "object" && sub.endDate
          ? sub.endDate instanceof Date
            ? sub.endDate.toISOString()
            : sub.endDate
          : null,
    };
  });

  return res.json({ invoices: rows });
}

export async function cancelPlan(req, res) {
  try {
    const token = getTokenFromRequest(req);
    const currentUser = token ? verifyJwt(token) : null;
    const uId = req.body.userId;

    if (!currentUser) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const { subscriptionId } = req.body;
    const query = { userId: currentUser.userId };

    if (subscriptionId) {
      query._id = subscriptionId;
    } else {
      query.status = { $nin: ["Cancelled", "Rejected"] };
      query.planStatus = { $ne: "cancelled" };
    }

    const subscription = await Subscription.findOne(query).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found to cancel." });
    }

    subscription.status = "Cancelled";
    subscription.planStatus = "cancelled";
    subscription.endDate = new Date(); // Effectively ending today
    
    await subscription.save();

    return res.json({
      message: "Subscription successfully cancelled.",
      subscription: serializeSubscription(subscription)
    });
  } catch (error) {
    console.error("Cancel plan error", error);
    return res.status(500).json({ message: "Unable to cancel plan." });
  }
}
