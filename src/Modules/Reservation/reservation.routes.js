import { Router } from "express";
import { auth } from "../../Middlewares/authentication.middleware.js";
import * as controllers from "./reservation.controllers.js";

const reservationRouter = Router();

reservationRouter.post("/create", auth(), controllers.createReservation);
reservationRouter.put("/update/:id", auth(), controllers.updateReservation);
reservationRouter.delete("/delete/:id", auth(), controllers.deleteReservation);

reservationRouter.get("/restaurant/:restaurantId", auth(), controllers.getAllReservationsForRestaurant);

reservationRouter.patch("/status/:id", auth(), controllers.updateReservationStatus); //for the owner

reservationRouter.get("/user", auth(), controllers.getAllReservationsForUser);

reservationRouter.get("/table/:tableId", auth(), controllers.getReservationsForTable);

reservationRouter.get("/:id", auth(), controllers.getSpecificReservation);

export { reservationRouter };
