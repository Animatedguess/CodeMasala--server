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
            ref: "Problem", // Reference to the problem
            required: true,
        },
        tags: {
            type: [String], // Array of tags like ["DP", "Graph", "Binary Search"]
            default: [],
        },
        markdownContent: {
            type: String, // Store the solution in Markdown format
            required: true,
        },
        // author: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "User", // Reference to the user who submitted the solution
        //     required: true,
        // },
    },
    { timestamps: true }
);

export const Solution = mongoose.model("Solution", solutionSchema);