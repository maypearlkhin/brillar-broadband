import * as categoryController from "../controller/planCategoryController.js";

export function registerPlanCategoryRoutes(router) {
  router.get("/plan-categories", categoryController.listCategories);
  router.post("/plan-categories", categoryController.createCategory);
  router.put("/plan-categories/:categoryId", categoryController.updateCategory);
  router.delete("/plan-categories/:categoryId", categoryController.deleteCategory);
}
