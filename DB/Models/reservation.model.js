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
        meal: {
          type: Schema.Types.ObjectId,
          ref: "Meal",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
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
