import * as serviceZoneController from "../controller/serviceZoneController.js";

export function registerServiceZoneRoutes(router) {
  router.get("/service-zones", serviceZoneController.listServiceZones);
}
