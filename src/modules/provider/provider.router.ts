import { Router } from "express";
import { providerController } from "./provider.controller";

const router = Router();

router.get("/", providerController.getAllProviders);


export const providerRoute: Router = router;
