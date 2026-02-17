import { Router } from "express";
import { menuController } from "./menu.controller";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";

const router = Router();



router.post(
  "/add-item",
  authMiddleware(UserRole.PROVIDER),
  menuController.addMenuItem,
);



export const menuRouter: Router = router;
