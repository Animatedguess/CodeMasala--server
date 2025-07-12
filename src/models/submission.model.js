import mongoose,{Schema} from "mongoose";

const submissionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User who submitted
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem", // Reference to the Problem
      required: true,
    },
    language_id: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);
