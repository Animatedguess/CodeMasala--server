import clerkClient from "@clerk/clerk-sdk-node";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { generateUsername } from "../utils/generateUsername.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// note:-
// 1. req.user --> to access the data from Clerk Database
// 2. req.userDa --> to access the data from MangoDB Database

const createUser = async (req, res) => {
    try {
        const user = req.user;
        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        const { firstName, lastName } = req.body;

        // Ensure at least one name field is provided
        if (!firstName && !lastName && !avatarLocalPath) {
            return res.status(StatusCodes.BAD_REQUEST).json(
                new ApiError(StatusCodes.BAD_REQUEST, "At least one field (firstName or lastName or avatar) is required")
            );
        }

        // Check if user already exists
        const existUser = await User.findOne({ clerkId: user.id });
        if (existUser) {
            return res.status(StatusCodes.CONFLICT).json(
                new ApiError(StatusCodes.CONFLICT, "User already exists in the database")
            );
        }

        let avatarUrl = user.avatar;
        if (avatarLocalPath) {
            const avatar = await uploadOnCloudinary(avatarLocalPath);
            if (!avatar) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, "Failed to upload avatar to Cloudinary")
                );
            }
            avatarUrl = avatar.secure_url;
        }

        // Generate a unique username
        let username;
        do {
            username = generateUsername(
                firstName || user.firstName,
                lastName || user.lastName,
                user.emailAddresses[0].emailAddress
            );
        } while (await User.findOne({ username }));

        // Create new user
        const newUser = await User.create({
            clerkId: user.id,
            avatar: avatarUrl || user.imageUrl,
            firstName: firstName || user.firstName || "",
            lastName: lastName || user.lastName || "",
            email: user.emailAddresses[0].emailAddress,
            username: username,
        });

        if (!newUser) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
                new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong in the database")
            );
        }

        return res.status(StatusCodes.CREATED).json(
            new ApiResponse(StatusCodes.CREATED, "User created successfully", newUser)
        );
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error)
        );
    }
};

const defaultCreateUser = async (req, res) => {
    try {
        const user = req.user;

        // Ensure user data exists
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json(
                new ApiError(StatusCodes.BAD_REQUEST, "User data is missing")
            );
        }

        // Generate a unique username
        let username;
        do {
            username = generateUsername(user.firstName, user.lastName, user.emailAddresses[0].emailAddress);
        } while (await User.findOne({ username }));

        // Create new user
        const newUser = await User.create({
            clerkId: user.id,
            avatar: user.imageUrl,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.emailAddresses[0].emailAddress,
            username: username,
        });

        if (!newUser) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
                new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create user in the database")
            );
        }

        return res.status(StatusCodes.CREATED).json(
            new ApiResponse(StatusCodes.CREATED, "User created successfully", newUser)
        );
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error)
        );
    }
};

const getUser = async (req, res) => {
    try {
        const user = req.userDa;
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json(
                new ApiError(StatusCodes.NOT_FOUND, "User not found in the database")
            );
        }

        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, "User data retrieved successfully", user)
        );
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error)
        );
    }
};

const updateDetails = async (req, res) => {
    try {
        const { firstName, lastName, username, judge0ApiKey } = req.body;
        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        const user = req.userDa;

        // Check if at least one field is provided for update
        if (!firstName && !lastName && !username && !judge0ApiKey && !avatarLocalPath) {
            return res.status(StatusCodes.BAD_REQUEST).json(
                new ApiError(StatusCodes.BAD_REQUEST, "At least one field is required to update user information")
            );
        }

        let avatarUrl = user.avatar;
        if (avatarLocalPath) {
            const avatar = await uploadOnCloudinary(avatarLocalPath);
            if (!avatar) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    new ApiError(StatusCodes.BAD_REQUEST, "Failed to upload avatar to Cloudinary")
                );
            }
            avatarUrl = avatar.secure_url;
        }

        // Prepare the update object dynamically
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (username) updateData.username = username;
        if (avatarUrl !== user.avatar) updateData.avatar = avatarUrl;
        if (judge0ApiKey) updateData.judge0ApiKey = judge0ApiKey;

        const updatedUser = await User.findByIdAndUpdate(user._id, { $set: updateData }, { new: true });

        if (!updatedUser) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
                new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update user in the database")
            );
        }

        // Update user info in Clerk
        const updateClerkUser = await clerkClient.users.updateUser(user.clerkId, {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            imageUrl: updatedUser.avatar,
        });

        if (!updateClerkUser) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
                new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update user in Clerk Database")
            );
        }

        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, "User information successfully updated", updatedUser)
        );
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error)
        );
    }
};

const userData = async (req, res) => {
    res.status(200).json(
        new ApiResponse(
            200,
            "successfully fetched user data for api",
            {
                "_id": "64df2fa034f029d6a1f4cfa1",
                "username": "kailash_agarwal",
                "email": "kailash@example.com",
                "firstName": "Kailash",
                "lastName": "Agarwal",
                "avatar": "https://example.com/avatar.jpg",
                "savedCodes": [
                    {
                        "_id": "64df308f17aa39d7b1f4d203",
                        "owner": "64df2fa034f029d6a1f4cfa1",
                        "problemId": "64df30c1d7aa40a7b1f4d210",
                        "language_id": 54,
                        "code": "#include <stdio.h>\nint main() { printf(\"Hello World\"); return 0; }",
                        "submittedAt": "2024-07-11T12:00:00.000Z"
                    }
                ],
                "judge0ApiKey": "NONE",
                "gender": "M",
                "location": {
                    "_id": "64df310e67aa4cd8b1f4d220",
                    "country": "India",
                    "state": "Maharashtra",
                    "district": "Pune",
                    "owner": "64df2fa034f029d6a1f4cfa1"
                },
                "birthday": "2000-01-01",
                "summary": "Full-stack developer with a love for solving problems.",
                "website": [
                    "https://kailash.dev",
                    "https://github.com/kailash"
                ],
                "skillset": [
                    "React",
                    "Node.js",
                    "MongoDB",
                    "TypeScript"
                ],
                "createdAt": "2024-07-01T10:00:00.000Z",
                "updatedAt": "2024-07-11T13:00:00.000Z",
                "__v": 0
            }
        )
    )
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const {
      name,
      gender,
      country,
      state,
      district,
      date,
      month,
      year,
      summary,
      website,
      skillsets,
      judge0ApiKey
    } = req.body;

    const updates = {};

    if (name?.trim()) updates.name = name.trim();
    if (gender) updates.gender = gender;

    if (country || state || district) {
      updates.location = {};
      if (country?.trim()) updates.location.country = country.trim();
      if (state?.trim()) updates.location.state = state.trim();
      if (district?.trim()) updates.location.district = district.trim();
    }

    if (date || month || year) {
      updates.birthday = {};
      if (date) updates.birthday.date = parseInt(date);
      if (month) updates.birthday.month = parseInt(month);
      if (year) updates.birthday.year = parseInt(year);
    }

    if (summary?.trim()) updates.summary = summary.trim();

    if (Array.isArray(website)) {
      updates.website = website.map((link) => link.trim()).filter(Boolean);
    }

    if (Array.isArray(skillsets)) {
      updates.skillset = skillsets.map((skill) => skill.trim()).filter(Boolean);
    }

    if (typeof judge0ApiKey === "string" && judge0ApiKey.trim()) {
      updates.judge0ApiKey = judge0ApiKey.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(new ApiError(400, "No valid fields to update"));
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password -refresh_token");

    return res.status(200).json(
      new ApiResponse(200, "User profile updated successfully", updatedUser)
    );
  } catch (error) {
    console.error("Update Error:", error);

    // Handle unique constraint error for judge0ApiKey
    if (error.code === 11000 && error.keyPattern?.judge0ApiKey) {
      return res.status(400).json(new ApiError(400, "Judge0 API key already in use"));
    }

    return res.status(500).json(
      new ApiError(500, error?.message || "Internal Server Error")
    );
  }
};

export {
    createUser,
    getUser,
    updateDetails,
    defaultCreateUser, 
    userData,
    updateUser
};