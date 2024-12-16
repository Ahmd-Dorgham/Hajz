import mongoose from "mongoose";
const { Schema, model } = mongoose;

const mealSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      secure_url: String,
      public_id: String,
    },
    desc: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
  },
  { timestamps: true }
);

const Meal = model("Meal", mealSchema);
export default mongoose.models.Meal || Meal;
