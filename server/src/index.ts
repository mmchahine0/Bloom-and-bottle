import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import connectDB from "./database/mongoClient";
import authRoutes from "./features/auth/auth.route";
import adminRoutes from "./features/admin/admin.route";
import userRoutes from "./features/user/user.route";
import errorMiddleware from "../src/middleware/errorMiddleware";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const port = process.env.PORT || 3500;
app.set("trust proxy", 1);

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

connectDB();

// Routes
app.use("/api/v1", authRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", userRoutes);

// Error handling middleware
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
