import { ErrorClass } from "../Utils/error-class.utils.js";

export const errorHandler = (API) => {
  return (req, res, next) => {
    API(req, res, next)?.catch((err) => {
      console.log("Error in async handler scope", err);
      next(new ErrorClass(err.message || "Internal Server Error", err.status || 500, null, null, err.stack));
    });
  };
};

export const globalResponse = (err, req, res, next) => {
  if (err) {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
      errorData: err.data || null,
      location: err.location || "Unknown",
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }
};
