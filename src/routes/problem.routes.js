import { Router } from "express";
import {
    deleteProblem,
    filterAllProblems,
    getAllProblems,
    getProblem,
    uploadProblem,
    createProblem,
    updateProblem,
} from "../controllers/problem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


// -------------------------------------------------------------------------
// routes
// -------------------------------------------------------------------------
const router = Router();

router.route("/upload").post(uploadProblem);
router.route("/all").get(getAllProblems);
router.route("/filter").get(filterAllProblems);
router.route("/search").get(getProblem);

// ----------------------------
// crud operation on problem
// ----------------------------
router.route("/delete").delete(deleteProblem);
router.route("/create").post(verifyJWT, createProblem);
router.route("/update").patch(verifyJWT, updateProblem);
router.route("/:problem_id").get(verifyJWT, getProblem);

// ----------------------------
// Exporting problemRoute
// ----------------------------
export default router;