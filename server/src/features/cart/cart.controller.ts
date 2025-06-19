import { Request, Response } from "express";
import { Types } from "mongoose";
import { Cart } from "../../database/model/cartModel";
import { Perfume } from "../../database/model/perfumeModel";
import { Collection } from "../../database/model/collectionModel";
import {
  CartResponse,
  AddToCartRequest,
  AddCollectionToCartRequest,
  UpdateQuantityRequest,
  CreateOrderData
} from './cart.types';
import {
  calculateCartSummary,
  transformCartItemToResponse,
  transformCollectionItemToResponse,
  getPopulatedCartItems,
  getPopulatedCollectionItems,
  validateCartItemData,
  validateCollectionData,
  convertCartToOrderItems,
  getProductPrice
} from './cart.utils';

/**
 * Helper function to update and save cart totals
 */
const updateCartTotals = async (cart: any): Promise<void> => {
  await cart.populate([
    { path: "items.product" },
    { path: "collectionItems.collectionId" }
  ]);

  const populatedItems = getPopulatedCartItems(cart.items);
  const populatedCollectionItems = getPopulatedCollectionItems(cart.collectionItems);
  const summary = calculateCartSummary(populatedItems, populatedCollectionItems);

  // Update the cart document's total fields
  cart.totalItems = summary.totalItems;
  cart.totalPrice = summary.totalPrice;
  cart.discount = summary.totalDiscount;
  cart.lastUpdated = new Date();

  await cart.save();
};

/**
 * Helper function to get product price from Mongoose document
 */
const getProductPriceFromDocument = (product: any, size: string): number => {
  if (!product.sizes || product.sizes.length === 0) {
    return product.price || 0;
  }
  
  const sizeOption = product.sizes.find((s: any) => s.label === size);
  return sizeOption?.price || product.price || 0;
};

/**
 * GET /cart - Get user's cart
 */
export const getUserCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    
    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId }).populate([
      { path: "items.product" },
      { path: "collectionItems.collectionId" }
    ]);

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        collectionItems: [],
        totalItems: 0,
        totalPrice: 0,
        discount: 0
      });
    } else {
      // Ensure cart totals are up to date
      await updateCartTotals(cart);
    }

    // Get populated items safely
    const populatedItems = getPopulatedCartItems(cart.items);
    const populatedCollectionItems = getPopulatedCollectionItems(cart.collectionItems);

    // Calculate summary
    const summary = calculateCartSummary(populatedItems, populatedCollectionItems);

    // Build response
    const response: CartResponse = {
      success: true,
      data: {
        items: populatedItems.map(transformCartItemToResponse),
        collectionItems: populatedCollectionItems.map(transformCollectionItemToResponse),
        summary
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch cart"
    });
  }
};

/**
 * POST /cart/add - Add product to cart
 */
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const { productId, size, quantity = 1 }: AddToCartRequest = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    // Validate input
    const validationError = validateCartItemData(productId, size, quantity);
    if (validationError) {
      res.status(400).json({ success: false, error: validationError });
      return;
    }

    // Verify product exists
    const product = await Perfume.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, error: "Product not found" });
      return;
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: new Types.ObjectId(userId) });
    if (!cart) {
      cart = await Cart.create({
        user: new Types.ObjectId(userId),
        items: [],
        collectionItems: [],
        totalItems: 0,
        totalPrice: 0,
        discount: 0
      });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > 10) {
        res.status(400).json({ 
          success: false, 
          error: "Cannot have more than 10 of the same item" 
        });
        return;
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].updatedAt = new Date();
    } else {
      // Add new item with discounted price at time of adding
      const basePrice = getProductPriceFromDocument(product, size);
      const discount = product.discount && product.discount > 0 ? product.discount : 0;
      const price = discount > 0 ? basePrice - (basePrice * (discount / 100)) : basePrice;
      cart.items.push({
        product: new Types.ObjectId(productId),
        size,
        quantity,
        price,
        originalPrice: basePrice,
        discount,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);
    }

    // Update cart totals and save
    await updateCartTotals(cart);
    
    // Return updated cart
    await sendUpdatedCart(cart, res, "Item added to cart successfully");
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add item to cart"
    });
  }
};

/**
 * POST /cart/collection/add - Add collection to cart
 */
export const addCollectionToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const { collectionId, quantity = 1 }: AddCollectionToCartRequest = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    // Validate input
    const validationError = validateCollectionData(collectionId, quantity);
    if (validationError) {
      res.status(400).json({ success: false, error: validationError });
      return;
    }

    // Verify collection exists and get products
    const collection = await Collection.findById(collectionId).populate('perfumes');
    if (!collection) {
      res.status(404).json({ success: false, error: "Collection not found" });
      return;
    }

    if (!collection.perfumes || collection.perfumes.length === 0) {
      res.status(400).json({ success: false, error: "Collection has no products" });
      return;
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: new Types.ObjectId(userId) });
    if (!cart) {
      cart = await Cart.create({
        user: new Types.ObjectId(userId),
        items: [],
        collectionItems: [],
        totalItems: 0,
        totalPrice: 0,
        discount: 0
      });
    }

    // Check if collection already exists in cart
    const existingCollectionIndex = cart.collectionItems.findIndex(
      item => item.collectionId.toString() === collectionId
    );

    if (existingCollectionIndex !== -1) {
      // Update existing collection
      const newQuantity = cart.collectionItems[existingCollectionIndex].quantity + quantity;
      if (newQuantity > 10) {
        res.status(400).json({ 
          success: false, 
          error: "Cannot have more than 10 of the same collection" 
        });
        return;
      }
      cart.collectionItems[existingCollectionIndex].quantity = newQuantity;
      cart.collectionItems[existingCollectionIndex].updatedAt = new Date();
    } else {
      // Add new collection
      const productsArray = (collection.perfumes as any[]).map(perfume => ({
        productId: perfume._id,
        size: perfume.sizes?.[0]?.label || 'default',
        quantity: 1
      }));

      cart.collectionItems.push({
        collectionId: new Types.ObjectId(collectionId),
        products: productsArray,
        price: collection.price || 0,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);
    }

    // Update cart totals and save
    await updateCartTotals(cart);
    
    // Return updated cart
    await sendUpdatedCart(cart, res, "Collection added to cart successfully");
  } catch (error) {
    console.error("Error adding collection to cart:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add collection to cart"
    });
  }
};

/**
 * PUT /cart/item/:itemId - Update cart item quantity
 */
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const { itemId } = req.params;
    const { quantity }: UpdateQuantityRequest = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    if (quantity < 0 || quantity > 10) {
      res.status(400).json({ 
        success: false, 
        error: "Quantity must be between 0 and 10" 
      });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, error: "Cart not found" });
      return;
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: "Item not found in cart" });
      return;
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].updatedAt = new Date();
    }

    // Update cart totals and save
    await updateCartTotals(cart);
    await sendUpdatedCart(cart, res, "Cart item updated successfully");
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update cart item"
    });
  }
};

/**
 * PUT /cart/increment/:itemId - Increment cart item quantity
 */
export const incrementCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const { itemId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, error: "Cart not found" });
      return;
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: "Item not found in cart" });
      return;
    }

    // Check max quantity
    if (cart.items[itemIndex].quantity >= 10) {
      res.status(400).json({
        success: false,
        error: "Cannot have more than 10 of the same item"
      });
      return;
    }

    // Increment quantity
    cart.items[itemIndex].quantity += 1;
    cart.items[itemIndex].updatedAt = new Date();

    // Update cart totals and save
    await updateCartTotals(cart);
    await sendUpdatedCart(cart, res, "Item quantity incremented successfully");
  } catch (error) {
    console.error("Error incrementing cart item:", error);
    res.status(500).json({
      success: false,
      error: "Failed to increment item quantity"
    });
  }
};

/**
 * PUT /cart/decrement/:itemId - Decrement cart item quantity
 */
export const decrementCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const { itemId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, error: "Cart not found" });
      return;
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: "Item not found in cart" });
      return;
    }

    // If quantity is 1, remove the item
    if (cart.items[itemIndex].quantity <= 1) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Decrement quantity
      cart.items[itemIndex].quantity -= 1;
      cart.items[itemIndex].updatedAt = new Date();
    }

    // Update cart totals and save
    await updateCartTotals(cart);
    await sendUpdatedCart(cart, res, "Item quantity decremented successfully");
  } catch (error) {
    console.error("Error decrementing cart item:", error);
    res.status(500).json({
      success: false,
      error: "Failed to decrement item quantity"
    });
  }
};

/**
 * DELETE /cart/item/:itemId - Remove item from cart
 */
export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const { itemId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, error: "Cart not found" });
      return;
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: "Item not found in cart" });
      return;
    }

    cart.items.splice(itemIndex, 1);
    
    // Update cart totals and save
    await updateCartTotals(cart);
    await sendUpdatedCart(cart, res, "Item removed from cart successfully");
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove cart item"
    });
  }
};

/**
 * DELETE /cart/clear - Clear entire cart
 */
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, error: "Cart not found" });
      return;
    }

    cart.items = [] as any;
    cart.collectionItems = [] as any;
    cart.totalItems = 0;
    cart.totalPrice = 0;
    cart.discount = 0;
    cart.lastUpdated = new Date();

    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        items: [],
        collectionItems: [],
        summary: {
          totalItems: 0,
          totalPrice: 0,
          totalDiscount: 0,
          subtotalProducts: 0,
          subtotalCollections: 0
        }
      }
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear cart"
    });
  }
};

/**
 * PUT /cart/collection/update/:itemId - Update collection quantity
 */
export const updateCollectionQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const { itemId } = req.params;
    const { quantity }: UpdateQuantityRequest = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    if (quantity < 0 || quantity > 10) {
      res.status(400).json({ 
        success: false, 
        error: "Quantity must be between 0 and 10" 
      });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, error: "Cart not found" });
      return;
    }

    const itemIndex = cart.collectionItems.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: "Collection not found in cart" });
      return;
    }

    if (quantity === 0) {
      cart.collectionItems.splice(itemIndex, 1);
    } else {
      cart.collectionItems[itemIndex].quantity = quantity;
      cart.collectionItems[itemIndex].updatedAt = new Date();
    }

    // Update cart totals and save
    await updateCartTotals(cart);
    await sendUpdatedCart(cart, res, "Collection updated successfully");
  } catch (error) {
    console.error("Error updating collection:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update collection"
    });
  }
};

/**
 * PUT /cart/collection/increment/:itemId - Increment collection quantity
 */
export const incrementCollectionQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const { itemId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, error: "Cart not found" });
      return;
    }

    const itemIndex = cart.collectionItems.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: "Collection not found in cart" });
      return;
    }

    // Check max quantity
    if (cart.collectionItems[itemIndex].quantity >= 10) {
      res.status(400).json({
        success: false,
        error: "Cannot have more than 10 of the same collection"
      });
      return;
    }

    // Increment quantity
    cart.collectionItems[itemIndex].quantity += 1;
    cart.collectionItems[itemIndex].updatedAt = new Date();

    // Update cart totals and save
    await updateCartTotals(cart);
    await sendUpdatedCart(cart, res, "Collection quantity incremented successfully");
  } catch (error) {
    console.error("Error incrementing collection:", error);
    res.status(500).json({
      success: false,
      error: "Failed to increment collection quantity"
    });
  }
};

/**
 * PUT /cart/collection/decrement/:itemId - Decrement collection quantity
 */
export const decrementCollectionQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const { itemId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, error: "Cart not found" });
      return;
    }

    const itemIndex = cart.collectionItems.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: "Collection not found in cart" });
      return;
    }

    // If quantity is 1, remove the collection
    if (cart.collectionItems[itemIndex].quantity <= 1) {
      cart.collectionItems.splice(itemIndex, 1);
    } else {
      // Decrement quantity
      cart.collectionItems[itemIndex].quantity -= 1;
      cart.collectionItems[itemIndex].updatedAt = new Date();
    }

    // Update cart totals and save
    await updateCartTotals(cart);
    await sendUpdatedCart(cart, res, "Collection quantity decremented successfully");
  } catch (error) {
    console.error("Error decrementing collection:", error);
    res.status(500).json({
      success: false,
      error: "Failed to decrement collection quantity"
    });
  }
};

/**
 * DELETE /cart/collection/:itemId - Remove collection from cart
 */
export const removeCollectionFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const { itemId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, error: "Cart not found" });
      return;
    }

    const itemIndex = cart.collectionItems.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: "Collection not found in cart" });
      return;
    }

    cart.collectionItems.splice(itemIndex, 1);
    
    // Update cart totals and save
    await updateCartTotals(cart);
    await sendUpdatedCart(cart, res, "Collection removed from cart successfully");
  } catch (error) {
    console.error("Error removing collection:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove collection"
    });
  }
};

/**
 * GET /cart/order-data - Get cart data formatted for order creation
 */
export const getCartOrderData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId as string;

    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const cart = await Cart.findOne({ user: userId }).populate([
      { path: "items.product" },
      { path: "collectionItems.collectionId" }
    ]);

    if (!cart || (cart.items.length === 0 && cart.collectionItems.length === 0)) {
      res.status(400).json({ success: false, error: "Cart is empty" });
      return;
    }

    const populatedItems = getPopulatedCartItems(cart.items);
    const populatedCollectionItems = getPopulatedCollectionItems(cart.collectionItems);
    
    const summary = calculateCartSummary(populatedItems, populatedCollectionItems);
    const orderItems = convertCartToOrderItems(populatedItems, populatedCollectionItems);

    const orderData: CreateOrderData = {
      items: orderItems,
      totalPrice: summary.totalPrice
    };

    res.json({
      success: true,
      data: orderData
    });
  } catch (error) {
    console.error("Error getting cart order data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get cart order data"
    });
  }
};

/**
 * Helper function to send updated cart response
 */
const sendUpdatedCart = async (cart: any, res: Response, message: string): Promise<void> => {
  // Ensure cart is populated (it should be from updateCartTotals)
  if (!cart.populated('items.product')) {
    await cart.populate([
      { path: "items.product" },
      { path: "collectionItems.collectionId" }
    ]);
  }

  const populatedItems = getPopulatedCartItems(cart.items);
  const populatedCollectionItems = getPopulatedCollectionItems(cart.collectionItems);
  const summary = calculateCartSummary(populatedItems, populatedCollectionItems);

  const response: CartResponse = {
    success: true,
    message,
    data: {
      items: populatedItems.map(transformCartItemToResponse),
      collectionItems: populatedCollectionItems.map(transformCollectionItemToResponse),
      summary
    }
  };

  res.json(response);
};