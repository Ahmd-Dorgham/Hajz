import { hashSync } from "bcrypt";
import bcrypt from "bcrypt";
import User from "../../../DB/Models/user.model.js";
import { cloudinaryConfig } from "../../Utils/cloudinary.utils.js";
import jwt from "jsonwebtoken";
import { transporter } from "../../Services/send-email.service.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";

/**
 * @api {POST} /users/signup  signUp a new user
 */
export const signUp = async (req, res, next) => {
  const { email, password, name, phone } = req.body;

  const isEmailExists = await User.findOne({ email });
  if (isEmailExists) {
    return next(new Error("Email already exists"));
  }
  if (!req.file) {
    return next(new Error("Please upload the profile picture"));
  }

  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.file.path, {
    folder: "Restaurant/userProfilePictures",
  });

  const userInstance = new User({
    email,
    password: hashSync(password, +process.env.SALT_ROUNDS),
    name,
    phone,
    image: {
      public_id,
      secure_url,
    },
  });

  const token = jwt.sign({ _id: userInstance._id, email: userInstance.email }, process.env.CONFIRMATION_SECRET);

  await transporter.sendMail({
    to: email,
    subject: "Verify your Email ✔",
    html: `<a href='http://localhost:3000/users/verify/${token}'>Click here to confirm your email</a>`,
  });

  const newUser = await userInstance.save();

  res.status(201).json({ message: "User created", user: newUser });
};

/**
 * @api {GET} /users/verify/:token  Verify user email
 */
export const verifyEmail = async (req, res, next) => {
  const token = req.params.token;

  const decoded = jwt.verify(token, process.env.CONFIRMATION_SECRET);

  const updatedUser = await User.findOneAndUpdate({ email: decoded.email }, { isConfirmed: true }, { new: true });

  if (!updatedUser) {
    return next(new Error("User not found or already verified"));
  }

  res.json({ message: "Email confirmed successfully", user: updatedUser });
};

/**
 * @api {POST} /users/signin  Sign in the user
 */
export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorClass("Invalid credentials", 401, "Invalid credentials"));
  }

  if (!user.isConfirmed) {
    return next(new ErrorClass("Please confirm your email before signing in", 401, "Email not confirmed"));
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return next(new ErrorClass("Invalid credentials", 401, "Invalid credentials"));
  }

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Signed in successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      isConfirmed: user.isConfirmed,
    },
  });
};

/**
 * @api {PUT} /users/update  update user data-->(name,phone,image)
 */
export const updateUserProfile = async (req, res, next) => {
  const { name, phone, email } = req.body;

  const userId = req.authUser._id;
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorClass("User not found", 404, "User not found"));
  }

  if (req.file) {
    if (user.image?.public_id) {
      await cloudinaryConfig().uploader.destroy(user.image.public_id);
    }

    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.file.path, {
      folder: "Restaurant/userProfilePictures",
    });

    user.image.secure_url = secure_url;
    user.image.public_id = public_id;
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

  // Generate a new token after updating the profile
  const newToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    status: "success",
    message: "Profile updated successfully",
    token: newToken,
    user,
  });
};
/**
 * @api {PATCH} /users/change-password  change password
 */
export const changePassword = async (req, res, next) => {
  const { password, newPassword } = req.body;

  const userId = req.authUser._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorClass("User not found", 404, "User not found"));
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return next(new ErrorClass("Invalid old password", 401, "Old password is incorrect"));
  }

  if (password === newPassword) {
    return next(new ErrorClass("New password cannot be the same as the old password", 400));
  }

  user.password = hashSync(newPassword, +process.env.SALT_ROUNDS);
  await user.save();

  res.json({
    status: "success",
    message: "Password changed successfully",
    userId: user._id,
  });
};
// TODO: Solve it with the FE
/**
 * @api {POST} /users/forgot-password  Forgot Password
 */
// export const forgotPassword = async (req, res, next) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return next(new ErrorClass("User not found", 404, "No user found with this email"));
//     }

//     // Generate a reset token
//     const resetToken = jwt.sign(
//       { userId: user._id },
//       process.env.RESET_SECRET,
//       { expiresIn: "15m" } // Token valid for 15 minutes
//     );

//     await transporter.sendMail({
//       to: email,
//       subject: "Password Reset Request",
//       html: `<p>You requested a password reset. Click the link below to reset your password:</p>
//              <a href='http://localhost:3000/users/reset-password/${resetToken}'>Reset Password</a>
//              <p>If you did not request this, please ignore this email.</p>`,
//     });

//     res.json({
//       status: "success",
//       message: "Password reset link has been sent to your email",
//     });
//   } catch (err) {
//     next(err);
//   }
// };
// TODO: Solve it with the FE
// /**
//  * @api {POST} /users/reset-password  Reset Password
//  */
// export const resetPassword = async (req, res, next) => {
//   const { resetToken, newPassword } = req.body;

//   // Verify the reset token
//   const decoded = jwt.verify(resetToken, process.env.RESET_SECRET);

//   const user = await User.findById(decoded.userId);
//   if (!user) {
//     return next(new ErrorClass("Invalid token or user not found", 404, "Invalid token or user not found"));
//   }

//   user.password = hashSync(newPassword, +process.env.SALT_ROUNDS);
//   await user.save();

//   res.json({
//     status: "success",
//     message: "Password has been reset successfully",
//   });
// };

/**
 * @api {DELETE} /users/delete-account  Delete Account
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

  res.json({
    status: "success",
    message: "Your account has been deleted successfully",
  });
};
/**
 * @api {GET} /users/profile  Get User Profile
 */
export const getUserProfile = async (req, res, next) => {
  const userId = req.authUser._id;

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return next(new ErrorClass("User not found", 404, "No user found with this ID"));
  }

  res.json({
    status: "success",
    user,
  });
};
