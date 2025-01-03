import Meal from "../../../DB/Models/meal.model.js";
import Restaurant from "../../../DB/Models/restaurant.model.js";
import User from "../../../DB/Models/user.model.js";
import { cloudinaryConfig } from "../../Utils/cloudinary.utils.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";

/**
 * @api {POST} /restaurants/create  Create a new restaurant
 */
export const createRestaurant = async (req, res, next) => {
  const { name, address, phone, openingHours, categories } = req.body;

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return next(new ErrorClass("Categories are required and should be an array", 400));
  }

  const allowedCategories = ["desserts", "drinks", "meals"];
  const invalidCategories = categories.filter((category) => !allowedCategories.includes(category));
  if (invalidCategories.length > 0) {
    return next(new ErrorClass(`Invalid categories: ${invalidCategories.join(", ")}`, 400));
  }

  if (!req.files || !req.files.profileImage || !req.files.layoutImage) {
    return next(new ErrorClass("Profile and layout images are required", 400));
  }

  const existingRestaurant = await Restaurant.findOne({
    ownedBy: req.authUser._id,
  });

  if (existingRestaurant) {
    return next(new ErrorClass("You already own a restaurant. Each owner can only have one restaurant.", 400));
  }

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

  const galleryImages = [];
  if (req.files.galleryImages) {
    for (const file of req.files.galleryImages) {
      const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(file.path, {
        folder: "Restaurant/restaurantGalleryImages",
      });
      galleryImages.push({ secure_url, public_id });
    }
  }

  const restaurantInstance = new Restaurant({
    name,
    address,
    phone,
    openingHours,
    categories,
    profileImage: { secure_url: profileSecureUrl, public_id: profilePublicId },
    layoutImage: { secure_url: layoutSecureUrl, public_id: layoutPublicId },
    galleryImages,
    ownedBy: req.authUser._id,
  });

  const newRestaurant = await restaurantInstance.save();

  // Update the user's restaurant key with the restaurant ID
  await User.findByIdAndUpdate(req.authUser._id, { restaurant: newRestaurant._id }, { new: true });

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
  const { name, address, phone, openingHours, categories } = req.body;

  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    return next(new ErrorClass("Restaurant not found", 404));
  }

  if (restaurant.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized to update this restaurant", 403));
  }

  if (categories) {
    if (!Array.isArray(categories) || categories.length === 0) {
      return next(new ErrorClass("Categories should be an array", 400));
    }

    const allowedCategories = ["desserts", "drinks", "meals"];
    const invalidCategories = categories.filter((category) => !allowedCategories.includes(category));
    if (invalidCategories.length > 0) {
      return next(new ErrorClass(`Invalid categories: ${invalidCategories.join(", ")}`, 400));
    }

    restaurant.categories = categories;
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

  await Restaurant.findOneAndDelete({ _id: id });

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
 * @api {GET} /restaurants/search Search for restaurants by category
 */
export const searchRestaurantsByCategory = async (req, res, next) => {
  const { categories, page = 1, limit = 10 } = req.query;

  if (!categories) {
    return next(new ErrorClass("Categories query parameter is required", 400));
  }

  const categoryArray = categories.split(",").map((cat) => cat.trim().toLowerCase());

  const allowedCategories = ["desserts", "drinks", "meals"];
  const invalidCategories = categoryArray.filter((category) => !allowedCategories.includes(category));
  if (invalidCategories.length > 0) {
    return next(new ErrorClass(`Invalid categories: ${invalidCategories.join(", ")}`, 400));
  }

  const query = { categories: { $in: categoryArray } };

  const skip = (page - 1) * limit;

  const restaurants = await Restaurant.find(query)
    .populate("ownedBy", "name email phone")
    .skip(skip)
    .limit(parseInt(limit));

  const totalRestaurants = await Restaurant.countDocuments(query);

  res.status(200).json({
    status: "success",
    message: "Restaurants fetched successfully",
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

  next(new ErrorClass("Failed to search restaurants", 500, error.message));
};

/**
 * @api {GET} /restaurants  Get all restaurants
 */

export const getAllRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, name, address, category, avgRating, minPrice, maxPrice, sortBy } = req.query;

    // Build query for filtering
    const query = {};
    if (name) query.name = { $regex: name, $options: "i" }; // Case-insensitive search
    if (address) query.address = { $regex: address, $options: "i" }; // Case-insensitive search
    if (category) query.categories = { $in: category.split(",") };
    if (avgRating) query.avgRating = { $gte: avgRating };

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch restaurants with filtering, pagination, and population
    let restaurants = await Restaurant.find(query)
      .populate("ownedBy", "name email phone") // Include owner details
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: -1 } || { createdAt: -1 });

    if (minPrice && maxPrice) {
      const restaurantIds = restaurants.map((restaurant) => restaurant._id);

      const meals = await Meal.find({ restaurantId: { $in: restaurantIds } });

      // filter restaurants based on the meals price average
      restaurants = restaurants.filter((restaurant) => {
        const restaurantMeals = meals.filter((meal) => meal.restaurantId.toString() === restaurant._id.toString());
        const avgPrices = restaurantMeals.map((meal) => meal.price);
        const averagePrice = avgPrices.reduce((a, b) => a + b, 0) / avgPrices.length;

        return averagePrice >= minPrice && averagePrice <= maxPrice;
      });
    }

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
/**
 * @api {GET} /restaurants/owner/:ownerId Get all restaurants for a specific restaurant owner
 */
export const getRestaurantsByOwnerId = async (req, res, next) => {
  const { ownerId } = req.params;

  const restaurants = await Restaurant.find({ ownedBy: ownerId });

  if (!restaurants || restaurants.length === 0) {
    return next(new ErrorClass("No restaurants found for this owner", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Restaurants fetched successfully",
    data: restaurants,
  });
};
