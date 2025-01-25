import { Router } from "express";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import * as controller from "./review.controllers.js";

const reviewRouter = Router();

reviewRouter.post(
  "/create",
  auth(["user"]),
  errorHandler(controller.createReview),
);
reviewRouter.put(
  "/update/:id",
  auth(["user"]),
  errorHandler(controller.updateReview),
);
reviewRouter.delete(
  "/delete/:id",
  auth(["user"]),
  errorHandler(controller.deleteReview),
);

reviewRouter.get(
  "/restaurant/:restaurantId",
  errorHandler(controller.getAllReviewsForRestaurant),
);

export { reviewRouter };
