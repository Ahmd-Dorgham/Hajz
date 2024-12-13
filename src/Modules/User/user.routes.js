import { Router } from "express";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { extensions } from "../../Utils/file-extensions.utils.js";
import * as controller from "./user.controllers.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";

const userRouter = Router();

userRouter.post("/signup", multerHost({ allowedExtensions: extensions.Images }).single("image"), controller.signUp);

userRouter.get("/verify/:token", controller.verifyEmail);

userRouter.post("/signin", controller.signIn);

userRouter.put(
  "/update",
  auth(),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  controller.updateUserProfile
);

userRouter.patch("/change-password", auth(), errorHandler(controller.changePassword));
// TODO: Solve it with the FE
// userRouter.post("/forgot-password", errorHandler(controller.forgotPassword));
// userRouter.post("/reset-password", errorHandler(controller.resetPassword));

userRouter.delete("/delete-account", auth(), errorHandler(controller.deleteAccount));

export { userRouter };
