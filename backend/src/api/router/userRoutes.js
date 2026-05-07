import * as userController from "../controller/userController.js";

/** Subscriber auth — persisted in `models/userModel.js`. */
export function registerUserAuthRoutes(router) {
  router.post("/auth/register", userController.register);
  router.post("/auth/login", userController.login);
  router.post("/auth/logout", userController.logout);
}
