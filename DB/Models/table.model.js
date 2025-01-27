import mongoose from "mongoose";
import Reservation from "./reservation.model.js";

const { Schema, model } = mongoose;

const tableSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    tableNumber: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["available", "reserved"],
      default: "available",
    },
    reservationDetails: {
      date: { type: String }, // e.g., "2024-12-15"
      time: { type: String }, // e.g., "4:00 PM"
    },
    image: {
      secure_url: String,
      public_id: String,
    },
  },
  { timestamps: true }
);

tableSchema.pre("findOneAndDelete", async function (next) {
  const tableId = this.getQuery()._id;

  await Reservation.deleteMany({ tableId });

  next();
});

const Table = model("Table", tableSchema);
export default mongoose.models.Table || Table;
