import mongoose, { Schema } from "mongoose";

// ---------------------------
// Discussion Model
// ---------------------------
const discussionSchema = new Schema(
    {
        modelId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        typeDiscussion: {
            type: String,
            enum: ["feedback", "ask question", "tip"],
            default: "feedback",
        },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        reply: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Reply",
            },
        ],
        isDelete: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);


// Exporting model
export const Discussion = mongoose.model("Discussion", discussionSchema);