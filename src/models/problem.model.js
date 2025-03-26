import mongoose, { Schema } from "mongoose";

const testCaseSchema = new Schema(
    {
        input: {
            type: String,
            required: true, // Example: "2 3"
        },
        expectedOutput: {
            type: String,
            required: true, // Example: "5"
        },
    },
    { _id: false } // Prevents Mongoose from generating an automatic _id for each test case
);

const problemSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true, // Ensures no duplicate problem titles
        },
        description: {
            type: String,
            required: true, // Problem statement
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: true, // Difficulty level
        },
        tags: {
            type: [String], // Example: ["array", "hashmap"]
        },
        testCases: [testCaseSchema], // Array of test cases
        constraints: {
            type: String, // Example: "1 ≤ nums.length ≤ 10^4"
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Refers to the user who created the problem
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const Problem = mongoose.model("Problem", problemSchema);