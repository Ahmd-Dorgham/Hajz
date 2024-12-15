import Table from "../../../DB/Models/table.model.js";
import Restaurant from "../../../DB/Models/restaurant.model.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";

/**
 * @api {POST} /tables/create Create a new Table
 */
export const createTable = async (req, res, next) => {
  const { restaurantId, tableNumber, capacity } = req.body;

  if (!restaurantId || !tableNumber || !capacity) {
    return next(new ErrorClass("All fields are required", 400, "Missing required fields"));
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return next(new ErrorClass("Restaurant not found", 404, "Invalid restaurant ID"));
  }

  if (restaurant.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized", 403, "You are not the owner of this restaurant"));
  }

  const existingTable = await Table.findOne({ restaurantId, tableNumber });
  if (existingTable) {
    return next(new ErrorClass("Table number already exists", 400, "Duplicate table number"));
  }

  const tableInstance = new Table({
    restaurantId,
    tableNumber,
    capacity,
  });

  const newTable = await tableInstance.save();

  res.status(201).json({
    status: "success",
    message: "Table created successfully",
    table: newTable,
  });
};
/**
 * @api {PUT} /tables/update/:id Update a Table
 */
export const updateTable = async (req, res, next) => {
  const { id } = req.params; // Table ID
  const { tableNumber, capacity, status } = req.body;

  const table = await Table.findById(id).populate("restaurantId");
  if (!table) {
    return next(new ErrorClass("Table not found", 404, "Invalid Table ID"));
  }

  if (table.restaurantId.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized", 403, "You are not the owner of this restaurant"));
  }

  if (tableNumber) table.tableNumber = Number(tableNumber);
  if (capacity) table.capacity = Number(capacity);
  if (status && ["available", "reserved"].includes(status)) table.status = status;

  await table.save();

  res.status(200).json({
    status: "success",
    message: "Table updated successfully",
    table,
  });
};
/**
 * @api {DELETE} /tables/delete/:id Delete a Table
 */
export const deleteTable = async (req, res, next) => {
  const { id } = req.params; // Table ID

  const table = await Table.findById(id).populate("restaurantId");
  if (!table) {
    return next(new ErrorClass("Table not found", 404, "Invalid Table ID"));
  }

  if (table.restaurantId.ownedBy.toString() !== req.authUser._id.toString()) {
    return next(new ErrorClass("Unauthorized", 403, "You are not the owner of this restaurant"));
  }

  await Table.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: "Table deleted successfully",
  });
};
/**
 * @api {GET} /tables/restaurant/:restaurantId Get All Tables for a Restaurant
 */
export const getAllTablesForRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return next(new ErrorClass("Restaurant not found", 404, "Invalid restaurant ID"));
  }

  const tables = await Table.find({ restaurantId });

  res.status(200).json({
    status: "success",
    message: "Tables retrieved successfully",
    restaurantId: restaurantId,
    tables,
  });
};
/**
 * @api {GET} /tables/:id Get a Specific Table
 */
export const getSpecificTable = async (req, res, next) => {
  const { id } = req.params;

  const table = await Table.findById(id).populate("restaurantId", "name address phone");

  if (!table) {
    return next(new ErrorClass("Table not found", 404, "Invalid table ID"));
  }

  res.status(200).json({
    status: "success",
    message: "Table retrieved successfully",
    table,
  });
};
