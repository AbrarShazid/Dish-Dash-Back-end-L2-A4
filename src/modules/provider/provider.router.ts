import { Router } from "express";
import { providerController } from "./provider.controller";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";

const router = Router();

router.get("/", providerController.getAllProviders);

router.get("/:providerId", providerController.getMenuByProvider);

router.patch(
  "/become-provider",
  authMiddleware(UserRole.CUSTOMER),
  providerController.becomeProvider,
);

router.patch(
  "/update-provider-profile",
  authMiddleware(UserRole.PROVIDER),
  providerController.updateProviderProfile,
);

router.patch(
  "/toggle-open",
  authMiddleware(UserRole.PROVIDER),
  providerController.toggleOpen,
);

export const providerRoute: Router = router;
