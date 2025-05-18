import { Request, Response } from "express";
import { Order } from "../../database/model/orderModel";

// GET /orders - Get all orders for a user
export const getUserOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
};

// GET /orders/:orderId - Get order by ID (user-level)
export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("items.product");
    if (!order) res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// POST /orders - Place a new order
export const placeOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { items, totalPrice } = req.body;

    const newOrder = new Order({
      user: userId,
      items,
      totalPrice,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to place order" });
  }
};

// GET /admin/orders - Admin: Get all orders (with filtering)
export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      search,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortDirection = "desc",
    } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    if (search) {
      query.$or = [
        { "user.name": { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalItems = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user")
      .sort({ createdAt: sortDirection === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      data: orders,
      pagination: {
        totalItems,
        currentPage: Number(page),
        nextPage: skip + orders.length < totalItems ? Number(page) + 1 : null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// PUT /admin/orders/:orderId/status - Admin: Update order status
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updated) res.status(404).json({ error: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status" });
  }
};

// GET /admin/orders/:orderId/status - Admin: Get specific order (details)
export const getAdminOrderDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("items.product");

    if (!order) res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order details" });
  }
};

// DELETE /admin/orders/:orderId - Admin: Delete an order
export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const deleted = await Order.findByIdAndDelete(orderId);
    if (!deleted) res.status(404).json({ error: "Order not found" });

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
};
