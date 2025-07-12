import mongoose, { Schema } from "mongoose";

// -----------------------------
// Problem Progress Schema
// -----------------------------
const problemProgressSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User', // reference the model name
    required: true,
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  language_id: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// -----------------------------
// Location Schema
// -----------------------------
const locationSchema = new Schema({
  country: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  district: {
    type: String,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// -----------------------------
// User Schema
// -----------------------------
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    savedCodes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ProblemProgress',
      },
    ],
    judge0ApiKey: {
      type: String,
      default: "NONE",
    },
    gender: {
      type: String,
      enum: ["M", "F", "Other"],
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    birthday: {
      type: String,
    },
    summary: {
      type: String,
      trim: true,
    },
    website: [
      {
        type: String,
        trim: true,
      },
    ],
    skillset: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// -----------------------------
// Model Exports
// -----------------------------
export const User = mongoose.model("User", userSchema);
export const ProblemProgress = mongoose.model("ProblemProgress", problemProgressSchema);
export const Location = mongoose.model("Location", locationSchema);
