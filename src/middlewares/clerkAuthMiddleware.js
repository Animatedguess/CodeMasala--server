import { requireAuth } from "@clerk/express";

// Middleware to check if user is authenticated
const requireAuthMiddleware = requireAuth();

// Middleware to check if user has a specific role (e.g., "admin")
const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const { sessionClaims } = req.auth;
      if (!sessionClaims) return res.status(401).json({ error: "Unauthorized" });

      // Extract role from Clerk's `sessionClaims`
      const userRole = sessionClaims.publicMetadata?.role;

      if (!userRole || userRole !== role) {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }

      next(); // User has the required role, proceed
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

export { requireAuthMiddleware, requireRole };
