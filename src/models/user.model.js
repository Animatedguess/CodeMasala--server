import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// -----------------------------
// Problem Progress Schema
// -----------------------------
const problemProgressSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
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
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: {
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
                ref: "ProblemProgress",
            },
        ],
        judge0ApiKey: {
            type: String,
            default: null,
            unique: true,
            sparse: true,
        },
        gender: {
            type: String,
            enum: ["M", "F", "Other"],
        },
        location: {
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
        },
        birthday: {
            date: {
                type: Number,
                min: 1,
                max: 31,
            },
            month: {
                type: Number,
                min: 1,
                max: 12,
            },
            year: {
                type: Number,
                min: 1900,
                max: new Date().getFullYear(),
            },
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
        refresh_token: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// ------------------------------
// userSchema hooks
// ------------------------------
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // stoping each time password hashing

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// ------------------------------
// userSchema methods
// ------------------------------
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

// -----------------------------
// Model Exports
// -----------------------------
export const User = mongoose.model("User", userSchema);
export const ProblemProgress = mongoose.model(
    "ProblemProgress",
    problemProgressSchema
);
