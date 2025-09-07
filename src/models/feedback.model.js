import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
    modelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    }
});

export const Feedback = mongoose.model("Feedback", feedbackSchema);