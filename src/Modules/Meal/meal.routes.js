import { Router } from "express";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { extensions } from "../../Utils/file-extensions.utils.js";
import * as controllers from "./meal.controllers.js";
import { systemRoles } from "../../Utils/systemRoles.js";

const mealRouter = Router();

mealRouter.post(
  "/create",
  auth([systemRoles.restaurantOwner]),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  errorHandler(controllers.createMeal)
);
mealRouter.put(
  "/update/:id",
  auth([systemRoles.restaurantOwner]),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  errorHandler(controllers.updateMeal)
);

mealRouter.delete("/delete/:id", auth([systemRoles.restaurantOwner]), errorHandler(controllers.deleteMeal));

mealRouter.get("/restaurant/:restaurantId", errorHandler(controllers.getAllMealsForRestaurant));

mealRouter.get("/:id", errorHandler(controllers.getMealById));
export { mealRouter };
