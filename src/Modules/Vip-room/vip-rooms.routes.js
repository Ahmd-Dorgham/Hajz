import { Router } from "express";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { extensions } from "../../Utils/file-extensions.utils.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import * as controllers from "./vip-rooms.controllers.js";

const vipRoomRouter = Router();
vipRoomRouter.post(
  "/create",
  auth(),
  multerHost({ allowedExtensions: extensions.Images }).fields([{ name: "images", maxCount: 5 }]),
  controllers.createVipRoom
);
vipRoomRouter.patch(
  "/update/:id",
  auth(),
  multerHost({ allowedExtensions: extensions.Images }).fields([{ name: "images", maxCount: 5 }]),
  controllers.updateVipRoom
);

vipRoomRouter.delete("/delete/:id", auth(), controllers.deleteVipRoom);

vipRoomRouter.get("/restaurant/:restaurantId", controllers.getVipRoomsByRestaurant);

vipRoomRouter.get("/:id", controllers.getVipRoomById);

export { vipRoomRouter };
