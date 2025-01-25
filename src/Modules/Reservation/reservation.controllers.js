import Reservation from "../../../DB/Models/reservation.model.js";
import Table from "../../../DB/Models/table.model.js";
import Meal from "../../../DB/Models/meal.model.js";
import Restaurant from "../../../DB/Models/restaurant.model.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";

/**
 * @api {POST} /reservations/create Create a new Reservation
 */ export const createReservation = async (req, res) => {
  const { tableId, mealId, restaurantId, date, time } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  const table = await Table.findOne({ _id: tableId, restaurantId });
  if (!table) {
    return res.status(404).json({
      message: "Table not found or does not belong to this restaurant",
    });
  }

  const existingReservation = await Reservation.findOne({
    tableId,
    date,
    time,
    status: "reserved",
  });
  if (existingReservation) {
    return res
      .status(400)
      .json({ message: "Table is already reserved for this time slot" });
  }

  if (mealId && Array.isArray(mealId)) {
    const mealValidationPromises = mealId.map(async (item) => {
      const meal = await Meal.findOne({ _id: item.meal, restaurantId });
      if (!meal) {
        throw new Error(
          `Meal with ID ${item.meal} not found or does not belong to this restaurant`,
        );
      }
      return true;
    });

    try {
      await Promise.all(mealValidationPromises);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

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
    message: "Reservation created successfully",
    reservation: newReservation,
  });
};

/**
 * @api {PUT} /reservations/update/:id Update a Reservation
 */ export const updateReservation = async (req, res) => {
  const { id } = req.params;
  const { date, time, status, mealId } = req.body;

  const reservation = await Reservation.findById(id);
  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  if (reservation.userId.toString() !== req.authUser._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (date || time) {
    const existingReservation = await Reservation.findOne({
      tableId: reservation.tableId,
      date: date || reservation.date,
      time: time || reservation.time,
      status: "reserved",
      _id: { $ne: reservation._id },
    });

    if (existingReservation) {
      return res
        .status(400)
        .json({ message: "Table is already reserved for the selected time" });
    }
  }

  if (mealId && Array.isArray(mealId)) {
    const mealValidationPromises = mealId.map(async (item) => {
      const meal = await Meal.findOne({
        _id: item.meal,
        restaurantId: reservation.restaurantId,
      });
      if (!meal) {
        throw new Error(
          `Meal with ID ${item.meal} not found or does not belong to this restaurant`,
        );
      }
      return true;
    });

    try {
      await Promise.all(mealValidationPromises);
      reservation.mealId = mealId;
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  reservation.date = date || reservation.date;
  reservation.time = time || reservation.time;
  reservation.status = status || reservation.status;

  const updatedReservation = await reservation.save();

  res.status(200).json({
    message: "Reservation updated successfully",
    reservation: updatedReservation,
  });
};

/**
 * @api {DELETE} /reservations/delete/:id  Delete a Reservation
 */ export const deleteReservation = async (req, res, next) => {
  const { id } = req.params; // Extract reservation ID from the URL parameters

  const reservation = await Reservation.findOneAndDelete({
    _id: id,
    userId: req.authUser._id,
  });

  if (!reservation) {
    return next(
      new ErrorClass(
        "Reservation not found or unauthorized",
        404,
        "Invalid reservation ID or you do not own this reservation",
      ),
    );
  }

  res.status(200).json({
    status: "success",
    message: "Reservation deleted successfully",
  });
};

/**
 * @api {GET} /reservations/restaurant/:restaurantId  Get All Reservations for a Restaurant
 */
export const getAllReservationsForRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params; // Extract restaurantId from the URL parameters

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return next(
      new ErrorClass("Restaurant not found", 404, "Invalid restaurant ID"),
    );
  }

  if (restaurant.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(
      new ErrorClass(
        "Unauthorized",
        403,
        "You are not the owner of this restaurant",
      ),
    );
  }

  const reservations = await Reservation.find({ restaurantId })
    .populate("userId", "name email")
    .populate("tableId", "tableNumber capacity")
    .populate("mealId.meal", "name price")
    .sort({ date: 1, time: 1 });

  res.status(200).json({
    status: "success",
    message: "All reservations fetched successfully",
    reservations,
  });
};

/**
 * @api {PATCH} /reservations/:id/status  Update Reservation Status
 * @description Allows the owner of a restaurant to mark a reservation as canceled or completed.
 */
export const updateReservationStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["canceled", "completed"].includes(status)) {
    return next(
      new ErrorClass(
        "Invalid status value",
        400,
        "Status must be 'canceled' or 'completed'",
      ),
    );
  }

  const reservation = await Reservation.findById(id).populate("restaurantId");
  if (!reservation) {
    return next(
      new ErrorClass("Reservation not found", 404, "Invalid reservation ID"),
    );
  }

  const restaurant = reservation.restaurantId;
  if (!restaurant) {
    return next(
      new ErrorClass(
        "Restaurant not found",
        404,
        "Restaurant associated with this reservation is invalid",
      ),
    );
  }

  if (restaurant.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(
      new ErrorClass(
        "Unauthorized",
        403,
        "You are not the owner of this restaurant",
      ),
    );
  }

  reservation.status = status;
  const updatedReservation = await reservation.save();

  res.status(200).json({
    status: "success",
    message: `Reservation marked as '${status}' successfully`,
    reservation: updatedReservation,
  });
};
/**
 * @api {GET} /reservations/user Get All Reservations for a User
 */

//TODO: To be Reviewed
export const getAllReservationsForUser = async (req, res, next) => {
  const reservations = await Reservation.find({ userId: req.authUser._id })
    .populate("restaurantId", "name address profileImage")
    .populate("tableId", "tableNumber capacity")
    .populate({
      path: "mealId.meal",
      select: "name price",
    })
    .sort({ date: 1, time: 1 });

  res.status(200).json({
    status: "success",
    message: "All reservations for the user fetched successfully",
    reservations,
  });
};

/**
 * @api {GET} /reservations/table/:tableId Fetch all reservations for a specific table
 */ export const getReservationsForTable = async (req, res) => {
  const { tableId } = req.params;

  const reservations = await Reservation.find({ tableId })
    .populate("userId", "name email")
    .populate("restaurantId", "name address")
    .sort({ date: 1, time: 1 });

  const filteredReservations = reservations.filter(
    (reservation) =>
      reservation.userId.toString() === req.authUser._id.toString() ||
      reservation.restaurantId.ownedBy.toString() ===
        req.authUser._id.toString(),
  );

  if (!filteredReservations.length) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  res.status(200).json({
    message: "Reservations for the table fetched successfully",
    reservations: filteredReservations,
  });
};

/**
 * @api {GET} /reservations/:id Fetch details of a specific reservation by its ID
 */
export const getSpecificReservation = async (req, res, next) => {
  const { id } = req.params;

  const reservation = await Reservation.findById(id)
    .populate("userId", "name email")
    .populate("restaurantId", "name address")
    .populate("tableId", "tableNumber capacity")
    .populate("mealId", "name price");

  if (!reservation) {
    return next(new ErrorClass("Reservation not found", 404));
  }

  if (
    reservation.userId.toString() !== req.authUser._id.toString() &&
    reservation.restaurantId.ownedBy.toString() !== req.authUser._id.toString()
  ) {
    return next(
      new ErrorClass(
        "Unauthorized",
        403,
        "You are not authorized to view this reservation",
      ),
    );
  }

  res.status(200).json({
    status: "success",
    message: "Reservation details fetched successfully",
    reservation,
  });
};

export const getReservationsByDayForRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params; // /reservations/restaurant/:restaurantId/day?date=12-7-2024
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "Date parameter is required" });
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return next(new ErrorClass("Restaurant not found", 404));
  }

  if (restaurant.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(
      new ErrorClass(
        "Unauthorized",
        403,
        "You are not the owner of this restaurant",
      ),
    );
  }

  const reservations = await Reservation.find({
    restaurantId: restaurantId,
    date: date,
  })
    .populate("userId", "name email")
    .populate("tableId", "tableNumber capacity")
    .sort({ time: 1 }); // sort by time ascending

  return res.status(200).json({
    status: "success",
    message: "Reservations for the given day fetched successfully",
    reservations,
  });
};
