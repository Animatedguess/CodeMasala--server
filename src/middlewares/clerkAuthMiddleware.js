import clerkClient from "@clerk/clerk-sdk-node";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

// Initialize Clerk
// const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const requireAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token with Clerk
    const payload = await clerkClient.verifyToken(token);

    if (!payload || !payload.sub) {
      return res.status(401).json(new ApiError(401, "Unauthorized", error.message));
    }

    // Attach user details to req.user
    req.user = await clerkClient.users.getUser(payload.sub);

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json(new ApiError(401, "Unauthorized", error.message));
  }
};

export { requireAuthMiddleware };
