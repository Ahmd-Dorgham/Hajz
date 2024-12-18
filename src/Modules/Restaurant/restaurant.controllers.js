import Restaurant from "../../../DB/Models/restaurant.model.js";
import { cloudinaryConfig } from "../../Utils/cloudinary.utils.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";

/**
 * @api {POST} /restaurants/create  Create a new restaurant
 */
export const createRestaurant = async (req, res, next) => {
  const { name, address, phone, openingHours } = req.body;

  if (!req.files || !req.files.profileImage || !req.files.layoutImage) {
    return next(new ErrorClass("Profile and layout images are required", 400));
  }
  const existingRestaurant = await Restaurant.findOne({ name, ownedBy: req.authUser._id });
  if (existingRestaurant) {
    return next(new ErrorClass("Restaurant with this name already exists", 400));
  }

  // Upload images to Cloudinary
  const { secure_url: profileSecureUrl, public_id: profilePublicId } = await cloudinaryConfig().uploader.upload(
    req.files.profileImage[0].path,
    {
      folder: "Restaurant/restaurantProfileImages",
    }
  );

  const { secure_url: layoutSecureUrl, public_id: layoutPublicId } = await cloudinaryConfig().uploader.upload(
    req.files.layoutImage[0].path,
    {
      folder: "Restaurant/restaurantLayoutImages",
    }
  );

  if (!req.files.galleryImages) {
    return next(new ErrorClass("galleryImages are required", 400));
  }

  const galleryImages = [];
  if (req.files.galleryImages) {
    for (const file of req.files.galleryImages) {
      const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(file.path, {
        folder: "Restaurant/restaurantGalleryImages",
      });
      galleryImages.push({ secure_url, public_id });
    }
  }

  // Create the restaurant
  const restaurantInstance = new Restaurant({
    name,
    address,
    phone,
    openingHours,
    profileImage: { secure_url: profileSecureUrl, public_id: profilePublicId },
    layoutImage: { secure_url: layoutSecureUrl, public_id: layoutPublicId },
    galleryImages,
    ownedBy: req.authUser._id,
  });
  const newRestaurant = await restaurantInstance.save();

  res.status(201).json({
    status: "success",
    message: "Restaurant created successfully",
    restaurant: newRestaurant,
  });
};

/**
 * @api {PUT} /restaurants/update/:id  Update a restaurant
 */

export const updateRestaurant = async (req, res, next) => {
  const { id } = req.params;
  const { name, address, phone, openingHours } = req.body;

  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    return next(new ErrorClass("Restaurant not found", 404));
  }

  if (restaurant.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized to update this restaurant", 403));
  }

  if (req.files) {
    if (req.files.profileImage) {
      if (restaurant.profileImage?.public_id) {
        await cloudinaryConfig().uploader.destroy(restaurant.profileImage.public_id);
      }
      const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.files.profileImage[0].path, {
        folder: "Restaurant/restaurantProfileImages",
      });
      restaurant.profileImage = { secure_url, public_id };
    }

    if (req.files.layoutImage) {
      if (restaurant.layoutImage?.public_id) {
        await cloudinaryConfig().uploader.destroy(restaurant.layoutImage.public_id);
      }
      const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.files.layoutImage[0].path, {
        folder: "Restaurant/restaurantLayoutImages",
      });
      restaurant.layoutImage = { secure_url, public_id };
    }

    if (req.files.galleryImages) {
      if (restaurant.galleryImages?.length) {
        for (const image of restaurant.galleryImages) {
          await cloudinaryConfig().uploader.destroy(image.public_id);
        }
      }
      restaurant.galleryImages = [];
      for (const file of req.files.galleryImages) {
        const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(file.path, {
          folder: "Restaurant/restaurantGalleryImages",
        });
        restaurant.galleryImages.push({ secure_url, public_id });
      }
    }
  }

  if (name) restaurant.name = name.trim();
  if (address) restaurant.address = address.trim();
  if (phone) restaurant.phone = phone.trim();
  if (openingHours) restaurant.openingHours = openingHours.trim();

  const updatedRestaurant = await restaurant.save();

  res.json({
    status: "success",
    message: "Restaurant updated successfully",
    restaurant: updatedRestaurant,
  });
};

/**
 * @api {DELETE} /restaurants/delete/:id  Delete a restaurant
 */
export const deleteRestaurant = async (req, res, next) => {
  const { id } = req.params;

  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    return next(new ErrorClass("Restaurant not found", 404));
  }

  if (restaurant.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized to delete this restaurant", 403));
  }

  if (restaurant.profileImage?.public_id) {
    await cloudinaryConfig().uploader.destroy(restaurant.profileImage.public_id);
  }
  if (restaurant.layoutImage?.public_id) {
    await cloudinaryConfig().uploader.destroy(restaurant.layoutImage.public_id);
  }
  if (restaurant.galleryImages?.length) {
    for (const image of restaurant.galleryImages) {
      await cloudinaryConfig().uploader.destroy(image.public_id);
    }
  }

  await Restaurant.findByIdAndDelete(id);

  res.json({
    status: "success",
    message: "Restaurant deleted successfully",
  });
};

/**
 * @api {GET} /restaurants/:id  Get a restaurant by ID
 */
export const getRestaurantById = async (req, res, next) => {
  const { id } = req.params;

  const restaurant = await Restaurant.findById(id).populate("ownedBy", "name email phone");
  if (!restaurant) {
    return next(new ErrorClass("Restaurant not found", 404));
  }
  if (!restaurant.ownedBy) {
    return next(new ErrorClass("Owner details not available", 404));
  }
  res.json({
    status: "success",
    message: "Restaurant fetched successfully",
    restaurant,
  });
};

/**
 * @api {GET} /restaurants  Get all restaurants
 */

export const getAllRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, name, address } = req.query;

    // Build query for filtering
    const query = {};
    if (name) query.name = { $regex: name, $options: "i" }; // Case-insensitive search
    if (address) query.address = { $regex: address, $options: "i" }; // Case-insensitive search

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch restaurants with filtering, pagination, and population
    const restaurants = await Restaurant.find(query)
      .populate("ownedBy", "name email phone") // Include owner details
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination metadata
    const totalRestaurants = await Restaurant.countDocuments(query);

    res.status(200).json({
      status: "success",
      message: "All restaurants fetched successfully",
      data: {
        restaurants,
        pagination: {
          total: totalRestaurants,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalRestaurants / limit),
        },
      },
    });
  } catch (error) {
    next(new ErrorClass("Failed to fetch restaurants", 500, error.message));
  }
};
