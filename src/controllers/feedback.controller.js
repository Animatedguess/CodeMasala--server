import { Feedback } from "../models/feedback.model.js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const createFeeback = async (req, res) => {
    const { title, content, modelId } = req.body;
    const userId = req.user._id;
    if (!title || !content || !modelId) {
        return res.status(400).json(new ApiError(400, "All fields are required"));
    }

    try {
        const feedback = await Feedback.create({
            title,
            content,
            modelId,
            userId
        });

        if (!feedback) {
            return res.status(500).json(new ApiError(500, "Something went wrong"));
        }

        return res.status(201).json(new ApiResponse(201, "Feedback submitted successfully", feedback));
    } 
    catch (error) {
        return res.status(500).json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

export { createFeeback };