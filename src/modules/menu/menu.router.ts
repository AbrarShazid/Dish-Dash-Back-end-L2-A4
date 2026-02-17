import { Router } from "express";
import { menuController } from "./menu.controller";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";

const router = Router();

router.get("/", menuController.getAllMenuItems);

router.post(
  "/add-item",
  authMiddleware(UserRole.PROVIDER),
  menuController.addMenuItem,
);

router.patch(
 "/update/:id",
 authMiddleware(UserRole.PROVIDER),
 menuController.updateMenuItem,
);



export const menuRouter: Router = router;
