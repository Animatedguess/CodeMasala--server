import { Problem } from "../models/problem.model.js";
import { Solution } from "../models/solution.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const sumbitSolution = async (req, res) => {
    try {
        const { title, tags, markdownContent } = req.body;

        if(title === undefined || tags === undefined || markdownContent === undefined) {
            res.status(400).json(new ApiResponse(400, "All fields are required"));
        }

        const problemId = await Problem.findOne({title});

        if(!problemId){
            res.status(400).json(new ApiResponse(400, "Problem not found"));
        }

        const exitSolution = await Solution.findOne({
            $and: [
                {title},
                {problemId},
                // {userId}
            ]
        });

        if(exitSolution){
            res.status(400).json(new ApiResponse(400, "Solution already exists"));
        }

        const solution = await Solution.create({
            title,
            problemId,
            tags,
            markdownContent,
            // author: userId,
        });

        res.status(201).json(new ApiResponse(201, "Solution submitted successfully", solution));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
    }
};

const deleteSolution = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
    }
};

const getSolution = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
    }
};

const getAllSolutions = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
    }
};

const filterAllSolutions = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
    }
};

export {
    sumbitSolution,
    deleteSolution,
    getSolution,
    getAllSolutions,
    filterAllSolutions
};