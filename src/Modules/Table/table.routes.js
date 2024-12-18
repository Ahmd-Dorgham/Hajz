import { Router } from "express";
import { auth } from "../../Middlewares/authentication.middleware.js";
import * as controllers from "./table.controllers.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { systemRoles } from "../../Utils/systemRoles.js";

const tableRouter = Router();

tableRouter.post("/create", auth([systemRoles.restaurantOwner]), errorHandler(controllers.createTable));

tableRouter.put("/update/:id", auth([systemRoles.restaurantOwner]), errorHandler(controllers.updateTable));

tableRouter.delete("/delete/:id", auth([systemRoles.restaurantOwner]), errorHandler(controllers.deleteTable));

tableRouter.get("/restaurant/:restaurantId", errorHandler(controllers.getAllTablesForRestaurant));

tableRouter.get("/:id", errorHandler(controllers.getSpecificTable));

export { tableRouter };
