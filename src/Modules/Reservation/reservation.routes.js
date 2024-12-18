import { Router } from "express";
import { auth } from "../../Middlewares/authentication.middleware.js";
import * as controllers from "./reservation.controllers.js";
import { systemRoles } from "../../Utils/systemRoles.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";

const reservationRouter = Router();

reservationRouter.post("/create", auth([systemRoles.user]), controllers.createReservation);
reservationRouter.put("/update/:id", auth([systemRoles.user]), controllers.updateReservation);
reservationRouter.delete("/delete/:id", auth([systemRoles.user]), controllers.deleteReservation);

reservationRouter.get(
  "/restaurant/:restaurantId",
  auth([systemRoles.restaurantOwner]),
  errorHandler(controllers.getAllReservationsForRestaurant)
);

reservationRouter.patch(
  "/status/:id",
  auth([systemRoles.restaurantOwner]),
  errorHandler(controllers.updateReservationStatus)
); //for the owner

reservationRouter.get("/user", auth([systemRoles.user]), errorHandler(controllers.getAllReservationsForUser));

reservationRouter.get(
  "/table/:tableId",
  auth([systemRoles.restaurantOwner]),
  errorHandler(controllers.getReservationsForTable)
);

reservationRouter.get(
  "/:id",
  auth([systemRoles.restaurantOwner, systemRoles.user]),
  errorHandler(controllers.getSpecificReservation)
);

export { reservationRouter };
