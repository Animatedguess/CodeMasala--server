import { Router } from "express";
import { createSolution, deleteSolution, filterAllSolutionsByName, getAllSolutions, getSolution, updateLike, updateSolution } from "../controllers/solution.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// -----------------------------------
// crud operation on solution model routes
// -----------------------------------
router.route("/create").post(verifyJWT, createSolution);
router.route("/:solutionId").delete(verifyJWT, deleteSolution);
router.route("/:solutionId").get(getSolution);
router.route("/:solutionId").patch(verifyJWT, updateSolution);
router.route("/problemId/:problemId").get(verifyJWT, getAllSolutions);

// -----------------------------------
// feedback routes
// -----------------------------------
router.route("/:solutionId/like").patch(verifyJWT, updateLike);

router.route("/filter").get(filterAllSolutionsByName);

// -----------------------------------
// export router
// -----------------------------------
export default router;