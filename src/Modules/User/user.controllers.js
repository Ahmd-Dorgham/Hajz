import { hashSync } from "bcrypt";
import bcrypt from "bcrypt";
import User from "../../../DB/Models/user.model.js";
import { cloudinaryConfig } from "../../Utils/cloudinary.utils.js";
import jwt from "jsonwebtoken";
import { transporter } from "../../Services/send-email.service.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";

export const signUp = async (req, res, next) => {
  const { email, password, name, phone, role } = req.body;

  if (!password) return next(new ErrorClass("Password is required", 400));
  if (!email) return next(new ErrorClass("Email is required", 400));

  const isEmailExists = await User.findOne({ email });
  if (isEmailExists) return next(new ErrorClass("Email already exists", 400));

  let image = null;
  if (req.file) {
    const uploadResult = await cloudinaryConfig().uploader.upload(req.file.path, {
      folder: "Restaurant/userProfilePictures",
    });
    image = {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
    };
  }

  const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
  const hashedPassword = hashSync(password, saltRounds);

  const userInstance = new User({
    email,
    password: hashedPassword,
    name,
    phone,
    role: role || undefined,
    image,
  });

  const token = jwt.sign({ _id: userInstance._id, email: userInstance.email }, process.env.CONFIRMATION_SECRET);

  await transporter.sendMail({
    to: email,
    subject: "Verify your Email ✔",
    html: `<a href='${process.env.DOMAIN}users/verify/${token}'>Click here to confirm your email</a>`,
  });

  const newUser = await userInstance.save();

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    user: newUser,
  });
};
/**
 * @api {GET} /users/verify/:token Verify user email
 */
export const verifyEmail = async (req, res, next) => {
  const token = req.params.token;

  const decoded = jwt.verify(token, process.env.CONFIRMATION_SECRET);

  const updatedUser = await User.findOneAndUpdate({ email: decoded.email }, { isConfirmed: true }, { new: true });

  if (!updatedUser) {
    return next(new ErrorClass("User not found or already verified", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Email confirmed successfully",
    user: updatedUser,
  });
};

/**
 * @api {GET} /users/verify-status Check user verification status
 */
export const checkVerificationStatus = async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return next(new ErrorClass("Email is required", 400));
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorClass("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      isConfirmed: user.isConfirmed,
      message: user.isConfirmed ? "Email is verified" : "Email is not verified",
    });
  } catch (error) {
    return next(error);
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorClass("Invalid credentials", 401));

  if (!user.isConfirmed) {
    return next(new ErrorClass("Please confirm your email before signing in", 401));
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) return next(new ErrorClass("Invalid credentials", 401));

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET
  );

  res.status(200).json({
    status: "success",
    message: "Signed in successfully",
    token,
    user,
  });
};

export const updateUserProfile = async (req, res, next) => {
  const { name, phone, email } = req.body;

  const userId = req.authUser._id;
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorClass("User not found", 404));
  }

  if (req.file) {
    try {
      if (user.image?.public_id) {
        await cloudinaryConfig().uploader.destroy(user.image.public_id);
      }

      const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.file.path, {
        folder: "Restaurant/userProfilePictures",
      });

      user.image = { secure_url, public_id };
    } catch (error) {
      return next(new ErrorClass("Image upload failed", 500, error.message));
    }
  }

  if (name) {
    user.name = name.trim();
  }
  if (phone) {
    user.phone = phone.trim();
  }
  if (email) {
    user.email = email.trim();
  }

  await user.save();

  const newToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET
  );

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    token: newToken,
    user,
  });
};
/**
 * @api {PATCH} /users/change-password Change Password
 */
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const userId = req.authUser._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorClass("User not found", 404, "User not found"));
  }

  const isMatch = bcrypt.compareSync(currentPassword, user.password);
  if (!isMatch) {
    return next(new ErrorClass("Invalid old password", 401, "Old password is incorrect"));
  }

  if (currentPassword === newPassword) {
    return next(new ErrorClass("New password cannot be the same as the old password", 400));
  }

  user.password = hashSync(newPassword, Number(process.env.SALT_ROUNDS) || 10);
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
    userId: user._id,
  });
};
/**
 * @api {DELETE} /users/delete-account Delete Account
 */
export const deleteAccount = async (req, res, next) => {
  const userId = req.authUser._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorClass("User not found", 404, "No user found with this ID"));
  }

  if (user.image?.public_id) {
    await cloudinaryConfig().uploader.destroy(user.image.public_id);
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    status: "success",
    message: "Your account has been deleted successfully",
  });
};
/**
 * @api {GET} /users/profile Get User Profile
 */
export const getUserProfile = async (req, res, next) => {
  const userId = req.authUser._id;

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return next(new ErrorClass("User not found", 404, "No user found with this ID"));
  }

  res.status(200).json({
    status: "success",
    user,
  });
};
/**
 * @api {POST} /users/forgot-password Forgot Password
 */
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorClass("User not found", 404, "No user found with this email"));
  }

  const resetToken = jwt.sign(
    { userId: user._id },
    process.env.RESET_SECRET
    // { expiresIn: "15m" }
  );

  await transporter.sendMail({
    to: email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset. Click the link below to reset your password:</p>
           <a href='${process.env.FRONT_END_DOMAIN}/#/users/reset-password?token=${resetToken}'>Reset Password</a>
           <p>If you did not request this, please ignore this email.</p>`,
  });

  res.status(200).json({
    status: "success",
    message: "Password reset link has been sent to your email",
  });
};
/**
 * @api {POST} /users/reset-password Reset Password
 */
export const resetPassword = async (req, res, next) => {
  const { resetToken, newPassword } = req.body;

  const decoded = jwt.verify(resetToken, process.env.RESET_SECRET);

  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(new ErrorClass("Invalid token or user not found", 404, "Invalid token or user not found"));
  }

  user.password = hashSync(newPassword, Number(process.env.SALT_ROUNDS) || 10);
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password has been reset successfully",
  });
};
/**
 * @api {POST} /users/favorites/add add favorite restaurant
 */
export const addFavorite = async (req, res, next) => {
  const { restaurantId } = req.body;
  const userId = req.authUser._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorClass("User not found", 404));
  }

  if (user.favorites.includes(restaurantId)) {
    return res.status(400).json({
      status: "error",
      message: "Restaurant already in favorites",
    });
  }

  user.favorites.push(restaurantId);
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Restaurant added to favorites",
    data: user.favorites,
  });
};
/**
 * @api {POST} /users/favorites/remove to remove from favorites
 */
export const removeFavorite = async (req, res, next) => {
  const { restaurantId } = req.body;
  const userId = req.authUser._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorClass("User not found", 404));
  }

  if (!user.favorites.includes(restaurantId)) {
    return res.status(400).json({
      status: "error",
      message: "Restaurant not in favorites",
    });
  }

  user.favorites = user.favorites.filter((id) => id.toString() !== restaurantId);
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Restaurant removed from favorites",
    data: user.favorites,
  });
};
/**
 * @api {GET} /users/favorites/ to get all favorites for a user
 */
export const getFavorites = async (req, res, next) => {
  const userId = req.authUser._id;

  const user = await User.findById(userId).populate("favorites");
  console.log(user);
  if (!user) {
    return next(new ErrorClass("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Favorites retrieved successfully",
    data: user.favorites,
  });
};
