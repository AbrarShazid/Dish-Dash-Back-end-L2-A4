import { toNodeHandler } from "better-auth/node";
import express, { Application } from "express";
import { auth } from "./lib/auth";
import cors from "cors";
import { userRouter } from "./modules/user/user.router";
import { menuRouter } from "./modules/menu/menu.router";
import { categoryRouter } from "./modules/category/category.router";
// import { orderRouter } from "./modules/order/order.router";
// import { providerRoute } from "./modules/provider/provider.router";

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

// get profile, update status (ban/unban), update profile (image ,name etc), update to provider
app.use("/user", userRouter);

//provider
// app.use("/provider", providerRoute);

//category related task

app.use("/category", categoryRouter);

// menu related task

app.use("/menu", menuRouter);

// order related task
// app.use("/order", orderRouter);

app.get("/", (req, res) => {
  res.send("Hello  World");
});

export default app;
