import { Router } from "express";
import { requireAuthMiddleware } from "../middlewares/clerkAuthMiddleware.js";
import { updateUser } from "../controllers/user.controller.js";
import { dataBaseAuthMiddleware } from "../middlewares/dataBaseAuthMiddleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/update").patch(verifyJWT, updateUser);

export default router;