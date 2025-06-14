import { Request, Response } from "express";
import { Order } from "../../database/model/orderModel";
import { Types } from "mongoose";

// GET /orders - Get all orders for a user
export const getUserOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name brand price imageUrl type'
      })
      .sort({ createdAt: -1 });
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
    const order = await Order.findById(orderId)
      .populate({
        path: 'items.product',
        select: 'name brand price imageUrl type'
      });
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
    const userId = (req.user?.userId as string);
    const { items, totalPrice } = req.body;

    // Validate required fields
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: "Order must contain at least one item"
      });
      return;
    }

    if (!totalPrice || typeof totalPrice !== 'number' || totalPrice <= 0) {
      res.status(400).json({
        success: false,
        error: "Invalid total price"
      });
      return;
    }

    // Validate items structure
    const validItems = items.every(item => 
      item.productId && 
      item.size && 
      item.quantity && 
      item.price &&
      typeof item.quantity === 'number' &&
      typeof item.price === 'number' &&
      item.quantity > 0 &&
      item.price > 0
    );

    if (!validItems) {
      res.status(400).json({
        success: false,
        error: "Invalid item structure in order"
      });
      return;
    }

    // Create order with proper structure
    const newOrder = new Order({
      user: new Types.ObjectId(userId),
      items: items.map(item => ({
        product: new Types.ObjectId(item.productId),
        size: item.size,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice,
      status: 'pending', // Initial status
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newOrder.save();

    // Return success response with order details
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        orderId: newOrder._id,
        items: newOrder.items,
        totalPrice: newOrder.totalPrice,
        status: newOrder.status,
        createdAt: newOrder.createdAt
      }
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to place order",
      message: "An error occurred while processing your order"
    });
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
      .populate({
        path: 'items.product',
        select: 'name brand price imageUrl type'
      })
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
      .populate({
        path: 'items.product',
        select: 'name brand price imageUrl type'
      });

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
