import mongoose from "mongoose";
const { Schema, model } = mongoose;

const vipRoomSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    images: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

const VipRoom = model("VipRoom", vipRoomSchema);
export default mongoose.models.VipRoom || VipRoom;
