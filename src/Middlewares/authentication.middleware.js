import jwt from "jsonwebtoken";
import User from "../../DB/Models/user.model.js";
import { ErrorClass } from "../Utils/error-class.utils.js";

export const auth = (allowedRoles) => {
  return async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
      return next(new ErrorClass("Token is required", 404, "Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(new ErrorClass("Unauthorized", 403, "Access denied"));
    }

    req.authUser = user;
    next();
  };
};
