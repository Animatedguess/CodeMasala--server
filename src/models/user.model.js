import mongoose, { Schema } from "mongoose";

const savedCodeSchema = new Schema(
    {
        language: {
            type: String,
            required: true, // Programming language (e.g., "python", "javascript")
        },
        code: {
            type: String,
            required: true, // User's code submission
        },
        problemId: {
            type: String,
            required: true, // The problem ID for which the code is saved
        },
        createdAt: {
            type: Date,
            default: Date.now, // Timestamp for when the code was saved
        },
    },
    { _id: false } // Prevent Mongoose from auto-generating IDs for each code object
);

const userSchema = new Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true, // Clerk's unique user ID
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        firstName: {
            type: String,
            trim: true,
            lowercase: true,
        },
        lastName:{
            type: String,
            trim: true,
            lowercase: true,
        },
        avatar: {
            type: String, // Clerk provides user profile images
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        savedCodes: [savedCodeSchema],
        judge0ApiKey: {
            type: String,
            default: "NONE",
            unique: true, // Ensures each user has a unique key
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model("User", userSchema);