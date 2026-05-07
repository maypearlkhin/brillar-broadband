import { requireAdmin } from "../../middleware/requireAdmin.js";
import * as announcementController from "../controller/announcementController.js";

export function registerAnnouncementRoutes(router) {
  router.get("/announcements", announcementController.listAnnouncementsPublic);
  router.get("/admin/announcements", requireAdmin, announcementController.listAnnouncementsAdmin);
  router.post("/announcements", requireAdmin, announcementController.createAnnouncement);
  router.delete("/announcements/:id", requireAdmin, announcementController.deactivateAnnouncement);
}
