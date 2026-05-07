import { requireAdmin } from "../../middleware/requireAdmin.js";
import * as subscriptionController from "../controller/subscriptionController.js";

export function registerSubscriptionRoutes(router) {
  router.post("/checkout", subscriptionController.checkout);
  router.get("/me/subscription", subscriptionController.getMySubscription);
  router.get("/admin/subscriptions", requireAdmin, subscriptionController.listSubscriptionsAdmin);
  router.patch("/admin/subscriptions", requireAdmin, subscriptionController.patchSubscriptionAdmin);
}
