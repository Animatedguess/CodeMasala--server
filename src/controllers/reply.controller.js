import mongoose from "mongoose";

import { Reply } from "../models/reply.model.js";
import { Discussion } from "../models/discussion.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// ------------------------------------
// crud operation on reply model
// ------------------------------------
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


export {
    createReply,
    getAllReplies,
    deleteReply,
    updateReply,
    updateLikeAndDislikeReply
}