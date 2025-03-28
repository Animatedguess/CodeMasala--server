import { Problem } from "../models/problem.model.js";
import { Solution } from "../models/solution.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//note:- 
//1. Name of the Solution and Problem may or may not be same

const sumbitSolution = async (req, res) => {
    try {
        const { title, tags, problemName, markdownContent } = req.body;

        if(title === undefined || problemName === undefined || tags === undefined || markdownContent === undefined) {
            res.status(400).json(new ApiResponse(400, "All fields are required"));
        }

        const problem = await Problem.findOne({title: problemName});
        const problemId = problem._id;

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

// Get a solution by title
const getSolution = async (req, res) => {
    try {
        const {title} = req.body;

        if(!title){
            return res.status(400).json(new ApiResponse(400, "Title is required"));
        }

        const solution = await Solution.findOne({title});

        if(!solution){
            return res.status(404).json(new ApiResponse(404, "Solution not found"));
        }

        return res.status(200).json(new ApiResponse(200, "Solution found", solution));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
    }
};

// Get all solutions of user
const getAllSolutions = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
    }
};

// Get all solutions of a problem
const filterAllSolutionsByName = async (req, res) => {
    try {
        const {title} = req.body;

        if(!title){
            return res.status(400).json(new ApiResponse(400, "Title is required"));
        }

        const problem = await Problem.findOne({title});

        if(!problem){
            return res.status(400).json(new ApiResponse(400, "Problem not found"));
        }

        const solutions = await Solution.find({problemId: problem._id});

        if(!solutions){
            return res.status(404).json(new ApiResponse(404, "No solution found"));
        }

        res.status(200).json(new ApiResponse(200, "All solutions", solutions));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
    }
};

export {
    sumbitSolution,
    deleteSolution,
    getSolution,
    getAllSolutions,
    filterAllSolutionsByName
};