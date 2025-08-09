import { Router } from "express";
import { deleteSolution, filterAllSolutionsByName, getAllSolutions, getSolution, sumbitSolution } from "../controllers/solution.controller.js";

const router = Router();

router.route("/create").post(sumbitSolution);
router.route("/delete").delete(deleteSolution);
router.route("/search").get(getSolution);
router.route("/all").get(getAllSolutions);
router.route("/filter").get(filterAllSolutionsByName);

export default router;