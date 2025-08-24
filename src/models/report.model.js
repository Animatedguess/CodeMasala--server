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
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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