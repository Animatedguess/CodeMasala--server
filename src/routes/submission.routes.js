import express from 'express';
import { requireAuthMiddleware } from "../middlewares/clerkAuthMiddleware.js";
import { codeRunner } from '../controllers/submission.controller.js';

const router = express.Router();

router.route("/run").post(codeRunner);

export default router;