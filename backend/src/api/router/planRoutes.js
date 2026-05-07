import { requireAdmin } from "../../middleware/requireAdmin.js";
import * as planController from "../controller/planController.js";

/** Public catalogue and admin CRUD backed by `models/planModel.js`. */
export function registerPlanRoutes(router) {
  router.get("/plans", planController.listActivePlans);
  router.get("/plans/:planId", planController.getPlanById);
  router.get("/admin/plans", requireAdmin, planController.listPlansAdmin);
  router.put("/plans/:planId", requireAdmin, planController.updatePlan);
  router.delete("/plans/:planId", requireAdmin, planController.deactivatePlan);
}
