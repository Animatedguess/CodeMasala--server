import express from 'express';
import { requireAuthMiddleware } from "../middlewares/clerkAuthMiddleware.js";
import {dataBaseAuthMiddleware} from "../middlewares/dataBaseAuthMiddleware.js"
import { codeRunner } from '../controllers/submission.controller.js';
import { saveCodeMiddleware } from '../middlewares/saveCode.middleware.js';

const router = express.Router();

router.route("/run").post(requireAuthMiddleware, dataBaseAuthMiddleware, saveCodeMiddleware, codeRunner);

export default router;