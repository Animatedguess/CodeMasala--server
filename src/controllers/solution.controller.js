import { Problem } from "../models/problem.model.js";
import { Solution } from "../models/solution.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// --------------------------------------------
// crud operations on solution model
// --------------------------------------------
const createSolution = async (req, res) => {
    const { title, tags, problemId, markdownContent } = req.body;

    if(!title || !tags || !problemId || !markdownContent){
        return res.status(400).json(new ApiError(400, "All fields are required"));
    }

    try {
        const exitSolution = await Solution.findOne({
            author: req.user._id,
            title: title.trim(),
            problemId
        });

        if(exitSolution){
            return res.status(400).json(new ApiError(400, "Solution already exists"));
        }

        const solution = await Solution.create({
            title,
            problemId,
            tags,
            markdownContent,
            author: req.user._id,
        });

        if(!solution){
            return res.status(500).json(new ApiError(500, "Something went wrong"));
        }

        return res.status(201).json(new ApiResponse(201, "Solution submitted successfully", solution));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const updateSolution = async (req, res) => {
    const {solutionId} = req.params;
    const { title, tags, markdownContent } = req.body;

    if(!solutionId){
        return res.status(400).json(new ApiError(400, "Solution ID is required"));
    }

    if(!title.trim() || !tags.trim() || !markdownContent.trim()){
        return res.status(400).json(new ApiError(400, "All fields are required"));
    }

    try {
        const solution = await Solution.findById(solutionId);

        if(!solution){
            return res.status(404).json(new ApiError(404, "Solution not found"));
        }

        if(solution.author.toString() !== req.user._id.toString()){
            return res.status(403).json(new ApiError(403, "You are not authorized to update this solution"));
        }

        if(title.trim() !== solution.title) solution.title = title.trim();
        if(tags.trim() !== solution.tags) solution.tags = tags.trim();
        if(markdownContent.trim() !== solution.markdownContent) solution.markdownContent = markdownContent.trim();

        await solution.save();

        return res.status(200).json(new ApiResponse(200, "Solution updated successfully", solution));
    }
    catch (error) {
        return res.status(500).json(new ApiError(500, error?.message || "Internal Server Error"));
    }
}

const deleteSolution = async (req, res) => {
    const {solutionId} = req.params;

    if(!solutionId){
        return res.status(400).json(new ApiError(400, "Solution ID is required"));
    }

    try {
        const solution = await Solution.findById(solutionId);

        if(!solution){
            return res.status(404).json(new ApiError(404, "Solution not found"));
        }

        if(solution.author.toString() !== req.user._id.toString()){
            return res.status(403).json(new ApiError(403, "You are not authorized to delete this solution"));
        }
        
        await solution.remove();

        return res.status(200).json(new ApiResponse(200, "Solution deleted successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const getSolution = async (req, res) => {
    const {solutionId} = req.params;

    if(!solutionId){
        return res.status(400).json(new ApiError(400, "Solution ID is required"));
    }

    try {
        const solution = await Solution.findById(solutionId);

        if(!solution){
            return res.status(404).json(new ApiError(404, "Solution not found"));
        }

        return res.status(200).json(new ApiResponse(200, "Solution found", solution));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};

const getAllSolutions = async (req, res) => {
    const {problemId} = req.params;
    try {
        
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error.statusCode || 500, error.message || "Internal Server Error"));
    }
};

// --------------------------------------------
// feedback
// --------------------------------------------
const updateLike = async (req, res) => {
    const {solutionId} = req.params;

    if(!solutionId){
        return res.status(400).json(new ApiError(400, "Solution ID is required"));
    }

    try {
        const solution = await Solution.findById(solutionId);

        if(!solution){
            return res.status(404).json(new ApiError(404, "Solution not found"));
        }

        if(solution.likes.includes(req.user._id)){
            solution.likes.pull(req.user._id);
        }
        else{
            solution.likes.push(req.user._id);
        }
        await solution.save();

        return res.status(200).json(new ApiResponse(200, "Solution liked successfully", solution));
    }
    catch (error) {
        return res.status(500).json(new ApiError(500, error?.message || "Internal Server Error"));
    }
};


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


// --------------------------------------------
// export
// --------------------------------------------
export {
    createSolution,
    updateSolution,
    deleteSolution,
    getSolution,
    getAllSolutions,

    updateLike,

    filterAllSolutionsByName
};