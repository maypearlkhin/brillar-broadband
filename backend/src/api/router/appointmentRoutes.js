import * as appointmentController from "../controller/appointmentController.js";

export function registerAppointmentRoutes(router) {
  // Public-ish: available slots (anyone logged in can see)
  router.get("/appointments/slots", appointmentController.getAvailableSlots);

  // Customer: create appointment
  router.post("/appointments", appointmentController.createAppointment);

  // All authenticated roles: list appointments (filtered server-side by role)
  router.get("/appointments", appointmentController.listAppointments);

  // ISP team + admin: update status
  router.patch("/appointments/:id/status", appointmentController.updateAppointmentStatus);
}
