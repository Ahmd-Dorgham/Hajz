import { Router } from "express";
import { auth } from "../../Middlewares/authentication.middleware.js";
import * as controllers from "./table.controllers.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { systemRoles } from "../../Utils/systemRoles.js";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { extensions } from "../../Utils/file-extensions.utils.js";

const tableRouter = Router();

tableRouter.post(
  "/create",
  auth([systemRoles.restaurantOwner]),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  errorHandler(controllers.createTable)
);
tableRouter.put(
  "/update/:id",
  auth([systemRoles.restaurantOwner]),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  errorHandler(controllers.updateTable)
);
tableRouter.delete("/delete/:id", auth([systemRoles.restaurantOwner]), errorHandler(controllers.deleteTable));

tableRouter.get("/restaurant/:restaurantId", errorHandler(controllers.getAllTablesForRestaurant));

tableRouter.get("/:id", errorHandler(controllers.getSpecificTable));

export { tableRouter };
