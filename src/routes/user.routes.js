import { Router } from "express";
import { getUser, saveCodeProgress, updateUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/get").get(verifyJWT, getUser);
router.route("/update").patch(verifyJWT, updateUser);
router.route("/save-code").post(verifyJWT, saveCodeProgress);

export default router;