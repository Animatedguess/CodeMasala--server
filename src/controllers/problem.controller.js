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

    if (!content || !htmlContent) {
        return res
            .status(400)
            .json(new ApiError(400, "Content and HTML content are required"));
    }

    try {
        const existingDiscussion = await Discussion.findOne({
            problemId: problem_id,
            userId: req.user._id,
            content: content.trim(),
            typeDiscussion: type.trim().toLowerCase(),
        });

        if (existingDiscussion) {
            return res
                .status(409)
                .json(new ApiError(409, "Discussion already exists"));
        }

        const discussion = await Discussion.create({
            problemId: problem_id,
            userId: req.user._id,
            content: content.trim(),
            typeDiscussion: type.trim().toLowerCase(),
        });

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    "Discussion created successfully",
                    discussion
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
            { $match: { problemId: problem_id } },
            {
                $addFields: {
                    isLoggedInUser: {
                        $cond: [
                            {
                                $eq: ["$userId", req.user._id],
                            },
                            1,
                            0,
                        ],
                    },
                    likeCount: { $size: { $ifNull: ["$likes", []] } },
                    dislikeCount: { $size: { $ifNull: ["$dislikes", []] } },
                    likedByUser: {
                        $in: [req.user._id, { $ifNull: ["$likes", []] }],
                    },
                    dislikedByUser: {
                        $in: [req.user._id, { $ifNull: ["$dislikes", []] }],
                    },
                },
            },
            {
                $sort: {
                    isLoggedInUser: -1,
                    createdAt: -1,
                },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
            {
                $unset: ["likes", "dislikes"],
            },
        ]).populate("userId", "-_id");

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
    const { discussion_id, content, type } = req.body;

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

        if (content?.trim()) discussion.content = content;
        if (type?.trim()) discussion.type = type;
        await discussion.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Discussion updated successfully",
                    discussion
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
            if (!discussion.likes.includes(req.user._id)) {
                discussion.likes.push(req.user._id);
            }
            discussion.dislikes.pull(req.user._id);
        } else {
            if (!discussion.dislikes.includes(req.user._id)) {
                discussion.dislikes.push(req.user._id);
            }
            discussion.likes.pull(req.user._id);
        }

        await discussion.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Discussion updated successfully",
                    discussion
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
            content: content.trim(),
        });

        discussion.reply.push(newReply._id);

        await discussion.save();

        return res
            .status(201)
            .json(new ApiResponse(201, "Reply added successfully", discussion));
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
          {
            $match: { discussionId: discussion_id },
          },
          {
            $addFields: {
              isLoggedInUser: {
                $cond: [
                  { $eq: ["$userId", req.user._id] },
                  1,
                  0,
                ],
              },
              likeCount: { $size: { $ifNull: ["$likes", []] } },
              dislikeCount: { $size: { $ifNull: ["$dislikes", []] } },
              likedByUser: {
                $in: [req.user._id, { $ifNull: ["$likes", []] }],
              },
              dislikedByUser: {
                $in: [req.user._id, { $ifNull: ["$dislikes", []] }],
              },
            },
          },
          {
            $sort: {
              isLoggedInUser: -1,
              createdAt: -1,
            },
          },
        ]).populate("userId", "-_id");

        if (!replies) {
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
    const { reply_id, discussion_id } = req.params;

    if (!reply_id || !discussion_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Reply ID and Discussion ID are required"));
    }

    try {
        const reply = await Reply.findByIdAndUpdate(
            reply_id,
            { isDeleted: true },
            { new: true }
        );

        if (!reply) {
            return res.status(404).json(new ApiError(404, "Reply not found"));
        }

        const discussion = await Discussion.findById(discussion_id);

        if (!discussion) {
            return res
                .status(404)
                .json(new ApiError(404, "Discussion not found"));
        }

        discussion.reply = discussion.reply.filter(
            (reply) => reply._id.toString() !== reply_id
        );

        await discussion.save();

        return res
            .status(200)
            .json(new ApiResponse(200, "Reply deleted successfully"));
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

        return res
            .status(200)
            .json(new ApiResponse(200, "Reply updated successfully", reply));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const updateLikeAndDislikeReply = async (req, res) => {
    const { reply_id } = req.params;
    const { isLike } = req.query.isLike === "true";

    if (!reply_id) {
        return res.status(400).json(new ApiError(400, "Reply ID is required"));
    }

    try {
        const reply = await Reply.findById(reply_id);

        if (!reply) {
            return res.status(404).json(new ApiError(404, "Reply not found"));
        }

        if (isLike) {
            if (!reply.likes.includes(req.user._id)) {
                reply.likes.push(req.user._id);
            }
            reply.dislikes.pull(req.user._id);
        } else {
            if (!reply.dislikes.includes(req.user._id)) {
                reply.dislikes.push(req.user._id);
            }
            reply.likes.pull(req.user._id);
        }

        await reply.save();

        return res
            .status(200)
            .json(new ApiResponse(200, "Reply updated successfully", reply));
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
