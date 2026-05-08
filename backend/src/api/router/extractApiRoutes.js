import * as extractApiController from "../controller/extractApiController.js";

export function registerExtractApiRoutes(router) {
  // Public endpoints (no middleware)
  router.get("/extract/announcements-impacts", extractApiController.getAllAnnouncementImpacts);
  router.get("/extract/resolved-histories", extractApiController.getAllResolvedHistories);
  router.get("/extract/notices", extractApiController.getNotices);
  router.get("/extract/all-plans", extractApiController.getAllPlans);

  // Token-protected endpoints
  router.post("/extract/getmyplan", extractApiController.postGetMyPlan);
  router.get("/extract/my-order-history", extractApiController.getMyOrderHistory);
}

