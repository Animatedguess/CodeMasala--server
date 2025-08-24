import mongoose from "mongoose";
import { Report } from "../models/report.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createReport = async (req, res) => {
    const { reason, model, reportId } = req.body;

    if ([reason, model, reportId].some((item) => !item || !item.trim())) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    "reason, model and reportId are required fields"
                )
            );
    }

    if (
        ![
            "problem",
            "solution",
            "submission",
            "user",
            "discussion",
            "reply",
        ].includes(model.trim().toLowerCase())
    ) {
        return res.status(400).json(new ApiError(400, "Invalid model"));
    }

    try {
        const existingReport = await Report.findOne({
            userId: req.user.id,
            reportId: reportId,
            model: model,
            reason: reason,
        });

        if (existingReport) {
            return res
                .status(400)
                .json(new ApiError(400, "Report already exists"));
        }

        const report = await Report.create({
            reason,
            model,
            reportId,
            userId: req.user.id,
        });

        // removing sensitive data from report
        const reportObject = report.toObject();
        delete reportObject.userId;
        delete reportObject.__v;

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Report created successfully",
                    reportObject
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error.message || "Something went wrong"));
    }
};

const getAllReports = async (req, res) => {
    const { model } = req.query;
    const isUser = req.query.isUser === "true";

    if (!model || !model.trim()) {
        return res.status(400).json(new ApiError(400, "model is required"));
    }

    if (
        ![
            "problem",
            "solution",
            "submission",
            "user",
            "discussion",
            "reply",
        ].includes(model.trim().toLowerCase())
    ) {
        return res.status(400).json(new ApiError(400, "Invalid model"));
    }

    try {
        if (isUser) {
            const reports = await Report.aggregate([
                // Stage 1: Find all reports by the logged-in user
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(req.user.id),
                    },
                },

                // Stage 2: Sort the reports by date BEFORE grouping
                {
                    $sort: {
                        createdAt: -1,
                    },
                },

                // Stage 3 - Group the reports by the 'model' field
                {
                    $group: {
                        _id: "$model",
                        count: { $sum: 1 },
                        reports: {
                            $push: {
                                _id: "$_id",
                                reason: "$reason",
                                reportId: "$reportId",
                                createdAt: "$createdAt",
                            },
                        },
                    },
                },

                // Stage 4 - Reshape the output for better readability
                {
                    $project: {
                        _id: 0,
                        model: "$_id",
                        count: 1,
                        reports: 1,
                    },
                },

                // Stage 5 - Optional sort for the final groups
                {
                    $sort: {
                        model: 1,
                    },
                },
            ]);

            if (reports.length === 0) {
                return res
                    .status(404)
                    .json(new ApiError(404, "User reports not found"));
            }

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        "User reports fetched successfully",
                        reports
                    )
                );
        } else {
            const reports = await Report.aggregate([
                // Stage 1: Match reports for a specific model
                {
                    $match: {
                        model: model.trim().toLowerCase(),
                    },
                },

                // Stage 2: Sort reports chronologically before grouping
                {
                    $sort: {
                        createdAt: -1,
                    },
                },

                // Stage 3: Populate the user who made the report
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
                    },
                },

                // Stage 4: Deconstruct the user array (handle cases where user might not be found)
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true, // Keep report even if user was deleted
                    },
                },

                // Stage 5 - Group documents by user
                {
                    $group: {
                        _id: "$user._id", // The field to group by (the user's ID)
                        username: { $first: "$user.username" }, // Get the username for the group
                        totalReports: { $sum: 1 }, // Count the number of reports in the group
                        reports: {
                            // Create an array of this user's reports
                            $push: {
                                // Push a custom object with only the details you need
                                reportId: "$_id",
                                reason: "$reason",
                                reportedContentId: "$reportId",
                                createdAt: "$createdAt",
                            },
                        },
                    },
                },

                // Stage 6 - Sort the groups to show most active reporters first
                {
                    $sort: {
                        totalReports: -1,
                    },
                },

                // Stage 7 - Reshape the final output for clarity
                {
                    $project: {
                        _id: 0,
                        user: {
                            _id: "$_id",
                            username: "$username",
                        },
                        totalReports: 1,
                        reports: 1,
                    },
                },
            ]);

            if (reports.length === 0) {
                return res
                    .status(404)
                    .json(new ApiError(404, "Reports not found"));
            }

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        "Reports fetched successfully",
                        reports
                    )
                );
        }
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, error.message || "Something went wrong"));
    }
};

export { createReport, getAllReports };
