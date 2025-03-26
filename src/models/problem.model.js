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
        testCases: [
            {
                input: { type: String, required: true },
                expectedOutput: { type: String, required: true }, // Ensure this field is required
            },
            { _id: false }
        ], // Array of test cases
        constraints: {
            type: String, // Example: "1 ≤ nums.length ≤ 10^4"
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const Problem = mongoose.model("Problem", problemSchema);