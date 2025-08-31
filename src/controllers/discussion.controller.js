import mongoose from "mongoose";
import { Discussion } from "../models/discussion.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// ----------------------------------------
// Crud operations for Discussion model
// ----------------------------------------
const createDiscussion = async (req, res) => {
    const { model_id } = req.params;
    const { content, type } = req.body;

    if (!model_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Model ID is required"));
    }
    
    if (!content) {
        return res
            .status(400)
            .json(new ApiError(400, "Content is required"));
    }

    try {
        const discussion = new Discussion({
            modelId: model_id,
            userId: req.user._id,
            content: content.trim()
        });

        if(type.trim()){
            discussion.typeDiscussion = type.trim();
        }

        await discussion.save();

        if (!discussion) {
            return res
                .status(500)
                .json(new ApiError(500, "Something went wrong"));
        }

        // deleted sensititve data for discussion
        const discussionObject = discussion.toObject();
        delete discussionObject.isDelete;
        delete discussionObject.__v;
        delete discussionObject.userId;
        delete discussionObject.reply;
        delete discussionObject.dislikes;
        delete discussionObject.likes;
        delete discussionObject.modelId;

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
    const { model_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!model_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Model ID is required"));
    }

    try {
        const discussions = await Discussion.aggregate([
            // Stage 1: Match the required documents
            {
                $match: {
                    modelId: new mongoose.Types.ObjectId(model_id),
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
                    modelId: 0,
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
        delete discussionObject.modelId;

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


// ----------------------------------------
// exporting controller
// ----------------------------------------
export {
    createDiscussion,
    getAllDiscussions,
    deleteDiscussion,
    updateDiscussion,
    updateLikeAndDislikeDiscussion
}