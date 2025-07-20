import mongoose, { Schema } from "mongoose";

const testCaseSchema = new Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
  },
  { timestamps: true }
);

const problemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    constraints: {
      type: String,
    },
    testCases: [
      {
        type: Schema.Types.ObjectId,
        ref: "Test",
      },
    ],
    exampleProblemTestCase: [
      {
        input: {
          type: String,
          required: true,
          // Example: "2 3"
        },
        output: {
          type: String,
          required: true,
          // Example: "5"
        },
        explanation: {
          type: String,
          // Example: "The sum of 2 and 3 is 5."
        },
      },
    ],
    starterCode: String,
  },
  { timestamps: true }
);

export const Problem = mongoose.model("Problem", problemSchema);
export const Test = mongoose.model("Test", testCaseSchema);