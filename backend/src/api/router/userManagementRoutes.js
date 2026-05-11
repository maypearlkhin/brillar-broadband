import * as userManagementController from "../controller/userManagementController.js";

export function registerUserManagementRoutes(router) {
  router.get("/admin/users", userManagementController.listUsers);
  router.post("/admin/users/invite", userManagementController.inviteIspTeam);
  router.delete("/admin/users/:id", userManagementController.removeUser);
}
