import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        reason: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            enum: [
                "problem",
                "solution",
                "submission",
                "user",
                "discussion",
                "reply"
            ],
            required: true,
        },
        reportId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// -----------------------------------
// export
// -----------------------------------
export const Report = mongoose.model("Report", reportSchema);