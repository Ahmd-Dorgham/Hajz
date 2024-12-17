import Reservation from "../../../DB/Models/reservation.model.js";
import Table from "../../../DB/Models/table.model.js";
import Meal from "../../../DB/Models/meal.model.js";
import Restaurant from "../../../DB/Models/restaurant.model.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";

/**
 * @api {POST} /reservations/create Create a new Reservation
 */
export const createReservation = async (req, res, next) => {
  const { tableId, mealId, restaurantId, date, time } = req.body;

  if (!tableId || !restaurantId || !date || !time) {
    return next(new ErrorClass("Missing required fields", 400));
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return next(new ErrorClass("Restaurant not found", 404));
  }

  // 3. Check if the table exists and belongs to the restaurant
  const table = await Table.findOne({ _id: tableId, restaurantId });
  if (!table) {
    return next(new ErrorClass("Table not found or does not belong to this restaurant", 404));
  }

  // 4. Check if the table is already reserved at the given date and time
  const existingReservation = await Reservation.findOne({
    tableId,
    date,
    time,
    status: "reserved",
  });
  if (existingReservation) {
    return next(new ErrorClass("Table is already reserved for this time slot", 400));
  }

  if (mealId) {
    const meal = await Meal.findOne({ _id: mealId, restaurantId });
    if (!meal) {
      return next(new ErrorClass("Meal not found or does not belong to this restaurant", 404));
    }
  }

  // 6. Create the reservation
  const reservation = new Reservation({
    userId: req.authUser._id,
    tableId,
    mealId,
    restaurantId,
    date,
    time,
    status: "reserved",
  });

  const newReservation = await reservation.save();

  res.status(201).json({
    status: "success",
    message: "Reservation created successfully",
    reservation: newReservation,
  });
};
