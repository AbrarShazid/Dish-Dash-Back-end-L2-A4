import { Router } from "express";
import { reviewController } from "./review.controller";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";

const router = Router();
router.post(
  "/",
  authMiddleware(UserRole.CUSTOMER),
  reviewController.createReview,
);

export const reviewRouter: Router = router;
