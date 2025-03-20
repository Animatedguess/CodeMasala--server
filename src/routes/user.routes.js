import { Router } from "express";
import { codeRunner } from "../controllers/user.controller.js";
import { requireAuthMiddleware } from "../middlewares/clerkAuthMiddleware.js";

const router = Router();

router.route("/run").get(codeRunner);
// router.route("/pro").get(requireAuthMiddleware, detailUser);

export default router;