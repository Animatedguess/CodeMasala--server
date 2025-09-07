import mongoose, { Schema } from "mongoose";


const solutionSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        markdownContent: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    },
    { timestamps: true }
);

export const Solution = mongoose.model("Solution", solutionSchema);