import Table from "./table.model.js";
import VipRoom from "./vip-room.model.js";
import Meal from "./meal.model.js";
import Reservation from "./reservation.model.js";
import Review from "./review.model.js";

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
    },
    openingHours: {
      type: String,
      required: true,
    },
    profileImage: {
      secure_url: String,
      public_id: String,
    },
    layoutImage: {
      secure_url: String,
      public_id: String,
    },
    galleryImages: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    ownedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, //  one-to-one relationship
    },
    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    categories: {
      type: [String],
      // enum: ["desserts", "drinks", "meals"],
      required: true,
    },
  },
  { timestamps: true },
);

restaurantSchema.pre("findOneAndDelete", async function (next) {
  const restaurantId = this.getQuery()._id;

  try {
    await Promise.all([
      Table.deleteMany({ restaurantId }),
      VipRoom.deleteMany({ restaurantId }),
      Meal.deleteMany({ restaurantId }),
      Reservation.deleteMany({ restaurantId }),
      Review.deleteMany({ restaurantId }),
    ]);
    next();
  } catch (error) {
    next(error);
  }
});

const Restaurant = model("Restaurant", restaurantSchema);
export default mongoose.models.Restaurant || Restaurant;
