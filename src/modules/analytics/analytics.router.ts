import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";

const router=Router()

router.get("/admin", authMiddleware(UserRole.ADMIN), analyticsController.getAdminAnalytics)
router.get("/provider", authMiddleware(UserRole.PROVIDER), analyticsController.getProviderAnalytics)


 export  const analyticsRouter:Router=router