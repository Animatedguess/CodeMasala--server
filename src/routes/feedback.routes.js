import { Router } from "express";
import { createFeeback } from "../controllers/feedback.controller.js";

const router = Router();


router.route("/create").post(createFeeback);

// -------------------------------------
// routes
// -------------------------------------
export default router;