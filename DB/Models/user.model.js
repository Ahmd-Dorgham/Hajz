import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minLength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    image: {
      type: {
        public_id: { type: String, default: null },
        secure_url: { type: String, default: null },
      },
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || model("User", userSchema);
export default User;
