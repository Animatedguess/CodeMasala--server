import { Router } from "express";
import { codeRunner, deleteProblem, filterAllProblems, getAllProblems, getProblem, uploadProblem } from "../controllers/submission.controller.js";
import { requireAuthMiddleware } from "../middlewares/clerkAuthMiddleware.js";

const router = Router();

router.route("/run").get(codeRunner);
router.route("/upload").post(uploadProblem);
router.route("/all").get(getAllProblems);
router.route("/filter").get(filterAllProblems);
router.route("/search").get(getProblem);
router.route("/delete").delete(deleteProblem);

export default router;