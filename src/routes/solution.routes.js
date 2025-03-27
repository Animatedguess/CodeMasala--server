import { Router } from "express";
import { requireAuthMiddleware } from "../middlewares/clerkAuthMiddleware.js";
import { deleteSolution, filterAllSolutions, getAllSolutions, getSolution, sumbitSolution } from "../controllers/solution.controller.js";

const router = Router();

router.route("/create").post(sumbitSolution);
router.route("/delete").delete(deleteSolution);
router.route("/search").get(getSolution);
router.route("/all").get(getAllSolutions);
router.route("/filter").get(filterAllSolutions);

export default router;