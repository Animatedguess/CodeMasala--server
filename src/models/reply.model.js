import mongoose, { Schema } from "mongoose";

// ---------------------------
// reply model
// ---------------------------
const replySchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    discussionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Discussion",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ]
},
{
    timestamps: true,
}
);


// Exporting model
export const Reply = mongoose.model("Reply", replySchema);