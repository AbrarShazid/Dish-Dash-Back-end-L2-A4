import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";

const router=Router()

router.get("/admin", authMiddleware(UserRole.ADMIN), analyticsController.getAdminAnalytics)


 export  const analyticsRouter:Router=router