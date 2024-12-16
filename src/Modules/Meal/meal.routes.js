import { Router } from "express";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { extensions } from "../../Utils/file-extensions.utils.js";
import * as controllers from "./meal.controllers.js";

const mealRouter = Router();

mealRouter.post(
  "/create",
  auth(),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  errorHandler(controllers.createMeal)
);
mealRouter.put(
  "/update/:id",
  auth(),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  controllers.updateMeal
);

mealRouter.delete("/delete/:id", auth(), controllers.deleteMeal);

mealRouter.get("/restaurant/:restaurantId", controllers.getAllMealsForRestaurant);

mealRouter.get("/:id", controllers.getMealById);
export { mealRouter };
