import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";

// --------------------------
// import discussion controller
// --------------------------
import {
    createDiscussion,
    deleteDiscussion,
    getAllDiscussions,
    updateDiscussion,
    updateLikeAndDislikeDiscussion,
} from "../controllers/discussion.controller.js";

// --------------------------
// import reply controller
// --------------------------
import {
    createReply,
    deleteReply,
    getAllReplies,
    updateLikeAndDislikeReply,
    updateReply,
} from "../controllers/reply.controller.js";


// -----------------------
// router
// -----------------------
const router = Router();


// -----------------------
// discussion routes
// -----------------------
router.route("/:model_id/discussions").post(verifyJWT, createDiscussion);
router.route("/:model_id/discussions").get(verifyJWT, getAllDiscussions);
router.route("/discussions/:discussion_id").delete(verifyJWT, deleteDiscussion);
router.route("/discussions/:discussion_id").patch(verifyJWT, updateDiscussion);
router
    .route("/discussions/:discussion_id/feedback")
    .patch(verifyJWT, updateLikeAndDislikeDiscussion);


// -----------------------
// reply routes
// -----------------------
router
    .route("/discussions/:discussion_id/replies")
    .post(verifyJWT, createReply);
router
    .route("/discussions/:discussion_id/replies")
    .get(verifyJWT, getAllReplies);
router.route("/discussions/replies/:reply_id").delete(verifyJWT, deleteReply);
router.route("/discussions/replies/:reply_id").patch(verifyJWT, updateReply);
router
    .route("/discussions/replies/:reply_id/feedback")
    .patch(verifyJWT, updateLikeAndDislikeReply);


// -----------------------
// export router
// -----------------------
export default router;
