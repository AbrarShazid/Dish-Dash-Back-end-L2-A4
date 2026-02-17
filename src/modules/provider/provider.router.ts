import { Router } from "express";
import { providerController } from "./provider.controller";

const router = Router();

router.get("/", providerController.getAllProviders);

router.get("/:providerId", providerController.getMenuByProvider);
export const providerRoute: Router = router;
