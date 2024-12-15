import { Router } from "express";
import { auth } from "../../Middlewares/authentication.middleware.js";
import * as controllers from "./table.controllers.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";

const tableRouter = Router();

tableRouter.post("/create", auth(), errorHandler(controllers.createTable));

tableRouter.put("/update/:id", auth(), controllers.updateTable);

tableRouter.delete("/delete/:id", auth(), controllers.deleteTable);

tableRouter.get("/restaurant/:restaurantId", controllers.getAllTablesForRestaurant);

tableRouter.get("/:id", controllers.getSpecificTable);

export { tableRouter };
