import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ProblemProgress, User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// note:-
// req.user --> to access the data from Clerk Database

const updateUser = async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json(new ApiError(401, "Unauthorized"));
    }
    try {
        const {
            name,
            gender,
            country,
            state,
            district,
            date,
            month,
            year,
            summary,
            website,
            skillsets,
            judge0ApiKey,
        } = req.body;

        const updates = {};

        if (name?.trim()) updates.name = name.trim();
        if (gender) updates.gender = gender;

        if (country || state || district) {
            updates.location = {};
            if (country?.trim()) updates.location.country = country.trim();
            if (state?.trim()) updates.location.state = state.trim();
            if (district?.trim()) updates.location.district = district.trim();
        }

        if (date || month || year) {
            updates.birthday = {};
            if (date) updates.birthday.date = parseInt(date);
            if (month) updates.birthday.month = parseInt(month);
            if (year) updates.birthday.year = parseInt(year);
        }

        if (summary?.trim()) updates.summary = summary.trim();

        if (Array.isArray(website)) {
            updates.website = website
                .map((link) => link.trim())
                .filter(Boolean);
        }

        if (Array.isArray(skillsets)) {
            updates.skillset = skillsets
                .map((skill) => skill.trim())
                .filter(Boolean);
        }

        if (typeof judge0ApiKey === "string" && judge0ApiKey.trim()) {
            updates.judge0ApiKey = judge0ApiKey.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res
                .status(400)
                .json(new ApiError(400, "No valid fields to update"));
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        }).select("-password -refresh_token");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "User profile updated successfully",
                    updatedUser
                )
            );
    } catch (error) {
        // Handle unique constraint error for judge0ApiKey
        if (error.code === 11000 && error.keyPattern?.judge0ApiKey) {
            return res
                .status(400)
                .json(new ApiError(400, "Judge0 API key already in use"));
        }

        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const getUser = async (req, res) => {
    try {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "SuccessFully fetched data of user",
                    req.user
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const saveCodeProgress = async (req, res) => {
    const { problemId, language_id, code } = req.body;

    if (
        [problemId, code].some(
            (field) =>
                !field || typeof field !== "string" || field.trim() === ""
        )
    ) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    "problemId, and code are all required and must be non-empty strings"
                )
            );
    }

    if (language_id <= 0) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    "language_id is always non-zero negative number"
                )
            );
    }

    try {
        const existingProgress = await ProblemProgress.findOne({
            owner: req.user._id,
            problemId,
        });

        if (existingProgress) {
            existingProgress.language_id = language_id;
            existingProgress.code = code;
            await existingProgress.save();

            return res
                .status(200)
                .json(
                    new ApiResponse(200, "Successfully updated code progress")
                );
        }

        const progress = await ProblemProgress.create({
            owner: req.user._id,
            problemId,
            language_id,
            code,
        });

        if (!progress) {
            return res
                .status(400)
                .json(
                    new ApiError(400, "Something went wrong while saving code")
                );
        }

        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { savedCodes: progress._id } },
            { new: true }
        );

        return res
            .status(200)
            .json(new ApiResponse(200, "Successfully saved new code progress"));
    } catch (error) {
        return res
            .status(500)
            .json(
                new ApiError(
                    500,
                    error?.message || "Internal Server Error",
                    error
                )
            );
    }
};

const getAllCodes = async (req, res) => {
    try {
        const { limit = 10, cursor } = req.query;
        const query = { owner: req.user._id };

        if (cursor) {
            query._id = { $gt: cursor };
        }

        const results = await ProblemProgress.find(query)
            .sort({ _id: 1 })
            .limit(Number(limit) + 1);

        const hasNext = results.length > limit;
        const paginatedResults = hasNext ? results.slice(0, -1) : results;
        const nextCursor = hasNext
            ? paginatedResults[paginatedResults.length - 1]._id
            : null;

        return res.status(200).json(
            new ApiResponse(200, "Fetched saved code records with pagination", {
                items: paginatedResults,
                nextCursor,
                hasNext,
            })
        );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

export { updateUser, getUser, saveCodeProgress, getAllCodes };
