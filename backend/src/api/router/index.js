import { Router } from "express";
import { registerAnnouncementRoutes } from "./announcementRoutes.js";
import { registerExtractApiRoutes } from "./extractApiRoutes.js";

import { registerIntegrationRoutes } from "./integrationRoutes.js";
import { registerNetworkRoutes } from "./networkRoutes.js";
import { registerPlanCategoryRoutes } from "./planCategoryRoutes.js";
import { registerPlanRoutes } from "./planRoutes.js";
import { registerServiceZoneRoutes } from "./serviceZoneRoutes.js";
import { registerSubscriptionRoutes } from "./subscriptionRoutes.js";
import { registerUserAuthRoutes } from "./userRoutes.js";

export function createApiRouter() {
  const router = Router();

  registerServiceZoneRoutes(router);
  registerPlanCategoryRoutes(router);
  registerPlanRoutes(router);
  registerIntegrationRoutes(router);
  registerNetworkRoutes(router);
  registerAnnouncementRoutes(router);
  registerExtractApiRoutes(router);
  registerUserAuthRoutes(router);
  registerSubscriptionRoutes(router);


  return router;
}
