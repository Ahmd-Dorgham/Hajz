import express from "express";
import { config } from "dotenv";
import * as router from "./src/Modules/index.js";
import db_connection from "./DB/connection.js";
import { globalResponse } from "./src/Middlewares/error-handling.middleware.js";
config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/users", router.userRouter);
app.use("/restaurants", router.restaurantRouter);
app.use("/vip-rooms", router.vipRoomRouter);
app.use("/tables", router.tableRouter);

app.use(globalResponse);

db_connection();

app.get("/", (req, res) => res.send("Hello To the Restaurant reservation system!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
