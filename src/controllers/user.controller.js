import clerkClient from "@clerk/clerk-sdk-node";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { generateUsername } from "../utils/generateUsername.js";

// note:-
// 1. req.user --> to access the data from Clerk Database
// 2. req.userDa --> to access the data from MangoDB Database

const createUser = async (req, res) => {
    try {
        const user = req.user;
        const { firstName, lastName, avatar } = req.body;

        if (!firstName && !lastName) {
            return res.status(401).json(new ApiError(401, "error", "At least one field (firstName or lastName) is required"));
        }

        let username = generateUsername(firstName || user.firstName, lastName || user.lastName, user.emailAddresses[0].emailAddress);
        
        // Ensure username is unique
        let isUnique = false;
        while (!isUnique) {
            const existUsername = await User.findOne({ username: username });
            if (!existUsername) {
                isUnique = true;
            } else {
                // Regenerate username
                username = generateUsername(firstName || user.firstName, lastName || user.lastName, user.emailAddresses[0].emailAddress);
            }
        }

        // checking user Exited or not
        const existUser = await User.findOne({
            clerkId: user.id
        });
        if(existUser){
            return res.status(401).json(new ApiError(401, "Error", "User is already existed in Database"));
        }

        // user created
        const createUser = await User.create({
            clerkId: user.id,
            avatar: avatar || user.imageUrl,
            firstName: firstName || user.firstName || "",
            lastName: lastName || user.lastName || "",
            email: user.emailAddresses[0].emailAddress,
            username: username,
        });

        if (!createUser) {
            return res.status(200).json(new ApiError(500, "error", "something wrong happend in DataBase"));
        }
        res.status(200).json(new ApiResponse(200, "User details fetched successfully", createUser));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error, error.message));
    }
};

const defaultCreateUser = async (req, res) => {
    const user = req.user;
    const username = generateUsername(user.firstName, user.lastName, user.emailAddresses[0].emailAddress);
    const createUser = await User.create({
        clerkId: user.id,
        avatar:  user.imageUrl,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0].emailAddress,
        username: username,
    });

    if (!createUser) {
        return res.status(200).json(new ApiError(500, "error", "something wrong happend in DataBase"));
    }
    res.status(200).json(new ApiResponse(200, "User details fetched successfully", createUser));
}

const getUser = async (req, res) => {
    try {
        const user = req.userDa;
        console.log(user);

        if(!user){
            res.status(400).json(new ApiError(400, "Error", "user did have any record in DataBase"));
        }

        return res.status(200).json(new ApiResponse(200, "Successfully fetched data from database", user));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message, error));
    }
}

const updateFirstName = async (req, res) => {
    const {firstName} = req.user;
}

export {
    createUser,
    getUser,
    updateFirstName,
    defaultCreateUser
};