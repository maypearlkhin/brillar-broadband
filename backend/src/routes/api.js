import bcrypt from "bcryptjs";
import { Router } from "express";
import {
  authCookieOptions,
  getTokenFromRequest,
  signJwt,
  verifyJwt
} from "../auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import Announcement from "../models/Announcement.js";
import NetworkIncident from "../models/NetworkIncident.js";
import Plan from "../models/Plan.js";
import ServiceZone from "../models/ServiceZone.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

export function createApiRouter() {
  const router = Router();

  router.get("/service-zones", async (_req, res) => {
    const zones = await ServiceZone.find().sort({ country: 1, postalCode: 1 }).lean();

    return res.json({
      zones: zones.map((z) => ({
        country: z.country,
        district: z.district,
        postalCode: z.postalCode
      }))
    });
  });

  router.get("/plans", async (_req, res) => {
    const plans = await Plan.find({ isActive: true })
      .sort({ categorySortOrder: 1, monthlyPrice: 1 })
      .lean();

    return res.json({
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        downloadSpeedMbps: plan.downloadSpeedMbps,
        features: plan.features,
        categoryId: plan.categoryId,
        categoryTitle: plan.categoryTitle,
        categorySortOrder: plan.categorySortOrder,
        isActive: plan.isActive
      }))
    });
  });

  router.get("/plans/:planId", async (req, res) => {
    const plan = await Plan.findOne({ id: req.params.planId, isActive: true }).lean();

    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    return res.json({
      plan: {
        id: plan.id,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        downloadSpeedMbps: plan.downloadSpeedMbps,
        features: plan.features,
        categoryId: plan.categoryId,
        categoryTitle: plan.categoryTitle,
        categorySortOrder: plan.categorySortOrder,
        isActive: plan.isActive
      }
    });
  });

  function serializePlanDoc(plan) {
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

  router.get("/admin/plans", requireAdmin, async (_req, res) => {
    const plans = await Plan.find().sort({ categorySortOrder: 1, monthlyPrice: 1 }).lean();
    return res.json({ plans: plans.map(serializePlanDoc) });
  });

  router.put("/plans/:planId", requireAdmin, async (req, res) => {
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
  });

  router.delete("/plans/:planId", requireAdmin, async (req, res) => {
    const plan = await Plan.findOneAndUpdate(
      { id: req.params.planId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    return res.json({
      message: "Plan deactivated.",
      plan: serializePlanDoc(plan)
    });
  });

  router.get("/network/status", async (_req, res) => {
    const incidents = await NetworkIncident.find().sort({ createdAt: -1 }).lean();

    return res.json({
      incidents: incidents.map((incident) => ({
        id: incident._id,
        country: incident.country,
        district: incident.district,
        postalCode: incident.postalCode,
        message: incident.message,
        createdAt: incident.createdAt,
        resolvedAt: incident.resolvedAt ?? null
      }))
    });
  });

  router.post("/network/status", requireAdmin, async (req, res) => {
    const { location, message } = req.body;

    if (!location?.country || !location?.district || !location?.postalCode) {
      return res.status(400).json({
        message: "location with country, district, and postalCode is required."
      });
    }

    if (!message?.trim()) {
      return res.status(400).json({ message: "Outage message is required." });
    }

    const allowed = await ServiceZone.findOne({
      country: location.country,
      district: location.district,
      postalCode: location.postalCode
    }).lean();

    if (!allowed) {
      return res.status(400).json({
        message: "Please choose one of Brillar Broadband's supported service zones."
      });
    }

    const incident = await NetworkIncident.create({
      country: location.country,
      district: location.district,
      postalCode: location.postalCode,
      message: message.trim()
    });

    return res.status(201).json({
      incident: {
        id: incident._id,
        country: incident.country,
        district: incident.district,
        postalCode: incident.postalCode,
        message: incident.message,
        createdAt: incident.createdAt
      }
    });
  });

  router.delete("/network/status/:id", requireAdmin, async (req, res) => {
    const incident = await NetworkIncident.findByIdAndUpdate(
      req.params.id,
      { $set: { resolvedAt: new Date() } },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ message: "Incident not found." });
    }

    return res.json({ message: "Incident cleared.", incident: { id: incident._id, resolvedAt: incident.resolvedAt } });
  });

  router.get("/announcements", async (_req, res) => {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      announcements: announcements.map((announcement) => ({
        id: announcement._id,
        message: announcement.message,
        createdAt: announcement.createdAt
      }))
    });
  });

  router.get("/admin/announcements", requireAdmin, async (_req, res) => {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();

    return res.json({
      announcements: announcements.map((announcement) => ({
        id: announcement._id,
        message: announcement.message,
        isActive: announcement.isActive,
        createdAt: announcement.createdAt
      }))
    });
  });

  router.post("/announcements", requireAdmin, async (req, res) => {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Announcement message is required." });
    }

    const announcement = await Announcement.create({
      message: message.trim(),
      isActive: true
    });

    return res.status(201).json({
      announcement: {
        id: announcement._id,
        message: announcement.message,
        createdAt: announcement.createdAt
      }
    });
  });

  router.delete("/announcements/:id", requireAdmin, async (req, res) => {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    return res.json({ message: "Announcement removed." });
  });

  router.post("/auth/register", async (req, res) => {
    try {
      const { name, email, password, serviceZone } = req.body;
      const fullName = typeof name === "string" ? name.trim() : "";

      if (!fullName || fullName.length < 2 || fullName.length > 80) {
        return res.status(400).json({
          message: "Please enter your full name (2–80 characters)."
        });
      }

      if (!email || !password || password.length < 6) {
        return res.status(400).json({
          message: "Email and a password of at least 6 characters are required."
        });
      }

      if (!serviceZone?.country || !serviceZone?.district || !serviceZone?.postalCode) {
        return res.status(400).json({
          message: "A valid service zone must be selected."
        });
      }

      const allowed = await ServiceZone.findOne({
        country: serviceZone.country,
        district: serviceZone.district,
        postalCode: serviceZone.postalCode
      }).lean();

      if (!allowed) {
        return res.status(400).json({
          message: "Please choose one of Brillar Broadband's supported service zones."
        });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        return res.status(409).json({
          message: "An account already exists for this email."
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: fullName,
        email,
        passwordHash,
        serviceZone: {
          country: serviceZone.country,
          district: serviceZone.district,
          postalCode: serviceZone.postalCode
        },
        role: "customer"
      });

      return res.json({
        message: "Account created. Please log in to continue.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          serviceZone: user.serviceZone
        }
      });
    } catch (error) {
      console.error("Register error", error);
      return res.status(500).json({ message: "Unable to register right now." });
    }
  });

  router.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required."
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const token = signJwt({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name || ""
      });

      const opts = authCookieOptions();
      const { name: cookieName, ...cookieOpts } = opts;
      res.cookie(cookieName, token, cookieOpts);

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name || "",
          email: user.email,
          role: user.role,
          serviceZone: user.serviceZone
        }
      });
    } catch (error) {
      console.error("Login error", error);
      return res.status(500).json({ message: "Unable to log in right now." });
    }
  });

  router.post("/auth/logout", (_req, res) => {
    const opts = authCookieOptions();
    const { name: cookieName, path } = opts;
    res.clearCookie(cookieName, { path });
    return res.json({ message: "Logged out." });
  });

  router.post("/checkout", async (req, res) => {
    try {
      const token = getTokenFromRequest(req);
      const currentUser = token ? verifyJwt(token) : null;

      if (!currentUser) {
        return res.status(401).json({ message: "Authentication required." });
      }

      const { planId } = req.body;

      if (!planId) {
        return res.status(400).json({ message: "planId is required." });
      }

      const plan = await Plan.findOne({ id: planId, isActive: true });

      if (!plan) {
        return res.status(404).json({ message: "Plan not found." });
      }

      const subscription = await Subscription.create({
        userId: currentUser.userId,
        planId: plan._id,
        status: "Installation Pending"
      });

      return res.status(201).json({
        message: "Purchase complete. Your subscription is Installation Pending.",
        subscription: {
          id: subscription._id,
          status: subscription.status,
          planId: plan.id,
          userId: currentUser.userId,
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
  });

  router.get("/me/subscription", async (req, res) => {
    const token = getTokenFromRequest(req);
    const currentUser = token ? verifyJwt(token) : null;

    if (!currentUser) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const [user, subscriptions] = await Promise.all([
      User.findById(currentUser.userId).lean(),
      Subscription.find({ userId: currentUser.userId })
        .sort({ createdAt: -1 })
        .populate("planId")
        .lean()
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
        createdAt: sub.createdAt
      };
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
  });

  router.get("/admin/subscriptions", requireAdmin, async (_req, res) => {
    const subscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .populate("userId")
      .populate("planId")
      .lean();

    return res.json({ subscriptions });
  });

  router.patch("/admin/subscriptions", requireAdmin, async (req, res) => {
    const { subscriptionId, action } = req.body;

    if (!subscriptionId || !["approve", "reject"].includes(action ?? "")) {
      return res.status(400).json({
        message: "subscriptionId and a valid action are required."
      });
    }

    const status = action === "approve" ? "Installation Approved" : "Rejected";
    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { status },
      { new: true }
    );

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
  });

  return router;
}
