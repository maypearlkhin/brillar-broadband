import { Router } from "express";
import { registerAnnouncementRoutes } from "./announcementRoutes.js";
import { registerExtractApiRoutes } from "./extractApiRoutes.js";
import { registerAppointmentRoutes } from "./appointmentRoutes.js";
import { registerUserManagementRoutes } from "./userManagementRoutes.js";
import { registerIntegrationRoutes } from "./integrationRoutes.js";
import { registerNetworkRoutes } from "./networkRoutes.js";
import { registerPlanCategoryRoutes } from "./planCategoryRoutes.js";
import { registerPlanRoutes } from "./planRoutes.js";
import { registerServiceZoneRoutes } from "./serviceZoneRoutes.js";
import { registerSubscriptionRoutes } from "./subscriptionRoutes.js";
import { registerTicketRoutes } from "./ticketRoutes.js";
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
  registerTicketRoutes(router);
  registerAppointmentRoutes(router);
  registerUserManagementRoutes(router);

  // Auto-create ISP team seed user
  router.post("/debug/create-isp-team", async (req, res) => {
    try {
      const User = (await import("../../models/userModel.js")).default;
      const bcrypt = (await import("bcryptjs")).default;
      await User.deleteOne({ email: "isp@brillar.com" });
      const passwordHash = await bcrypt.hash("password123", 10);
      const ispUser = await User.create({
        email: "isp@brillar.com",
        passwordHash,
        role: "isp_team",
        name: "Brillar ISP Team",
      });
      res.json({
        message: "ISP team user created",
        user: { email: ispUser.email, role: ispUser.role, name: ispUser.name },
        login: { email: "isp@brillar.com", password: "password123" },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Auto-create admin user endpoint
  router.post("/debug/create-admin", async (req, res) => {
    try {
      const User = (await import("../../models/userModel.js")).default;
      const bcrypt = (await import("bcryptjs")).default;
      
      // Delete existing admin user if exists
      await User.deleteOne({ email: "admin@brillar.com" });
      
      // Create new admin user with known password
      const passwordHash = await bcrypt.hash("password123", 10);
      const adminUser = await User.create({
        email: "admin@brillar.com",
        passwordHash,
        role: "admin",
        name: "Brillar Admin",
        serviceZone: {
          country: "Singapore",
          district: "Jurong East",
          postalCode: "609606"
        }
      });
      
      res.json({ 
        message: "Admin user created successfully",
        user: {
          email: adminUser.email,
          role: adminUser.role,
          name: adminUser.name
        },
        login: {
          email: "admin@brillar.com",
          password: "password123"
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
