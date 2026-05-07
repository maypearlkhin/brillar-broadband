import { requireAdmin } from "../../middleware/requireAdmin.js";
import * as networkController from "../controller/networkController.js";

export function registerNetworkRoutes(router) {
  router.get("/network/status", networkController.listNetworkStatus);
  router.post("/network/status", requireAdmin, networkController.createNetworkIncident);
  router.delete("/network/status/:id", requireAdmin, networkController.resolveNetworkIncident);
}
