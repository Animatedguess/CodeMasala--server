import { Router } from "express";
import {
    deleteProblem,
    filterAllProblems,
    getAllProblems,
    getProblem,
    uploadProblem,
    createProblem,
    updateProblem,

    // discussion related routes
    updateLikeAndDislikeDiscussion,
    updateDiscussion,
    deleteDiscussion,
    getAllDiscussions,
    createDiscussion,
    reportDiscussion,

    // reply related routes
    getAllReplies,
    createReply,
    deleteReply,
    updateReply,
    reportReply,
    updateLikeAndDislikeReply,
} from "../controllers/problem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/upload").post(uploadProblem);
router.route("/all").get(getAllProblems);
router.route("/filter").get(filterAllProblems);
router.route("/search").get(getProblem);

// ----------------------------
// crud operation on problem
// ----------------------------
router.route("/delete").delete(deleteProblem);
router.route("/create").post(verifyJWT, createProblem);
router.route("/update").patch(verifyJWT, updateProblem);
router.route("/:problem_id").get(verifyJWT, getProblem);


// -----------------------
// discussion routes
// -----------------------
router.route("/:problem_id/discussions").post(verifyJWT, createDiscussion);
router.route("/:problem_id/discussions").get(verifyJWT, getAllDiscussions);
router
    .route("/:problem_id/discussions/:discussion_id")
    .delete(verifyJWT, deleteDiscussion);
router
    .route("/:problem_id/discussions/:discussion_id")
    .patch(verifyJWT, updateDiscussion);
router
    .route("/discussions/:discussion_id")
    .patch(verifyJWT, updateLikeAndDislikeDiscussion);
router
    .route("/discussions/:discussion_id/report")
    .patch(verifyJWT, reportDiscussion);


// -----------------------
// reply routes
// -----------------------
router
    .route("/discussions/:discussion_id/replies")
    .post(verifyJWT, createReply);
router
    .route("/discussions/:discussion_id/replies")
    .get(verifyJWT, getAllReplies);
router
    .route("/discussions/:discussion_id/replies/:reply_id")
    .delete(verifyJWT, deleteReply);
router
    .route("/discussions/:discussion_id/replies/:reply_id")
    .patch(verifyJWT, updateReply);
router
    .route("/discussions/:discussion_id/replies/:reply_id/report")
    .patch(verifyJWT, reportReply);
router.route("/replies/:reply_id").patch(verifyJWT, updateLikeAndDislikeReply);


export default router;
