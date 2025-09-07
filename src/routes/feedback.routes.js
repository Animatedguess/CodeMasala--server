import { Router } from "express";
import { createFeeback } from "../controllers/feedback.controller";

const router = Router();


router.route("/create").post(createFeeback);

// -------------------------------------
// routes
// -------------------------------------
export default router;