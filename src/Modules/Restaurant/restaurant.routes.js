import { Router } from "express";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { extensions } from "../../Utils/file-extensions.utils.js";
import * as controllers from "./restaurant.controllers.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { systemRoles } from "../../Utils/systemRoles.js";

const restaurantRouter = Router();

restaurantRouter.post(
  "/create",
  auth([systemRoles.restaurantOwner]),
  multerHost({ allowedExtensions: extensions.Images }).fields([
    { name: "profileImage", maxCount: 1 },
    { name: "layoutImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  errorHandler(controllers.createRestaurant)
);
restaurantRouter.put(
  "/update/:id",
  auth([systemRoles.restaurantOwner]),
  multerHost({ allowedExtensions: extensions.Images }).fields([
    { name: "profileImage", maxCount: 1 },
    { name: "layoutImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  errorHandler(controllers.updateRestaurant)
);

restaurantRouter.get("/search", errorHandler(controllers.searchRestaurantsByCategory));
// GET /restaurants/search?categories=desserts,drinks&page=1&limit=5

restaurantRouter.delete("/delete/:id", auth([systemRoles.restaurantOwner]), errorHandler(controllers.deleteRestaurant));

restaurantRouter.get("/:id", errorHandler(controllers.getRestaurantById));

restaurantRouter.get("/", errorHandler(controllers.getAllRestaurants));

restaurantRouter.get("/owner/:ownerId", errorHandler(controllers.getRestaurantsByOwnerId));

export { restaurantRouter };
