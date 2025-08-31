import mongoose,{Schema} from "mongoose";

const submissionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    language_id: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);
