import mongoose from "mongoose";

import { Discussion, Problem, Reply } from "../models/problem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// problem statement
const uploadProblem = async (req, res) => {
    try {
        const { title, description, difficulty, tags, testCases, constraints } =
            req.body;

        if (
            !title ||
            !description ||
            !difficulty ||
            !tags ||
            !testCases ||
            !constraints
        ) {
            throw new ApiError(400, "All fields are required");
        }

        // validate problem statement
        const exitProblemStatement = await Problem.findOne({
            $or: [{ title }, { description }],
        });

        if (exitProblemStatement) {
            throw new ApiError(400, "Problem statement already exists");
        }

        const newDifficulty = difficulty.toLowerCase();

        // create problem statement
        const problem = await Problem.create({
            title,
            description,
            difficulty: newDifficulty,
            tags,
            testCases,
            constraints,
        });

        if (!problem) {
            throw new ApiError(500, "Something went wrong");
        }

        res.status(201).json(
            new ApiResponse(
                201,
                "Problem statement created successfully",
                problem
            )
        );
    } catch (error) {
        console.log(
            error.statusCode || 500,
            error.message || "Internal Server Error"
        );
    }
};

const getAllProblems = async (req, res) => {
    try {
    } catch (error) {
        res.status(500).json(
            new ApiResponse(
                500,
                error.statusCode || 500,
                error.message || "Internal Server Error"
            )
        );
    }
};

const filterAllProblems = async (req, res) => {
    try {
    } catch (error) {
        res.status(500).json(
            new ApiResponse(
                500,
                error.statusCode || 500,
                error.message || "Internal Server Error"
            )
        );
    }
};


// ----------------------------------------------
// crud operations on problem model
// ----------------------------------------------
const createProblem = async (req, res) => {
    const {
        title,
        description,
        difficulty,
        tags = [],
        constraints = [],
        exampleProblemTestCase = [],
        starterCode = {},
        testCases = [],
        supportedLanguages = [],
        functionName = "",
    } = req.body;

    // Basic validation
    if (
        [title, description, difficulty].some(
            (field) => typeof field !== "string" || field.trim() === ""
        )
    ) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    "title, description, difficulty are required and must be non-empty strings"
                )
            );
    }

    if (!Array.isArray(tags)) {
        return res
            .status(400)
            .json(new ApiError(400, "Tags must be an array of strings"));
    }

    if (!Array.isArray(constraints)) {
        return res
            .status(400)
            .json(new ApiError(400, "Constraints are required"));
    }

    if (
        !Array.isArray(exampleProblemTestCase) ||
        exampleProblemTestCase.length === 0
    ) {
        return res
            .status(400)
            .json(new ApiError(400, "Provide at least one example test case"));
    }

    if (!Array.isArray(testCases) || testCases.length <= 2) {
        return res
            .status(400)
            .json(
                new ApiError(400, "Problem should have more than 2 test cases")
            );
    }

    if (typeof starterCode !== "object" || Array.isArray(starterCode)) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    "starterCode must be an object of language:code"
                )
            );
    }

    if (typeof supportedLanguages !== "object") {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    "supportedlanguage must be an array of objects"
                )
            );
    }

    if (typeof functionName !== "string" || Array.isArray(functionName)) {
        return res
            .status(400)
            .json(new ApiError(400, "functionName must be an string"));
    }

    try {
        const existingProblem = await Problem.findOne({ title: title.trim() });

        if (existingProblem) {
            return res
                .status(400)
                .json(
                    new ApiResponse(
                        400,
                        "A problem with this title already exists"
                    )
                );
        }

        const problem = await Problem.create({
            title: title.trim(),
            description: description.trim(),
            difficulty: difficulty.trim().toLowerCase(),
            tags,
            constraints,
            exampleProblemTestCase: exampleProblemTestCase.map((tc) => ({
                input: String(tc.input || "").trim(),
                output: String(tc.output || "").trim(),
                explanation: String(tc.explanation || "").trim(),
            })),
            testCases: testCases.map((tc) => ({
                input: Array.isArray(tc.input) ? tc.input : [tc.input],
                expectedOutput: String(tc.expectedOutput || "").trim(),
            })),
            supportedLanguages: supportedLanguages.map((sl) => ({
                name: String(sl.name || "").trim(),
                language_id: sl.language_id,
            })),
            starterCode,
            functionName: functionName.trim(),
        });

        return res
            .status(201)
            .json(
                new ApiResponse(201, "Problem created successfully", problem)
            );
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal server error"));
    }
};

const getProblem = async (req, res) => {
    const { problem_id } = req.params;

    if (!problem_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Problem ID is required"));
    }

    try {
        const problem = await Problem.findById(problem_id)
            .populate("testCases")
            .exec();

        if (!problem) {
            return res
                .status(404)
                .json(
                    new ApiError(404, "No problem found with the provided ID")
                );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, "Problem fetched successfully", problem)
            );
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const updateProblem = async (req, res) => {
    const {
        problem_id,
        title,
        description,
        difficulty,
        tags,
        constraints,
        exampleProblemTestCase,
        starterCode,
        testCases,
        supportedLanguages,
        functionName,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(problem_id)) {
        return res.status(400).json(new ApiError(400, "Invalid problem ID"));
    }

    try {
        const problem = await Problem.findById(problem_id);
        if (!problem) {
            return res.status(404).json(new ApiError(404, "Problem not found"));
        }

        const updates = {};

        if (typeof title === "string" && title.trim())
            updates.title = title.trim();
        if (typeof description === "string" && description.trim())
            updates.description = description.trim();
        if (
            typeof difficulty === "string" &&
            ["easy", "medium", "hard"].includes(difficulty.toLowerCase())
        )
            updates.difficulty = difficulty.toLowerCase();
        if (Array.isArray(tags)) updates.tags = tags;
        if (typeof constraints === "string") updates.constraints = constraints;
        if (Array.isArray(exampleProblemTestCase))
            updates.exampleProblemTestCase = exampleProblemTestCase;
        if (Array.isArray(testCases)) updates.testCases = testCases;
        if (Array.isArray(supportedLanguages))
            updates.supportedLanguages = supportedLanguages;
        if (starterCode && typeof starterCode === "object")
            updates.starterCode = starterCode;
        if (typeof functionName === "string")
            updates.functionName = functionName;

        const updatedProblem = await Problem.findByIdAndUpdate(
            problem_id,
            updates,
            { new: true, runValidators: true }
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Successfully updated problem",
                    updatedProblem
                )
            );
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Server error"));
    }
};

const deleteProblem = async (req, res) => {
    const { problem_id } = req.body;

    if (!problem_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Problem ID is required"));
    }

    try {
        const problem = await Problem.findById(problem_id);

        if (!problem) {
            return res
                .status(404)
                .json(
                    new ApiError(404, "No problem found with the provided ID")
                );
        }

        await Problem.deleteOne({ _id: problem_id });

        return res
            .status(200)
            .json(new ApiResponse(200, "Successfully deleted the problem"));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};


// ------------------------------------------------
// crud operations on discussion model
// ------------------------------------------------
const createDiscussion = async (req, res) => {
    const { problem_id } = req.params;
    const { content, type } = req.body;

    if (!content) {
        return res
            .status(400)
            .json(new ApiError(400, "Content is required"));
    }

    try {
        const discussion = await Discussion.create({
            problemId: problem_id,
            userId: req.user._id,
            content: content.trim(),
            typeDiscussion: type.trim().toLowerCase(),
        });


        // deleted sensititve data for discussion
        const discussionObject = discussion.toObject();
        delete discussionObject.isDelete;
        delete discussionObject.__v;
        delete discussionObject.userId;
        delete discussionObject.reply;
        delete discussionObject.dislikes;
        delete discussionObject.likes;
        delete discussionObject.problemId;

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    "Discussion created successfully",
                    discussionObject
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const getAllDiscussions = async (req, res) => {
    const { problem_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const discussions = await Discussion.aggregate([
            // Stage 1: Match the required documents
            {
                $match: {
                    problemId: new mongoose.Types.ObjectId(problem_id),
                    isDelete: false
                }
            },

            // Stage 2 - Add a field to identify the current user's posts
            {
                $addFields: {
                    isLoggedInUser: {
                        $cond: [ { $eq: ["$userId", req.user._id] }, 1, 0 ]
                    }
                }
            },

            // Stage 3 - Sort by the new field first, then by date
            {
                $sort: {
                    isLoggedInUser: -1, // Sorts 1s (user's posts) before 0s
                    createdAt: -1      // Then, sort all posts by most recent
                }
            },

            // Stage 4 - Skip documents for previous pages
            {
                $skip: (page - 1) * limit
            },

            // Stage 5 - Limit the results to the page size
            {
                $limit: limit
            },

            // Stage 6: Add the like and dislike counts
            {
                $addFields: {
                    likeCount: { $size: { $ifNull: ["$likes", []] } },
                    dislikeCount: { $size: { $ifNull: ["$dislikes", []] } },
                    replyCount: { $size: { $ifNull: ["$dislikes", []] } }
                }
            },

            // Stage 7: "Populate" the user data
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },

            // Stage 8: Deconstruct the user array into an object
            {
                $unwind: "$user"
            },

            // Stage 9: Reshape the userId field with the username
            {
                $addFields: {
                    userId: {
                        username: "$user.username"
                    }
                }
            },

            // Stage 10: Remove unwanted fields
            {
                $project: {
                    likes: 0,
                    dislikes: 0,
                    user: 0,
                    isLoggedInUser: 0,
                    problemId: 0,
                    isDelete: 0,
                    reply: 0
                }
            }
        ]);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Discussions retrieved successfully",
                    discussions
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const deleteDiscussion = async (req, res) => {
    const { discussion_id } = req.params;

    if (!discussion_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Discussion ID is required"));
    }

    try {
        const discussion = await Discussion.findById(discussion_id);

        if(discussion.isDelete){
          return res
            .status(400)
            .json(new ApiError(400, "Discussion already deleted"));
        }

        if (!discussion) {
            return res
                .status(404)
                .json(
                    new ApiError(
                        404,
                        "No discussion found with the provided ID"
                    )
                );
        }

        discussion.isDelete = true;
        await discussion.save();

        return res
            .status(200)
            .json(new ApiResponse(200, "Successfully deleted the discussion"));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const updateDiscussion = async (req, res) => {
    const { content, type } = req.body;
    const {discussion_id} = req.params;

    if (!discussion_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Discussion ID is required"));
    }

    try {
        const discussion = await Discussion.findById(discussion_id);

        if(discussion.isDelete){
            return res
            .status(400)
            .json(new ApiError(400, "Discussion already deleted"));
        }

        if (!discussion) {
            return res
                .status(404)
                .json(new ApiError(404, "Discussion not found"));
        }

        if (content?.trim()) discussion.content = content;
        if (type?.trim()) discussion.typeDiscussion = type;
        await discussion.save();


        // deleted sensititve data for discussion
        const discussionObject = discussion.toObject();
        delete discussionObject.isDelete;
        delete discussionObject.__v;
        delete discussionObject.userId;
        delete discussionObject.reply;
        delete discussionObject.dislikes;
        delete discussionObject.likes;
        delete discussionObject.problemId;

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Discussion updated successfully",
                    discussionObject
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const updateLikeAndDislikeDiscussion = async (req, res) => {
    const { discussion_id } = req.params;
    const isLike = req.query.isLike === "true";
    const userId = req.user._id;

    if (!discussion_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Discussion ID is required"));
    }

    try {
        const discussion = await Discussion.findById(discussion_id);

        if (!discussion) {
            return res
                .status(404)
                .json(new ApiError(404, "Discussion not found"));
        }

        if (isLike) {
            if (discussion.likes.includes(userId)) {
                discussion.likes.pull(userId);
            } else {
                discussion.likes.push(userId);
                discussion.dislikes.pull(userId);
            }
        } else {
            if (discussion.dislikes.includes(userId)) {
                discussion.dislikes.pull(userId);
            } else {
                discussion.dislikes.push(userId);
                discussion.likes.pull(userId);
            }
        }

        await discussion.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Discussion updated successfully",
                    {
                        likesCount: discussion.likes.length,
                        dislikesCount: discussion.dislikes.length,
                        userLikeStatus: discussion.likes.includes(userId) ? "liked" : discussion.dislikes.includes(userId) ? "disliked" : "none"
                    }
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const reportDiscussion = async (req, res) => {
    const { discussion_id } = req.params;

    if (!discussion_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Discussion ID is required"));
    }

    try {
        const discussion = await Discussion.findById(discussion_id);

        if (!discussion) {
            return res
                .status(404)
                .json(new ApiError(404, "Discussion not found"));
        }

        discussion.reports.push({
            userId: req.user._id,
            reason: req.body.reason || "No reason provided",
        });

        await discussion.save();

        return res
            .status(200)
            .json(new ApiResponse(200, "Discussion reported successfully"));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

// -------------------------------------
// reply operations
// -------------------------------------
const createReply = async (req, res) => {
    const { discussion_id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
        return res
            .status(400)
            .json(new ApiError(400, "Content is required for reply"));
    }

    try {
        const discussion = await Discussion.findById(discussion_id);
        if (!discussion) {
            return res
                .status(404)
                .json(new ApiError(404, "Discussion not found"));
        }

        const newReply = await Reply.create({
            userId: req.user._id,
            discussionId: discussion_id,
            content: content.trim(),
        });

        discussion.reply.push(newReply._id);

        await discussion.save();

        // deleting sensitive data from reply document
        const replyObject = newReply.toObject();
        delete replyObject.isDelete;
        delete replyObject.__v;
        delete replyObject.userId;
        delete replyObject.discussionId;
        delete replyObject.likes;
        delete replyObject.dislikes;

        return res
            .status(201)
            .json(new ApiResponse(201, "Reply added successfully", replyObject));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const getAllReplies = async (req, res) => {
    const { discussion_id } = req.params;

    if (!discussion_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Discussion ID is required"));
    }

    try {
        const replies = await Reply.aggregate([
            // step 1: Match the required documents
            {
                $match: {
                    discussionId: new mongoose.Types.ObjectId(discussion_id),
                    isDelete: false,
                },
            },

            // step 2: Add a field to identify the current user's posts
            {
                $addFields: {
                    isLoggedInUser: {
                        $cond: [ { $eq: ["$userId", req.user._id] }, 1, 0 ]
                    }
                }
            },

            // step 3: Sort by the new field first, then by date
            {
                $sort: {
                    isLoggedInUser: -1, // Sorts 1s (user's posts) before 0s
                    createdAt: -1      // Then, sort all posts by most recent
                }
            },

            // Stage 4: Add the like and dislike counts
            {
                $addFields: {
                    likeCount: { $size: { $ifNull: ["$likes", []] } },
                    dislikeCount: { $size: { $ifNull: ["$dislikes", []] } }
                }
            },

            // Stage 5: "Populate" the user data
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },

            // Stage 6: Deconstruct the user array into an object
            {
                $unwind: "$user"
            },

            // Stage 7: Reshape the userId field with the username
            {
                $addFields: {
                    userId: {
                        username: "$user.username"
                    }
                }
            },

            // Stage 8: Remove unwanted fields
            {
                $project: {
                    likes: 0,
                    dislikes: 0,
                    user: 0,
                    isLoggedInUser: 0,
                    discussionId: 0,
                    isDelete: 0
                }
            }
        ]);

        if (replies.length === 0) {
            return res
                .status(404)
                .json(new ApiError(404, "Replies not found"));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Replies fetched successfully",
                    replies
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const deleteReply = async (req, res) => {
    const { reply_id } = req.params;

    if (!reply_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Reply ID is required"));
    }

    try {
        const reply = await Reply.findByIdAndUpdate(
            reply_id,
            { isDelete: true },
            { new: true }
        );

        if (!reply) {
            return res.status(404).json(new ApiError(404, "Reply not found"));
        }

        if(reply.isDelete){
            return res
            .status(400).json(new ApiError(400, "Reply already deleted"));
        }

        const discussion = await Discussion.findById(reply.discussionId);

        if (!discussion) {
            return res
                .status(404)
                .json(new ApiError(404, "Discussion not found"));
        }

        // removing reply from discussion
        discussion.reply = discussion.reply.filter(
            (reply) => reply._id.toString() !== reply_id
        );
        await discussion.save();

        return res
            .status(200)
            .json(new ApiResponse(200, "Reply deleted successfully", discussion.reply));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const updateReply = async (req, res) => {
    const { reply_id } = req.params;

    if (!reply_id.trim()) {
        return res.status(400).json(new ApiError(400, "Reply ID is required"));
    }

    try {
        const reply = await Reply.findById(reply_id);

        if (!reply) {
            return res.status(404).json(new ApiError(404, "Reply not found"));
        }

        reply.content = req.body.content || reply.content;
        await reply.save();

        // removing sensitive information from reply document
        const replyObject = reply.toObject();
        delete replyObject.isDelete;
        delete replyObject.__v;
        delete replyObject.userId;
        delete replyObject.discussionId;
        delete replyObject.likes;
        delete replyObject.dislikes;

        return res
            .status(200)
            .json(new ApiResponse(200, "Reply updated successfully", replyObject));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const updateLikeAndDislikeReply = async (req, res) => {
    const { reply_id } = req.params;
    const isLike = req.query.isLike === "true";

    if (!reply_id) {
        return res.status(400).json(new ApiError(400, "Reply ID is required"));
    }

    try {
        const reply = await Reply.findById(reply_id);

        if (!reply) {
            return res.status(404).json(new ApiError(404, "Reply not found"));
        }

        if (isLike) {
            if (reply.likes.includes(req.user._id)) {
                reply.likes.pull(req.user._id);
            }
            else{
                reply.likes.push(req.user._id);
                reply.dislikes.pull(req.user._id);
            }
        } else {
            if (reply.dislikes.includes(req.user._id)) {
                reply.dislikes.pull(req.user._id);
            }
            else{
                reply.dislikes.push(req.user._id);
                reply.likes.pull(req.user._id);
            }
        }

        await reply.save();

        return res
            .status(200)
            .json(new ApiResponse(200, "Reply updated successfully", {
                likesCount: reply.likes.length,
                dislikesCount: reply.dislikes.length,
                userLikeStatus: reply.likes.includes(req.user._id) ? "liked" : reply.dislikes.includes(req.user._id) ? "disliked" : "none"
            }));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const reportReply = async (req, res) => {
  const { reply_id } = req.params;
  const { reason } = req.body;

  if(!reply_id.trim()){
    return res.status(400).json(new ApiError(400, "Reply ID is required"));
  }

  try {
    const reply = await Reply.findById(reply_id);

    if (!reply) {
      return res.status(404).json(new ApiError(404, "Reply not found"));
    }

    reply.reports.push({ userId: req.user._id, reason });
    await reply.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Reply reported successfully", reply));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error?.message || "Internal Server Error"));
  }
}


// ----------------------
// export
// ----------------------
export {
    uploadProblem,
    deleteProblem,
    getAllProblems,
    filterAllProblems,
    getProblem,
    createProblem,
    updateProblem,

    // discussion operations
    createDiscussion,
    getAllDiscussions,
    deleteDiscussion,
    updateDiscussion,
    updateLikeAndDislikeDiscussion,
    reportDiscussion,

    // reply operations
    createReply,
    getAllReplies,
    deleteReply,
    updateReply,
    reportReply,
    updateLikeAndDislikeReply,
};
