import mongoose from "mongoose";
const { Schema, model } = mongoose;

const reservationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    mealId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Meal",
      },
    ],
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["reserved", "canceled", "completed"],
      default: "reserved",
    },
  },
  { timestamps: true }
);

const Reservation = model("Reservation", reservationSchema);
export default mongoose.models.Reservation || Reservation;
