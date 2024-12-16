import Meal from "../../../DB/Models/meal.model.js";
import Restaurant from "../../../DB/Models/restaurant.model.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { cloudinaryConfig } from "../../Utils/cloudinary.utils.js";

/**
 * @api {POST} /meals/create  Create a new Meal
 */
export const createMeal = async (req, res, next) => {
  const { name, desc, price, restaurantId } = req.body;

  if (!name || !price || !restaurantId) {
    return next(new ErrorClass("Name, price, and restaurant ID are required", 400));
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return next(new ErrorClass("Restaurant not found", 404));
  }

  if (restaurant.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized", 403, "You are not the owner of this restaurant"));
  }

  let image = null;
  if (req.file) {
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.file.path, {
      folder: "Restaurant/mealImages",
    });
    image = { secure_url, public_id };
  }

  const mealInstance = new Meal({
    name,
    image,
    desc,
    price,
    restaurantId,
  });

  const newMeal = await mealInstance.save();

  res.status(201).json({
    status: "success",
    message: "Meal created successfully",
    meal: newMeal,
  });
};
/**
 * @api {PUT} /meals/update/:id  Update a Meal
 */
export const updateMeal = async (req, res, next) => {
  const { id } = req.params; // Meal ID
  const { name, desc, price } = req.body;

  const meal = await Meal.findById(id).populate("restaurantId");
  if (!meal) {
    return next(new ErrorClass("Meal not found", 404));
  }

  if (meal.restaurantId.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized", 403, "You are not the owner of this restaurant"));
  }

  if (name) meal.name = name.trim();
  if (desc) meal.desc = desc.trim();
  if (price) meal.price = Number(price);

  if (req.file) {
    if (meal.image?.public_id) {
      await cloudinaryConfig().uploader.destroy(meal.image.public_id);
    }

    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(req.file.path, {
      folder: "Restaurant/mealImages",
    });
    meal.image = { secure_url, public_id };
  }

  const updatedMeal = await meal.save();

  res.status(200).json({
    status: "success",
    message: "Meal updated successfully",
    meal: updatedMeal,
  });
};

/**
 * @api {DELETE} /meals/delete/:id  Delete a Meal
 */
export const deleteMeal = async (req, res, next) => {
  const { id } = req.params; // Meal ID

  const meal = await Meal.findById(id).populate("restaurantId");
  if (!meal) {
    return next(new ErrorClass("Meal not found", 404, "Invalid Meal ID"));
  }

  if (meal.restaurantId.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized", 403, "You are not the owner of this restaurant"));
  }

  if (meal.image?.public_id) {
    await cloudinaryConfig().uploader.destroy(meal.image.public_id);
  }

  await Meal.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: "Meal deleted successfully",
  });
};

/**
 * @api {GET} /meals/restaurant/:restaurantId  Get All Meals for a Restaurant
 */
export const getAllMealsForRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return next(new ErrorClass("Restaurant ID is required", 400, "Missing restaurant ID"));
  }

  const meals = await Meal.find({ restaurantId });

  if (!meals.length) {
    return res.status(200).json({
      status: "success",
      message: "No meals found for this restaurant",
      meals: [],
    });
  }

  res.status(200).json({
    status: "success",
    message: "Meals retrieved successfully",
    meals,
  });
};

/**
 * @api {GET} /meals/:id Get a Specific Meal
 */
export const getMealById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorClass("Meal ID is required", 400, "Missing meal ID"));
  }

  const meal = await Meal.findById(id);

  if (!meal) {
    return next(new ErrorClass("Meal not found", 404, "Invalid meal ID"));
  }

  res.status(200).json({
    status: "success",
    message: "Meal retrieved successfully",
    meal,
  });
};
