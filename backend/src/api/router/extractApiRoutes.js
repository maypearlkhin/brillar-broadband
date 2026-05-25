import * as extractApiController from "../controller/extractApiController.js";
import * as subscriptionController from "../controller/subscriptionController.js";
import * as appointmentController from "../controller/appointmentController.js";

export function registerExtractApiRoutes(router) {
  // ─── Public endpoints (no auth required) ───────────────────────────────────
  router.get(
    "/agent/announcements-impacts",
    extractApiController.getAllAnnouncementImpacts,
  );
  router.get(
    "/agent/resolved-histories",
    extractApiController.getAllResolvedHistories,
  );
  router.get("/agent/notices", extractApiController.getNotices);
  router.get("/agent/all-plans", extractApiController.getAllPlans);

  // ─── Token-protected: personal data ────────────────────────────────────────
  router.post("/agent/get-my-plan", extractApiController.getPlanById);
  router.post("/agent/my-order-history", extractApiController.getMyOrderHistory);

  // ─── Token-protected: consolidated account + invoices (canonical /me/subscription shape) ─
  router.post("/agent/my-account-billing", extractApiController.getAgentMyAccountBilling);
  router.post("/agent/billing-history", extractApiController.getAgentBillingHistory);

  // ─── Token-protected: plan management ──────────────────────────────────────
  // Buy a plan (creates a new subscription). Token required — userId is derived from token.
  router.post("/agent/buy-plan", subscriptionController.checkout);

  // Cancel the active plan (or a specific subscription by subscriptionId in body).
  // Token required — only affects the authenticated user's own subscription.
  router.post("/agent/cancel-plan", subscriptionController.cancelPlan);

  // ─── Token-protected: home installation scheduling ─────────────────────────
  // Get available appointment slots for the next 7 days (public-ish, but consistent with agent context).
  router.post("/agent/appointment-slots", appointmentController.getAvailableSlots);

  // Create a home installation appointment. Token required — role must be "customer".
  router.post("/agent/schedule-appointment", appointmentController.createAppointment);

  // List appointments for the authenticated user (customers see their own; admins/isp_team see all).
  router.post("/agent/my-appointments", appointmentController.listAppointments);
}
