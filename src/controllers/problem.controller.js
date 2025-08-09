import mongoose from "mongoose";

import { Problem } from "../models/problem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// problem statement
const uploadProblem = async (req, res) => {
  try {
    const { title, description, difficulty, tags, testCases, constraints } =
      req.body;

    if (
      !title ||
      !description ||
      !difficulty ||
      !tags ||
      !testCases ||
      !constraints
    ) {
      throw new ApiError(400, "All fields are required");
    }

    // validate problem statement
    const exitProblemStatement = await Problem.findOne({
      $or: [{ title }, { description }],
    });

    if (exitProblemStatement) {
      throw new ApiError(400, "Problem statement already exists");
    }

    const newDifficulty = difficulty.toLowerCase();

    // create problem statement
    const problem = await Problem.create({
      title,
      description,
      difficulty: newDifficulty,
      tags,
      testCases,
      constraints,
    });

    if (!problem) {
      throw new ApiError(500, "Something went wrong");
    }

    res
      .status(201)
      .json(
        new ApiResponse(201, "Problem statement created successfully", problem)
      );
  } catch (error) {
    console.log(
      error.statusCode || 500,
      error.message || "Internal Server Error"
    );
  }
};

const getAllProblems = async (req, res) => {
  try {
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse(
          500,
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const filterAllProblems = async (req, res) => {
  try {
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse(
          500,
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

// ----------------------------------------------
// crud operations on problem model
// ----------------------------------------------

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags = [],
    constraints = [],
    exampleProblemTestCase = [],
    starterCode = {},
    testCases = [],
    supportedLanguages = [],
    functionName = "",
  } = req.body;

  // Basic validation
  if (
    [title, description, difficulty].some(
      (field) => typeof field !== "string" || field.trim() === ""
    )
  ) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "title, description, difficulty are required and must be non-empty strings"
        )
      );
  }

  if (!Array.isArray(tags)) {
    return res
      .status(400)
      .json(new ApiError(400, "Tags must be an array of strings"));
  }

  if (!Array.isArray(constraints)) {
    return res.status(400).json(new ApiError(400, "Constraints are required"));
  }

  if (
    !Array.isArray(exampleProblemTestCase) ||
    exampleProblemTestCase.length === 0
  ) {
    return res
      .status(400)
      .json(new ApiError(400, "Provide at least one example test case"));
  }

  if (!Array.isArray(testCases) || testCases.length <= 2) {
    return res
      .status(400)
      .json(new ApiError(400, "Problem should have more than 2 test cases"));
  }

  if (typeof starterCode !== "object" || Array.isArray(starterCode)) {
    return res
      .status(400)
      .json(
        new ApiError(400, "starterCode must be an object of language:code")
      );
  }

  if (typeof supportedLanguages !== "object") {
    return res
      .status(400)
      .json(new ApiError(400, "supportedlanguage must be an array of objects"));
  }

  if (typeof functionName !== "string" || Array.isArray(functionName)) {
    return res
      .status(400)
      .json(new ApiError(400, "functionName must be an string"));
  }

  try {
    const existingProblem = await Problem.findOne({ title: title.trim() });

    if (existingProblem) {
      return res
        .status(400)
        .json(new ApiResponse(400, "A problem with this title already exists"));
    }

    const problem = await Problem.create({
      title: title.trim(),
      description: description.trim(),
      difficulty: difficulty.trim().toLowerCase(),
      tags,
      constraints,
      exampleProblemTestCase: exampleProblemTestCase.map((tc) => ({
        input: String(tc.input || "").trim(),
        output: String(tc.output || "").trim(),
        explanation: String(tc.explanation || "").trim(),
      })),
      testCases: testCases.map((tc) => ({
        input: Array.isArray(tc.input) ? tc.input : [tc.input],
        expectedOutput: String(tc.expectedOutput || "").trim(),
      })),
      supportedLanguages: supportedLanguages.map((sl) => ({
        name: String(sl.name || "").trim(),
        language_id: sl.language_id,
      })),
      starterCode,
      functionName: functionName.trim(),
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Problem created successfully", problem));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiError(500, error?.message || "Internal server error"));
  }
};

const getProblem = async (req, res) => {
  const { problem_id } = req.params;

  if (!problem_id) {
    return res.status(400).json(new ApiError(400, "Problem ID is required"));
  }

  try {
    const problem = await Problem.findById(problem_id)
      .populate("testCases")
      .exec();

    if (!problem) {
      return res
        .status(404)
        .json(new ApiError(404, "No problem found with the provided ID"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Problem fetched successfully", problem));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiError(500, error?.message || "Internal Server Error"));
  }
};

const updateProblem = async (req, res) => {
  const {
    problem_id,
    title,
    description,
    difficulty,
    tags,
    constraints,
    exampleProblemTestCase,
    starterCode,
    testCases,
    supportedLanguages,
    functionName,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(problem_id)) {
    return res.status(400).json(new ApiError(400, "Invalid problem ID"));
  }

  try {
    const problem = await Problem.findById(problem_id);
    if (!problem) {
      return res.status(404).json(new ApiError(404, "Problem not found"));
    }

    const updates = {};

    if (typeof title === "string" && title.trim()) updates.title = title.trim();
    if (typeof description === "string" && description.trim())
      updates.description = description.trim();
    if (
      typeof difficulty === "string" &&
      ["easy", "medium", "hard"].includes(difficulty.toLowerCase())
    )
      updates.difficulty = difficulty.toLowerCase();
    if (Array.isArray(tags)) updates.tags = tags;
    if (typeof constraints === "string") updates.constraints = constraints;
    if (Array.isArray(exampleProblemTestCase))
      updates.exampleProblemTestCase = exampleProblemTestCase;
    if (Array.isArray(testCases)) updates.testCases = testCases;
    if (Array.isArray(supportedLanguages))
      updates.supportedLanguages = supportedLanguages;
    if (starterCode && typeof starterCode === "object")
      updates.starterCode = starterCode;
    if (typeof functionName === "string") updates.functionName = functionName;

    const updatedProblem = await Problem.findByIdAndUpdate(
      problem_id,
      updates,
      { new: true, runValidators: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Successfully updated problem", updatedProblem)
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiError(500, error?.message || "Server error"));
  }
};

const deleteProblem = async (req, res) => {
  const { problem_id } = req.body;

  if (!problem_id) {
    return res.status(400).json(new ApiError(400, "Problem ID is required"));
  }

  try {
    const problem = await Problem.findById(problem_id);

    if (!problem) {
      return res
        .status(404)
        .json(new ApiError(404, "No problem found with the provided ID"));
    }

    await Problem.deleteOne({ _id: problem_id });

    return res
      .status(200)
      .json(new ApiResponse(200, "Successfully deleted the problem"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, error?.message || "Internal Server Error"));
  }
};

export {
  uploadProblem,
  deleteProblem,
  getAllProblems,
  filterAllProblems,
  getProblem,
  createProblem,
  updateProblem,
};
