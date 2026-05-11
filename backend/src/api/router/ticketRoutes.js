import * as ticketController from "../controller/ticketController.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";

export function registerTicketRoutes(router) {
  // Customer Routes
  router.post("/tickets", ticketController.createTicket);
  router.get("/tickets", ticketController.getMyTickets);
  router.get("/tickets/:id", ticketController.getTicketDetails);
  router.post("/tickets/:id/comments", ticketController.addComment);

  // Admin Routes
  router.get("/admin/tickets", requireAdmin, ticketController.getAdminTickets);
  router.patch(
    "/admin/tickets/:id/status",
    requireAdmin,
    ticketController.updateTicketStatus,
  );
}
