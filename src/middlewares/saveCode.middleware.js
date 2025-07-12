import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { saveCodeOnDataBase } from "../utils/saveCodeOnDataBase.js";
import { User } from "../models/user.model.js";

const saveCodeMiddleware = async (req, res, next) => {
    try {
        const { problemId, language_id, code } = req.body;

        // ✅ Validate request body
        if (!code || !language_id || !problemId) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(new ApiError(StatusCodes.BAD_REQUEST, "All fields are required"));
        }

        const user = req.userDa; // Clerk authenticated user (from middleware)

        if (!user) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated"));
        }

        // ✅ Save submission to database
        const submission = await saveCodeOnDataBase(problemId, language_id, code, user);

        // ✅ Update user's submissions array
        await User.findByIdAndUpdate(
            user._id,
            {
                $push: {
                    submissions: {
                        problemId,
                        language_id: { [language_id]: language_id },
                        code,
                        submittedAt: new Date(),
                    },
                },
            },
            { new: true }
        );

        res.status(StatusCodes.OK).json(new ApiResponse("Code saved successfully",submission));
    } catch (error) {
        next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Server Error"));
    }
};

export { saveCodeMiddleware }