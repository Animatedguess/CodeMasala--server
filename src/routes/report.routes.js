import { Router } from "express";
import { createReport, getAllReports } from "../controllers/report.controller.js";

const router = Router();

router.route('/all-reports').get(getAllReports);
router.route('/create-report').post(createReport);

export default router;