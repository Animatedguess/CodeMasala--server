import mongoose, { Schema } from "mongoose";

// ---------------------------
// Problem Model
// ---------------------------
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
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
      }
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
    functionName: String,
  },
  { timestamps: true }
);

// exporting models
export const Problem = mongoose.model("Problem", problemSchema);