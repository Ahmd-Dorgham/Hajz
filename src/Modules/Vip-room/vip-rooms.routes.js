import { Router } from "express";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { extensions } from "../../Utils/file-extensions.utils.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import * as controllers from "./vip-rooms.controllers.js";
import { systemRoles } from "../../Utils/systemRoles.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";

const vipRoomRouter = Router();
vipRoomRouter.post(
  "/create",
  auth([systemRoles.restaurantOwner]),
  multerHost({ allowedExtensions: extensions.Images }).fields([{ name: "images", maxCount: 5 }]),
  errorHandler(controllers.createVipRoom)
);
vipRoomRouter.patch(
  "/update/:id",
  auth([systemRoles.restaurantOwner]),
  multerHost({ allowedExtensions: extensions.Images }).fields([{ name: "images", maxCount: 5 }]),
  errorHandler(controllers.updateVipRoom)
);

vipRoomRouter.delete("/delete/:id", auth([systemRoles.restaurantOwner]), errorHandler(controllers.deleteVipRoom));

vipRoomRouter.get("/restaurant/:restaurantId", errorHandler(controllers.getVipRoomsByRestaurant));

vipRoomRouter.get("/:id", errorHandler(controllers.getVipRoomById));

export { vipRoomRouter };
