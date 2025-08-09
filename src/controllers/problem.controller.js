import mongoose from "mongoose";

import { Problem } from "../models/problem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// problem statement
const uploadProblem = async (req, res) => {
    try {
        const { title, description, difficulty, tags, testCases, constraints } = req.body;

        if(!title || !description || !difficulty || !tags || !testCases || !constraints){
            throw new ApiError(400, "All fields are required");
        }

        // validate problem statement
        const exitProblemStatement = await Problem.findOne({
            $or: [
                {title},
                {description}
            ]
        });

        if(exitProblemStatement){
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
            constraints
        });

        if(!problem){
            throw new ApiError(500, "Something went wrong");
        }

        res.status(201).json(new ApiResponse(201, "Problem statement created successfully", problem));
    } catch (error) {
        console.log(error.statusCode || 500, error.message || "Internal Server Error");
    }
};

const getAllProblems = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
    }
};

const filterAllProblems = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
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
    constraints = "",
    exampleProblemTestCase = [],
    starterCode,
    testCases,
    functionName
  } = req.body;

  if ([title, description, difficulty].some(field => typeof field !== 'string' || field.trim() === "")) {
    return res.status(400).json(
      new ApiError(400, "All fields are required and must be non-empty strings: title, description, difficulty")
    );
  }

  if(constraints.trim()===""){
    return res.status(400).json(
        new ApiError(400, "You didn't provided any constraints for problem")
    );
  }

  if(exampleProblemTestCase.length==0){
    return res.status(400).json(
        new ApiError(400, "Provide at one example test case.")
    );
  }

  if(testCases.length<=2){
    return res.status(400).json(
        new ApiError(400, "Problem should be have atleast more then 2 testcases")
    );
  }

  try {
    const existingProblem = await Problem.findOne({ title: title.trim() });

    if (existingProblem) {
      return res.status(400).json(
        new ApiResponse(400, "A problem with this title already exists in the database")
      );
    }

    const problem = await Problem.create({
      title: title.trim(),
      description: description.trim(),
      difficulty: difficulty.trim().toLowerCase(),
      tags,
      constraints: constraints.trim(),
      exampleProblemTestCase: exampleProblemTestCase.map(tc => ({
        input: tc.input?.trim(),
        output: tc.output?.trim(),
        explanation: tc.explanation?.trim() || ""
      })),
      testCases: testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput?.trim()
      })),
      starterCode,
      functionName
    });

    if (!problem) {
      return res.status(500).json(new ApiError(500, "Something went wrong while saving to the database"));
    }

    return res.status(201).json(
      new ApiResponse(201, "Problem statement successfully created", problem)
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, error?.message));
  }
};

const getProblem = async (req, res) => {
    const { problem_id } = req.params;

    if (!problem_id) {
        return res.status(400).json(
            new ApiError(400, "Problem ID is required")
        );
    }

    try {
        const problem = await Problem.findById(problem_id)
            .populate("testCases")
            .exec();

        if (!problem) {
            return res.status(404).json(
                new ApiError(404, "No problem found with the provided ID")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, "Problem fetched successfully", problem)
        );
    } catch (error) {
        console.error(error);
        return res.status(500).json(
            new ApiError(500, error?.message || "Internal Server Error")
        );
    }
};

const updateProblem = async (req, res) => {
    const {
        problem_id,
        title,
        description,
        difficulty,
        tags = [],
        constraints = "",
        exampleProblemTestCase = [],
        starterCode
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
        if (title) updates.title = title.trim();
        if (description) updates.description = description.trim();
        if (difficulty) updates.difficulty = difficulty.toLowerCase();
        if (tags.length > 0) updates.tags = tags;
        if (constraints) updates.constraints = constraints;
        if (Array.isArray(exampleProblemTestCase)) updates.exampleProblemTestCase = exampleProblemTestCase;
        if (starterCode) updates.starterCode = starterCode;

        const updatedProblem = await Problem.findByIdAndUpdate(
            problem_id,
            updates,
            { new: true, runValidators: true }
        );

        return res.status(200).json(
            new ApiResponse(200, "Successfully updated problem", updatedProblem)
        );
    } catch (error) {
        console.log(error?.message);
        return res.status(500).json(new ApiError(500, error?.message));
    }
};

const deleteProblem = async (req, res) => {
    const { problem_id } = req.body;

    if (!problem_id) {
        return res.status(400).json(
            new ApiError(400, "Problem ID is required")
        );
    }

    try {
        const problem = await Problem.findById(problem_id);

        if (!problem) {
            return res.status(404).json(
                new ApiError(404, "No problem found with the provided ID")
            );
        }

        await Problem.deleteOne({ _id: problem_id });

        return res.status(200).json(
            new ApiResponse(200, "Successfully deleted the problem")
        );

    } catch (error) {
        console.error(error);
        return res.status(500).json(
            new ApiError(500, error?.message || "Internal Server Error")
        );
    }
};

export {
    uploadProblem,
    deleteProblem,
    getAllProblems,
    filterAllProblems,
    getProblem,
    createProblem,
    updateProblem
};