import { Router } from "express";
import { requireAuthMiddleware } from "../middlewares/clerkAuthMiddleware.js";
import { createUser, defaultCreateUser, getUser, updateDetails, updateUser, userData } from "../controllers/user.controller.js";
import { dataBaseAuthMiddleware } from "../middlewares/dataBaseAuthMiddleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/skip").post(requireAuthMiddleware, defaultCreateUser);
router.route("/create").post(requireAuthMiddleware, upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }
]), createUser);
router.route("/data").get(requireAuthMiddleware, dataBaseAuthMiddleware, getUser);
router.route("/update").post(
    requireAuthMiddleware, 
    dataBaseAuthMiddleware,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    updateDetails
);

router.route("/get").get(userData);
router.route("/update").patch(verifyJWT, updateUser);

export default router;