import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import { ApiError } from "../utils/ApiError.js";


export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized request: No token provided"));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded?._id) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized request: Invalid token payload"));
    }

    // Find user, excluding sensitive fields
    const user = await User.findById(decoded._id).select(
      "-password -refresh_token"
    );

    if (!user) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized request: User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res
      .status(401)
      .json(new ApiError(401, "Unauthorized request: Invalid token"));
  }
};