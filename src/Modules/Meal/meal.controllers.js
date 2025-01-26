import Meal from "../../../DB/Models/meal.model.js";
import Restaurant from "../../../DB/Models/restaurant.model.js";
import Reservation from "../../../DB/Models/reservation.model.js";
import { cloudinaryConfig } from "../../Utils/cloudinary.utils.js";
import predictMealService from "../../Services/predict-meal-service.js";
import { undefined } from "webidl-conversions";

/**
 * @api {POST} /meals/create  Create a new Meal
 */ export const createMeal = async (req, res) => {
  const { name, desc, price, restaurantId, category } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  if (restaurant.ownedBy.toString() !== req.authUser._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  let image = null;
  if (req.file) {
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
      req.file.path,
      {
        folder: "Restaurant/mealImages",
      },
    );
    image = { secure_url, public_id };
  }

  const mealInstance = new Meal({
    name,
    category,
    image,
    desc,
    price: Number(price),
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
 */ export const updateMeal = async (req, res) => {
  const { id } = req.params;
  const { name, desc, price, category } = req.body;

  const meal = await Meal.findById(id).populate("restaurantId");
  if (!meal) {
    return res.status(404).json({ message: "Meal not found" });
  }

  if (meal.restaurantId.ownedBy.toString() !== req.authUser._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (name) meal.name = name.trim();
  if (category) meal.category = category.trim();
  if (desc) meal.desc = desc.trim();
  if (price && !isNaN(Number(price))) meal.price = Number(price);

  if (req.file) {
    if (meal.image?.public_id) {
      await cloudinaryConfig().uploader.destroy(meal.image.public_id);
    }

    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
      req.file.path,
      {
        folder: "Restaurant/mealImages",
      },
    );
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
 */ export const deleteMeal = async (req, res) => {
  const { id } = req.params;

  const meal = await Meal.findById(id).populate("restaurantId");
  if (!meal) {
    return res.status(404).json({ message: "Meal not found" });
  }

  if (meal.restaurantId.ownedBy.toString() !== req.authUser._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // Check if the meal is part of any reservation
  const reservationExists = await Reservation.findOne({
    "mealId.meal": id,
  });
  if (reservationExists) {
    return res.status(400).json({
      status: "error",
      message: "Cannot delete meal as it is associated with a reservation.",
    });
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
 * @api {GET} /meals/restaurant/:restaurantId?search=''  Get All Meals for a Restaurant
 */ export const getAllMealsForRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  const { search, page, limit } = req.query;

  const pagination = {
    page: page || 1,
    limit: limit || 1000,
  };

  const skip = (pagination.page - 1) * pagination.limit;

  let predictedMealsNames = [];
  let meals = [];
  if (search) {
    predictedMealsNames = await predictMealService(search);
    meals = await Meal.find({
      name: { $in: predictedMealsNames },
      restaurantId,
    })
      .skip(skip)
      .limit(pagination.limit);
  } else {
    meals = await Meal.find({
      restaurantId,
    })
      .skip(skip)
      .limit(pagination.limit);
  }

  res.status(200).json({
    status: "success",
    message: meals.length
      ? "Meals retrieved successfully"
      : "No meals found for this restaurant",
    meals,
  });
};

/**
 * @api {GET} /meals/:id Get a Specific Meal
 */
export const getMealById = async (req, res) => {
  const { id } = req.params;

  const meal = await Meal.findById(id);

  if (!meal) {
    return res.status(404).json({ message: "Meal not found" });
  }

  res.status(200).json({
    status: "success",
    message: "Meal retrieved successfully",
    meal,
  });
};

/**
 * @api {GET} /meals/featured  Get Most Used Meals
 */
export const getMostUsedMeals = async (req, res) => {
  const meals = await Meal.aggregate([
    {
      $lookup: {
        from: "reservations",
        localField: "_id",
        foreignField: "mealId.meal",
        as: "reservations",
      },
    },
    {
      $unwind: "$reservations",
    },
    {
      $match: {
        "reservations.createdAt": {
          $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        image: { $first: "$image" },
        desc: { $first: "$desc" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  res.status(200).json({
    status: "success",
    message: "Most used meals retrieved successfully",
    meals,
  });
};
