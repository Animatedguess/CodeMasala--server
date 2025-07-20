import { Router } from "express";
import { deleteProblem, filterAllProblems, getAllProblems, getProblem, uploadProblem, createProblem, updateProblem } from "../controllers/problem.controller.js";
import { requireAuthMiddleware } from "../middlewares/clerkAuthMiddleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/upload").post(uploadProblem);
router.route("/all").get(getAllProblems);
router.route("/filter").get(filterAllProblems);
router.route("/search").get(getProblem);
router.route("/delete").delete(deleteProblem);
router.route("/create").post(verifyJWT, createProblem);
router.route("/update").patch(verifyJWT, updateProblem);
router.route("/:problem_id").get(verifyJWT, getProblem);

export default router;