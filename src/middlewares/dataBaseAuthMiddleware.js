import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const dataBaseAuthMiddleware = async (req, res, next) => {
    try {
        // Attach user Database details to req.userDa
        const userDa = await User.findOne({ clerkId: req.user.id });
        if (!userDa) {
            return res.status(403).json(new ApiError(403, "Unauthorized", "User didn't have any record in DataBase"));
        }
        req.userDa = userDa;

        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json(new ApiError(401, "Unauthorized", error.message));
    }
}

export {
    dataBaseAuthMiddleware
}