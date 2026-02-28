import { Router } from "express";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";
import { categoryController } from "./category.controller";

const router=Router()


router.get("/get-all-category", categoryController.getAllCategory);

router.post(
  "/add-category",
  authMiddleware(UserRole.ADMIN),
  categoryController.addCategory,
);

router.delete(
  "/:categoryId",
  authMiddleware(UserRole.ADMIN),
  categoryController.deleteCategory,
);

export const categoryRouter: Router = router;