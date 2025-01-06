import mongoose from "mongoose";
import { systemRoles } from "../../src/Utils/systemRoles.js";
import Restaurant from "./restaurant.model.js";
import Table from "./table.model.js";
import VipRoom from "./vip-room.model.js";
import Meal from "./meal.model.js";
import Reservation from "./reservation.model.js";
import Review from "./review.model.js";
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
      unique: true,
    },
    isConfirmed: {
      type: Boolean,
      default: true,
    },
    image: {
      type: {
        public_id: { type: String, default: null },
        secure_url: { type: String, default: null },
      },
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(systemRoles),
      default: systemRoles.user,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const userId = this.getQuery()._id;

    const relatedRestaurant = await Restaurant.findOneAndDelete({ ownedBy: userId });
    if (relatedRestaurant) {
      const restaurantId = relatedRestaurant._id;
      await Promise.all([
        Table.deleteMany({ restaurantId }),
        VipRoom.deleteMany({ restaurantId }),
        Meal.deleteMany({ restaurantId }),
        Reservation.deleteMany({ restaurantId }),
        Review.deleteMany({ restaurantId }),
      ]);
    }

    await Promise.all([Reservation.deleteMany({ userId }), Review.deleteMany({ userId })]);

    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.models.User || model("User", userSchema);
export default User;
