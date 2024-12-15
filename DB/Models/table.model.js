import mongoose from "mongoose";
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
      unique: true,
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
  },
  { timestamps: true }
);

const Table = model("Table", tableSchema);
export default mongoose.models.Table || Table;
