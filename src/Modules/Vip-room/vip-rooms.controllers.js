import Restaurant from "../../../DB/Models/restaurant.model.js";
import VipRoom from "../../../DB/Models/vip-room.model.js";
import { cloudinaryConfig } from "../../Utils/cloudinary.utils.js";
import { ErrorClass } from "../../Utils/error-class.utils.js"; // Assuming ErrorClass is a custom utility

const uploadImagesToCloudinary = async (files, folder) => {
  const uploadedImages = [];
  for (const file of files) {
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(file.path, {
      folder,
    });
    uploadedImages.push({ secure_url, public_id });
  }
  return uploadedImages;
};

export const createVipRoom = async (req, res, next) => {
  const { restaurantId, name, capacity } = req.body;

  if (!restaurantId || !name || !capacity) {
    return next(new ErrorClass("Missing required fields", 400, "All fields are required"));
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return next(new ErrorClass("Restaurant not found", 404, "Invalid restaurant ID"));
  }

  if (restaurant.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized", 403, "You are not the owner of this restaurant"));
  }

  const images = req.files?.images ? await uploadImagesToCloudinary(req.files.images, "Restaurant/vipRoomImages") : [];

  const vipRoomInstance = new VipRoom({ restaurantId, name, capacity, images });
  const newVipRoom = await vipRoomInstance.save();

  res.status(201).json({
    status: "success",
    message: "VIP Room created successfully",
    data: newVipRoom,
  });
};
export const updateVipRoom = async (req, res, next) => {
  const { id } = req.params; // VIP Room ID
  const { name, capacity } = req.body;

  const vipRoom = await VipRoom.findById(id).populate("restaurantId");
  if (!vipRoom) {
    return next(new ErrorClass("VIP Room not found", 404, "Invalid VIP Room ID"));
  }

  if (vipRoom.restaurantId.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized", 403, "You are not the owner of this restaurant"));
  }

  if (name) vipRoom.name = name.trim();
  if (capacity) vipRoom.capacity = Number(capacity);

  if (req.files?.images) {
    for (const image of vipRoom.images) {
      await cloudinaryConfig().uploader.destroy(image.public_id);
    }

    vipRoom.images = await uploadImagesToCloudinary(req.files.images, "Restaurant/vipRoomImages");
  }

  const updatedVipRoom = await vipRoom.save();

  res.status(200).json({
    status: "success",
    message: "VIP Room updated successfully",
    data: updatedVipRoom,
  });
};
export const deleteVipRoom = async (req, res, next) => {
  const { id } = req.params;

  const vipRoom = await VipRoom.findById(id).populate("restaurantId");
  if (!vipRoom) {
    return next(new ErrorClass("VIP Room not found", 404, "Invalid VIP Room ID"));
  }

  if (vipRoom.restaurantId.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized", 403, "You are not the owner of this restaurant"));
  }

  if (vipRoom.images?.length) {
    for (const image of vipRoom.images) {
      await cloudinaryConfig().uploader.destroy(image.public_id);
    }
  }

  await VipRoom.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: "VIP Room deleted successfully",
  });
};
export const getVipRoomsByRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const vipRooms = await VipRoom.find({ restaurantId })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    status: "success",
    message: "VIP Rooms retrieved successfully",
    count: vipRooms.length,
    data: vipRooms,
  });
};
export const getVipRoomById = async (req, res, next) => {
  const { id } = req.params;

  const vipRoom = await VipRoom.findById(id).populate("restaurantId", "name address phone");

  if (!vipRoom) {
    return next(new ErrorClass("VIP Room not found", 404, "Invalid VIP Room ID"));
  }

  res.status(200).json({
    status: "success",
    message: "VIP Room retrieved successfully",
    data: vipRoom,
  });
};
