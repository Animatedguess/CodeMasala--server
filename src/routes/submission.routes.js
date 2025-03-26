import { Router } from "express";
import { codeRunner, uploadProblem } from "../controllers/submission.controller.js";
import { requireAuthMiddleware } from "../middlewares/clerkAuthMiddleware.js";

const router = Router();

router.route("/run").get(codeRunner);
router.route("/problem").post(uploadProblem);

export default router;