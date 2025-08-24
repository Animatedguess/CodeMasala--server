import { Router } from "express";
import { createReport, getAllReports } from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/all-reports').get(verifyJWT, getAllReports);
router.route('/create-report').post(verifyJWT, createReport);

export default router;