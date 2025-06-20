import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import connectDB from "./database/mongoClient";
import errorMiddleware from "../src/middleware/errorMiddleware";
import cookieParser from "cookie-parser";

import authRoutes from "./features/auth/auth.route";
import adminRoutes from "./features/admin/admin.route";
import userRoutes from "./features/user/user.route";
import perfumeRoutes from "./features/products/perfume/perfume.route";
import cartRoutes from "./features/cart/cart.routes"
import orderRoutes from "./features/orders/orders.routes";
import adminProductRoutes from "./features/admin/products/adminProducts.routes";
import adminHomeRoutes from "./features/admin/homepage/adminHome.routes"
import adminCollectionRoutes from "./features/admin/collections/adminCollection.routes"

dotenv.config();

const app = express();

const port = process.env.PORT || 3500;
const allowedOrigins = ["http://localhost:5173", "http://localhost:3500"];

app.set("trust proxy", 1);

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

connectDB();

// Routes
app.use("/api/v1", authRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", perfumeRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", adminProductRoutes);
app.use("/api/v1", adminHomeRoutes);
app.use("/api/v1", adminCollectionRoutes);

// Error handling middleware
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
