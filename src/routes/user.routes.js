import { Router } from "express";
import { requireAuthMiddleware } from "../middlewares/clerkAuthMiddleware.js";
import { createUser, defaultCreateUser, getUser, updateFirstName } from "../controllers/user.controller.js";
import { dataBaseAuthMiddleware } from "../middlewares/dataBaseAuthMiddleware.js";

const router = Router();

router.route("/skip").post(requireAuthMiddleware, defaultCreateUser);
router.route("/create").post(requireAuthMiddleware, createUser);
router.route("/data").get(requireAuthMiddleware, dataBaseAuthMiddleware, getUser);
router.route("/update-firstName").post(requireAuthMiddleware, dataBaseAuthMiddleware, updateFirstName);

export default router;