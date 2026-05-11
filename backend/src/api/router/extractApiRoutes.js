import * as extractApiController from "../controller/extractApiController.js";


export function registerExtractApiRoutes(router) {
  // Public endpoints (no middleware)
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

  // Token-protected endpoints
  router.get("/agent/get-my-plan", extractApiController.getPlanById);
  router.get("/agent/my-order-history", extractApiController.getMyOrderHistory);
}
