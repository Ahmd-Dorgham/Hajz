import { Router } from "express";
import { multerHost, optionalUpload } from "../../Middlewares/multer.middleware.js";
import { extensions } from "../../Utils/file-extensions.utils.js";
import * as controller from "./user.controllers.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { auth } from "../../Middlewares/authentication.middleware.js";

const userRouter = Router();

userRouter.post("/signup", optionalUpload, errorHandler(controller.signUp));
userRouter.get("/verify/:token", errorHandler(controller.verifyEmail));
userRouter.get("/verify-status", errorHandler(controller.checkVerificationStatus));
userRouter.post("/signin", errorHandler(controller.signIn));
userRouter.put(
  "/update",
  auth(["user", "restaurantOwner"]),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  errorHandler(controller.updateUserProfile)
);

userRouter.patch("/change-password", auth(["user", "restaurantOwner"]), errorHandler(controller.changePassword));
userRouter.delete("/delete-account", auth(["user", "restaurantOwner"]), errorHandler(controller.deleteAccount));
userRouter.get("/profile", auth(["user", "restaurantOwner"]), errorHandler(controller.getUserProfile));

userRouter.post("/forgot-password", errorHandler(controller.forgotPassword));
//TODO: to be handled
userRouter.post("/reset-password", errorHandler(controller.resetPassword));

userRouter.post("/favorites/add", auth(["user"]), errorHandler(controller.addFavorite));

userRouter.post("/favorites/remove", auth(["user"]), errorHandler(controller.removeFavorite));

userRouter.get("/favorites", auth(["user"]), errorHandler(controller.getFavorites));

export { userRouter };
