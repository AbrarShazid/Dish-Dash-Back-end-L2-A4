import { Router } from "express";
import { userController } from "./user.controller";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";

const router = Router();
// get routes
router.get("/", authMiddleware(UserRole.ADMIN), userController.getAllUser);

router.get(
  "/get-user-profile",
  authMiddleware(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  userController.getProfile,
);

// patch  routes

router.patch(
  "/update-profile",
  authMiddleware(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  userController.updateUserProfile,
);

router.patch(
  "/:id/status",
  authMiddleware(UserRole.ADMIN),
  userController.updateUserStatus,
);

export const userRouter: Router = router;
