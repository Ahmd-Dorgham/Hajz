import Restaurant from "../../../DB/Models/restaurant.model.js";
import { cloudinaryConfig } from "../../Utils/cloudinary.utils.js";
import VipRoom from "../../../DB/Models/vip-room.model.js";
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

  const images = [];
  if (req.files?.images) {
    for (const file of req.files.images) {
      const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(file.path, {
        folder: "Restaurant/vipRoomImages",
      });
      images.push({ secure_url, public_id });
    }
  }

  const vipRoomInstance = new VipRoom({
    restaurantId,
    name,
    capacity,
    images,
  });

  const newVipRoom = await vipRoomInstance.save();

  // 6. Send success response
  res.status(201).json({
    status: "success",
    message: "VIP Room created successfully",
    vipRoom: newVipRoom,
  });
};

/**
 * @api {PUT} /vip-rooms/update/:id  Update a VIP Room
 */

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

    const images = [];
    for (const file of req.files.images) {
      const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(file.path, {
        folder: "Restaurant/vipRoomImages",
      });
      images.push({ secure_url, public_id });
    }
    vipRoom.images = images; // Update images array
  }

  await vipRoom.save();

  res.status(200).json({
    status: "success",
    message: "VIP Room updated successfully",
    vipRoom,
  });
};

/**
 * @api {DELETE} /vip-rooms/delete/:id  Delete a VIP Room
 */
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
/**
 * @api {GET} /vip-rooms/restaurant/:restaurantId  Get all VIP Rooms for a Restaurant
 */
export const getVipRoomsByRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;

  const vipRooms = await VipRoom.find({ restaurantId });

  res.status(200).json({
    status: "success",
    message: "VIP Rooms retrieved successfully",
    count: vipRooms.length,
    vipRooms,
  });
};

/**
 * @api {GET} /vip-rooms/:id  Get a Specific VIP Room
 */
export const getVipRoomById = async (req, res, next) => {
  const { id } = req.params;

  const vipRoom = await VipRoom.findById(id).populate("restaurantId", "name address phone");

  if (!vipRoom) {
    return next(new ErrorClass("VIP Room not found", 404, "Invalid VIP Room ID"));
  }

  res.status(200).json({
    status: "success",
    message: "VIP Room retrieved successfully",
    vipRoom,
  });
};
