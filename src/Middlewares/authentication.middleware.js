import jwt from "jsonwebtoken";
import User from "../../DB/Models/user.model.js";

export const auth = () => {
  return async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
      return next(new ErrorClass("Token is required", 404, "Authentication token missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token using `id`

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new ErrorClass("User not found", 404, "User not found"));
      }

      req.authUser = user; // Attach the authenticated user to `req`
      next();
    } catch (err) {
      return next(new ErrorClass("Invalid or expired token", 401, "Invalid or expired token"));
    }
  };
};
