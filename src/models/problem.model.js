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
    createdAt: {
        type: Date,
        default: Date.now,
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
});

// ---------------------------
// Discussion Model
// ---------------------------
const discussionSchema = new Schema(
    {
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        typeDiscussion: {
            type: String,
            enum: ["feedback", "ask question", "tip"],
            default: "feedback",
        },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        reply: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Reply",
            },
        ],
        isDelete: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// ---------------------------
// Problem Model
// ---------------------------
const problemSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
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
            type: [String],
            required: true,
        },

        testCases: [
            {
                input: {
                    type: [mongoose.Schema.Types.Mixed], // allows numbers, strings, arrays
                    required: true,
                },
                expectedOutput: {
                    type: String,
                    required: true,
                },
            },
        ],

        exampleProblemTestCase: [
            {
                input: {
                    type: String,
                    required: true,
                },
                output: {
                    type: String,
                    required: true,
                },
                explanation: {
                    type: String,
                    default: "",
                },
            },
        ],

        starterCode: {
            type: Map, // e.g. { "python": "def add(a, b):\n    return 0", "javascript": "function add(a,b){ return 0; }" }
            of: String,
            required: true,
        },
        functionName: {
            type: String,
            required: true,
        },
        supportedLanguages: [
            {
                name: { type: String, required: true }, // e.g. "Python 3"
                language_id: { type: Number, required: true }, // Judge0 language ID
            },
        ],

        discussions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Discussion"
            }
        ],
    },
    { timestamps: true }
);

// exporting models
export const Reply = mongoose.model("Reply", replySchema);
export const Discussion = mongoose.model("Discussion", discussionSchema);
export const Problem = mongoose.model("Problem", problemSchema);
