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

const deleteProblem = async (req, res) => {
    try {
        // const {title} = req.body;
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
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

const getProblem = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json(new ApiResponse(400, "Title is required"));
        }

        const problem = await Problem.findOne({ title });

        if (!problem) {
            return res.status(404).json(new ApiResponse(404, "Problem statement not found"));
        }

        return res.status(200).json(new ApiResponse(200, "Problem statement found", problem));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error.message || "Internal Server Error"));
    }
};


export {
    uploadProblem,
    deleteProblem,
    getAllProblems,
    filterAllProblems,
    getProblem
};