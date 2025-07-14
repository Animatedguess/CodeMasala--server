import { Router } from "express";
import { logOut, signIn, signUp } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.route('/logout').get(verifyJWT, logOut);

export default router;