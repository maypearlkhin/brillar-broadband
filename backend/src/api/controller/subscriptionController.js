import { getTokenFromRequest, verifyJwt } from "../../auth.js";
import NetworkIncident from "../../models/networkIncidentModel.js";
import Plan from "../../models/planModel.js";
import Subscription from "../../models/subscriptionModel.js";
import User from "../../models/userModel.js";
import mongoose from "mongoose";

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

    if (!currentUser) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const { planId, billingTerm, amount } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "planId is required." });
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

    const normalizedTerm = normalizeBillingTerm(String(billingTerm ?? ""));
    const paidAmount = Number(amount ?? 0);
    const purchasedAt = new Date();
    const startDate = addDays(purchasedAt, 3);
    const endDate = addDays(startDate, Number(normalizedTerm));

    const subscription = await Subscription.create({
      userId: currentUser.userId,
      planId: plan._id,
      status: "Installation Pending",
      billingTerm: normalizedTerm,
      amount: Number.isFinite(paidAmount) ? paidAmount : 0,
      startDate,
      endDate
    });

    return res.status(201).json({
      message: "Purchase complete. Your subscription is Installation Pending.",
      subscription: {
        id: subscription._id,
        status: subscription.status,
        planId: plan.id,
        userId: currentUser.userId,
        billingTerm: subscription.billingTerm,
        amount: subscription.amount,
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
    billingTerm: sub.billingTerm ?? "30",
    amount: sub.amount ?? 0,
    startDate: sub.startDate ?? null,
    endDate: sub.endDate ?? null,
    createdAt: sub.createdAt
  };
}

export async function getMySubscription(req, res) {
  const token = getTokenFromRequest(req);
  const currentUser = token ? verifyJwt(token) : null;

  if (!currentUser) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const [user, subscriptions] = await Promise.all([
    User.findById(currentUser.userId).lean(),
    Subscription.find({ userId: currentUser.userId }).sort({ createdAt: -1 }).populate("planId").lean()
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

  return res.json({
    user: user
      ? {
          id: user._id,
          email: user.email,
          role: user.role,
          serviceZone: user.serviceZone
        }
      : null,
    subscription: subscriptions[0] ? serializeSubscription(subscriptions[0]) : null,
    subscriptions: subscriptions.map(serializeSubscription),
    activeOutage
  });
}

export async function listSubscriptionsAdmin(_req, res) {
  const subscriptions = await Subscription.find()
    .sort({ createdAt: -1 })
    .populate("userId")
    .populate("planId")
    .lean();

  return res.json({ subscriptions });
}

export async function patchSubscriptionAdmin(req, res) {
  const { subscriptionId, action } = req.body;

  if (!subscriptionId || !["approve", "reject"].includes(action ?? "")) {
    return res.status(400).json({
      message: "subscriptionId and a valid action are required."
    });
  }

  const status = action === "approve" ? "Installation Approved" : "Rejected";
  const subscription = await Subscription.findByIdAndUpdate(subscriptionId, { status }, { new: true });

  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found." });
  }

  return res.json({
    message: `Subscription ${action === "approve" ? "approved" : "rejected"}.`,
    subscription: {
      id: subscription._id,
      status: subscription.status
    }
  });
}

export async function cancelPlan(req, res) {
  try {
    const token = getTokenFromRequest(req);
    const currentUser = token ? verifyJwt(token) : null;

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
