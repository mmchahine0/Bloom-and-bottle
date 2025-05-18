import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { isAdmin } from "../../middleware/adminMiddleware";
import {
  getUserOrders,
  getOrderById,
  placeOrder,
  getAllOrders,
  updateOrderStatus,
  getAdminOrderDetails,
  deleteOrder,
} from "./orders.controller";

const router = Router();

// 🧾 User Routes
router.use("/orders", protect);

router.get("/orders", getUserOrders);
router.get("/orders/:orderId", getOrderById);
router.post("/orders", placeOrder);

// 🛠 Admin Routes
router.use("/admin/orders", protect, isAdmin);

router.get("/admin/orders", getAllOrders);
router.put("/admin/orders/:orderId/status", updateOrderStatus);
router.get("/admin/orders/:orderId/status", getAdminOrderDetails);
router.delete("/admin/orders/:orderId", deleteOrder);

export default router;
