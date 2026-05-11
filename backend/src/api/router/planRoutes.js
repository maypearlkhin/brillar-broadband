import * as planController from "../controller/planController.js";

/** Public catalogue and admin CRUD backed by `models/planModel.js`. */
export function registerPlanRoutes(router) {
  router.get("/plans", planController.listActivePlans);
  router.get("/plans/:planId", planController.getPlanById);
  router.get("/admin/plans", planController.listPlansAdmin);
  router.post("/plans", planController.createPlan);
  router.put("/plans/:planId", planController.updatePlan);
  router.delete("/plans/:planId", planController.deletePlan);
}
