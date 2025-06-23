import { Request, Response } from "express";
import { Order } from "../../database/model/orderModel";
import { Cart } from "../../database/model/cartModel";
import { Types } from "mongoose";
import {
  getPopulatedCartItems,
  getPopulatedCollectionItems,
  calculateCartSummary,
  getProductPrice,
  getProductOriginalPrice,
} from "../cart/cart.utils";

// GET /orders - Get all orders for a user (OPTIMIZED - Simple Approach)
export const getUserOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // For list view, we don't need deep population - just basic info
    const orders = await Order.find({ user: userId })
      .select(
        "_id totalItems totalPrice originalTotalPrice discount status createdAt updatedAt items collectionItems"
      )
      .populate({
        path: "items.product",
        select: "name brand imageUrl type",
      })
      .populate({
        path: "collectionItems.collectionId",
        select: "name image",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance when you don't need Mongoose documents

    const totalOrders = await Order.countDocuments({ user: userId });

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNextPage: skip + orders.length < totalOrders,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user orders",
    });
  }
};

// GET /orders/:orderId - Get order by ID (user-level) - OPTIMIZED
export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.userId as string;

    // For single order view, we need full population
    const order = await Order.findOne({
      _id: orderId,
      user: userId, // Ensure user can only access their own orders
    })
      .populate({
        path: "items.product",
        select: "name brand price imageUrl type discount sizes",
      })
      .populate({
        path: "collectionItems.collectionId",
        select: "name description image price",
      })
      .populate({
        path: "collectionItems.products.productId",
        select: "name brand price imageUrl type discount sizes",
      })
      .lean(); // Use lean for better performance

    if (!order) {
      res.status(404).json({
        success: false,
        error: "Order not found",
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch order",
    });
  }
};

// POST /orders - Place a new order (FIXED COLLECTION PRICING LOGIC)
export const placeOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    // Get cart data
    const cart = await Cart.findOne({ user: userId }).populate([
      { path: "items.product" },
      { path: "collectionItems.collectionId" },
      { path: "collectionItems.products.productId" },
    ]);

    if (
      !cart ||
      (cart.items.length === 0 && cart.collectionItems.length === 0)
    ) {
      res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
      return;
    }

    // Get populated items safely
    const populatedItems = getPopulatedCartItems(cart.items);
    const populatedCollectionItems = getPopulatedCollectionItems(
      cart.collectionItems
    );

    // Prepare order items matching your schema
    const orderItems = populatedItems.map((item) => ({
      product: item.product._id,
      size: item.size,
      quantity: item.quantity,
      price: getProductPrice(item.product, item.size),
      originalPrice: getProductOriginalPrice(item.product, item.size),
      discount: item.product.discount || 0,
      type: item.product.type || "perfume",
    }));

    // FIXED: Collection items calculation - Use collection's actual price, not sum of individual products
    const orderCollectionItems = populatedCollectionItems.map(
      (collectionItem) => {
        // Use the collection's actual price, not sum of individual products
        const collectionUnitPrice = collectionItem.collectionId.price; // This is $20

        // Calculate what individual products would cost (for comparison/discount calculation)
        let individualProductsTotal = 0;
        const products = collectionItem.products.map((p) => {
          const product = p.productId as any;
          const itemPrice = getProductPrice(product, p.size);
          const originalPrice = getProductOriginalPrice(product, p.size);

          individualProductsTotal += itemPrice * p.quantity;

          return {
            productId: product._id,
            name: product.name,
            size: p.size,
            quantity: p.quantity,
            price: itemPrice,
            originalPrice: originalPrice,
            discount: product.discount || 0,
          };
        });

        // Collection pricing: Use collection's fixed price, not sum of products
        const collectionTotalPrice =
          collectionUnitPrice * collectionItem.quantity; // $20 * 1 = $20
        const originalTotalPrice =
          individualProductsTotal * collectionItem.quantity; // What it would cost individually
        const collectionDiscount = originalTotalPrice - collectionTotalPrice; // Savings from bundle

        return {
          collectionId: collectionItem.collectionId._id,
          collectionName: collectionItem.collectionId.name,
          products: products,
          quantity: collectionItem.quantity,
          totalPrice: collectionTotalPrice, // $20 (collection's actual price)
          originalTotalPrice: originalTotalPrice, // $136 (sum of individual product prices)
          discount: collectionDiscount, // $116 (savings from buying as collection)
        };
      }
    );

    // Calculate order totals properly
    let orderTotalPrice = 0;
    let orderOriginalTotalPrice = 0;
    let orderTotalDiscount = 0;
    let orderTotalItems = 0;

    // Add individual items
    orderItems.forEach((item) => {
      orderTotalPrice += item.price * item.quantity;
      orderOriginalTotalPrice += item.originalPrice * item.quantity;
      orderTotalItems += item.quantity;
    });

    // Add collection items
    orderCollectionItems.forEach((collectionItem) => {
      orderTotalPrice += collectionItem.totalPrice;
      orderOriginalTotalPrice += collectionItem.originalTotalPrice;
      orderTotalItems += collectionItem.quantity;
    });

    orderTotalDiscount = orderOriginalTotalPrice - orderTotalPrice;

    // Create order matching your schema structure
    const newOrder = new Order({
      user: new Types.ObjectId(userId),
      items: orderItems,
      collectionItems: orderCollectionItems,
      totalItems: orderTotalItems,
      totalPrice: orderTotalPrice,
      originalTotalPrice: orderOriginalTotalPrice,
      discount: orderTotalDiscount,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newOrder.save();

    // Clear the cart after successful order
    cart.items = [] as any;
    cart.collectionItems = [] as any;
    cart.totalItems = 0;
    cart.totalPrice = 0;
    cart.discount = 0;
    cart.lastUpdated = new Date();
    await cart.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        orderId: newOrder._id,
        items: newOrder.items,
        collectionItems: newOrder.collectionItems,
        totalItems: newOrder.totalItems,
        totalPrice: newOrder.totalPrice,
        originalTotalPrice: newOrder.originalTotalPrice,
        discount: newOrder.discount,
        status: newOrder.status,
        createdAt: newOrder.createdAt,
      },
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({
      success: false,
      error: "Failed to place order",
      message: "An error occurred while processing your order",
    });
  }
};

// GET /admin/orders - Admin: Get all orders (with filtering) - UPDATED
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
    const skip = (Number(page) - 1) * Number(limit);

    // Build query filters
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    // For search, we'll need to use a different approach since we can't search populated fields directly
    let orders;
    let totalItems;

    if (search) {
      // Search by order ID or use a simpler approach
      query.$or = [{ _id: { $regex: search, $options: "i" } }];
    }

    totalItems = await Order.countDocuments(query);
    orders = await Order.find(query)
      .populate({
        path: "user",
        select: "name email",
      })
      .populate({
        path: "items.product",
        select: "name brand price imageUrl type discount sizes",
      })
      .populate({
        path: "collectionItems.collectionId",
        select: "name description image price",
      })
      .populate({
        path: "collectionItems.products.productId",
        select: "name brand price imageUrl type discount sizes",
      })
      .sort({ createdAt: sortDirection === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Use lean for better performance

    res.json({
      success: true,
      data: orders,
      pagination: {
        totalItems,
        currentPage: Number(page),
        totalPages: Math.ceil(totalItems / Number(limit)),
        nextPage: skip + orders.length < totalItems ? Number(page) + 1 : null,
        hasNextPage: skip + orders.length < totalItems,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
    });
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

    // Validate status
    const validStatuses = ["pending", "completed", "canceled"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: "Invalid status. Must be one of: pending, completed, canceled",
      });
      return;
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    ).lean(); // Use lean for better performance

    if (!updated) {
      res.status(404).json({
        success: false,
        error: "Order not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update order status",
    });
  }
};

// GET /admin/orders/:orderId/status - Admin: Get specific order (details) - UPDATED
export const getAdminOrderDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate({
        path: "user",
        select: "name email phone",
      })
      .populate({
        path: "items.product",
        select: "name brand price imageUrl type discount sizes",
      })
      .populate({
        path: "collectionItems.collectionId",
        select: "name description image price",
      })
      .populate({
        path: "collectionItems.products.productId",
        select: "name brand price imageUrl type discount sizes",
      })
      .lean(); // Use lean for better performance

    if (!order) {
      res.status(404).json({
        success: false,
        error: "Order not found",
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error("Error fetching order details:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch order details",
    });
  }
};

// DELETE /admin/orders/:orderId - Admin: Delete an order
export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const deleted = await Order.findByIdAndDelete(orderId).lean();

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: "Order not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete order",
    });
  }
};
