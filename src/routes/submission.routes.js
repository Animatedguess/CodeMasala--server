import express from 'express';
import { codeRunner } from '../controllers/submission.controller.js';
import { saveCodeMiddleware } from '../middlewares/saveCode.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route("/run").post(verifyJWT, codeRunner);

export default router;