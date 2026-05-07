import * as integrationController from "../controller/integrationController.js";

export function registerIntegrationRoutes(router) {
  router.get("/admin/integration", integrationController.getIntegration);
  router.post("/integration", integrationController.createIntegration);
  router.delete("/integration/:id", integrationController.removeIntegration);
}
