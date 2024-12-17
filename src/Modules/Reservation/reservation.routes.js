import { Router } from "express";
import { auth } from "../../Middlewares/authentication.middleware.js";
import * as controllers from "./reservation.controllers.js";

const reservationRouter = Router();

reservationRouter.post("/create", auth(), controllers.createReservation);

export { reservationRouter };
