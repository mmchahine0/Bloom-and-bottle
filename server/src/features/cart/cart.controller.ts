// SOLUTION 1: Update the type guard to be more specific and use proper type assertion

import { Request, Response } from "express";
import { Cart } from "../../database/model/cartModel";
import { Perfume } from "../../database/model/perfumeModel";
import { 
  ICartItemWithProduct, 
  CartItemResponse, 
  CartResponse,
  IProduct,
  CollectionCartItemResponse,
  AddToCollectionCartRequest,
  ICollectionCartItemWithProduct
} from "./cart.types";
import { Document, Types } from "mongoose";
import { calculateCartTotals, getProductPrice, getProductOriginalPrice, calculateCombinedCartTotals } from "./cart.utils";
import { Collection } from "../../database/model/collectionModel";

// UPDATED TYPE GUARD - More specific
function isPopulatedCartItem(item: any): item is Document & ICartItemWithProduct {
  return item && 
         item.product && 
         typeof item.product === 'object' && 
         '_id' in item.product &&
         'name' in item.product &&
         'brand' in item.product &&
         'imageUrl' in item.product &&
         'price' in item.product;
}

// Create a type assertion function
function assertPopulatedCartItems(items: any[]): (Document & ICartItemWithProduct)[] {
  return items.filter(isPopulatedCartItem);
}

// GET /cart - Get user's cart
export const getUserCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }
    
    // Find or create user's cart
    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        discount: 0
      });
    }

    const populatedItems = assertPopulatedCartItems(cart.items);
    const { totalItems, totalPrice, discount } = calculateCartTotals(populatedItems);

    const response: CartResponse = {
      success: true,
      data: {
        items: populatedItems.map<CartItemResponse>(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          brand: item.product.brand,
          imageUrl: item.product.imageUrl,
          size: item.size,
          quantity: item.quantity,
          price: getProductPrice(item.product, item.size),
          originalPrice: getProductOriginalPrice(item.product, item.size),
          discount: item.product.discount || 0,
          type: item.product.type || "perfume",
        })),
        collectionItems: [],
        totalItems,
        totalPrice,
        discount,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching user cart:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch cart",
      message: "An error occurred while retrieving your cart"
    });
  }
};

// POST /cart/add - Add item to cart
export const addToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    const { 
      productId, 
      quantity = 1, 
      size,
    } = req.body;

    // Validate required fields
    if (!productId || !size) {
      res.status(400).json({ 
        success: false, 
        error: "Product ID and size are required" 
      });
      return;
    }

    // Verify product exists
    const product = await Perfume.findById(productId);
    if (!product) {
      res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
      return;
    }

    // Validate quantity
    if (quantity <= 0 || quantity > 10) {
      res.status(400).json({ 
        success: false, 
        error: "Quantity must be between 1 and 10" 
      });
      return;
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ user: new Types.ObjectId(userId) });
    if (!cart) {
      cart = await Cart.create({
        user: new Types.ObjectId(userId),
        items: [],
        totalItems: 0,
        totalPrice: 0,
        discount: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > 10) {
        res.status(400).json({ 
          success: false, 
          error: "Cannot add more than 10 of the same item" 
        });
        return;
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].updatedAt = new Date();
    } else {
      // Add new item to cart
      cart.items.push({
        product: new Types.ObjectId(productId),
        size,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Update cart totals
    await cart.populate("items.product");
    const populatedItems = assertPopulatedCartItems(cart.items);
    const { totalItems, totalPrice, discount } = calculateCartTotals(populatedItems);
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.discount = discount;
    cart.lastUpdated = new Date();

    await cart.save();

    const response: CartResponse = {
      success: true,
      message: "Item added to cart successfully",
      data: {
        items: populatedItems.map<CartItemResponse>(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          brand: item.product.brand,
          imageUrl: item.product.imageUrl,
          size: item.size,
          quantity: item.quantity,
          price: getProductPrice(item.product, item.size),
          originalPrice: getProductOriginalPrice(item.product, item.size),
          discount: item.product.discount || 0,
          type: item.product.type || "perfume",
        })),
        collectionItems: [],
        totalItems,
        totalPrice,
        discount,
      },
    };

    res.status(201).json(response);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to add item to cart",
      message: "An error occurred while adding the item to your cart"
    });
  }
};

// PUT /cart/update/:itemId - Update cart item quantity
export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0 || quantity > 10) {
      res.status(400).json({
        success: false,
        error: "Quantity must be between 0 and 10"
      });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Cart not found"
      });
      return;
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
      return;
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].updatedAt = new Date();
    }

    // Update cart totals
    await cart.populate("items.product");
    const populatedItems = assertPopulatedCartItems(cart.items);
    const { totalItems, totalPrice, discount } = calculateCartTotals(populatedItems);
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.discount = discount;
    cart.lastUpdated = new Date();

    await cart.save();

    const response: CartResponse = {
      success: true,
      message: "Cart updated successfully",
      data: {
        items: populatedItems.map<CartItemResponse>(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          brand: item.product.brand,
          imageUrl: item.product.imageUrl,
          size: item.size,
          quantity: item.quantity,
          price: getProductPrice(item.product, item.size),
          originalPrice: getProductOriginalPrice(item.product, item.size),
          discount: item.product.discount || 0,
          type: item.product.type || "perfume",
        })),
        collectionItems: [],
        totalItems,
        totalPrice,
        discount,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update cart",
      message: "An error occurred while updating your cart"
    });
  }
};

// DELETE /cart/clear - Clear user's cart
export const clearCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Cart not found"
      });
      return;
    }

    cart.items = [] as any;
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
        totalItems: 0,
        totalPrice: 0,
        discount: 0
      }
    });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({
      success: false,
      error: "Failed to clear cart",
      message: "An error occurred while clearing your cart"
    });
  }
};

// DELETE /cart/item/:itemId - Remove specific item from cart
export const removeCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Cart not found"
      });
      return;
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
      return;
    }

    // Remove the item
    cart.items.splice(itemIndex, 1);

    // Update cart totals
    await cart.populate("items.product");
    const populatedItems = assertPopulatedCartItems(cart.items);
    const { totalItems, totalPrice, discount } = calculateCartTotals(populatedItems);
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.discount = discount;
    cart.lastUpdated = new Date();

    await cart.save();

    const response: CartResponse = {
      success: true,
      message: "Item removed from cart successfully",
      data: {
        items: populatedItems.map<CartItemResponse>(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          brand: item.product.brand,
          imageUrl: item.product.imageUrl,
          size: item.size,
          quantity: item.quantity,
          price: getProductPrice(item.product, item.size),
          originalPrice: getProductOriginalPrice(item.product, item.size),
          discount: item.product.discount || 0,
          type: item.product.type || "perfume",
        })),
        collectionItems: [],
        totalItems,
        totalPrice,
        discount,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error removing item from cart:", err);
    res.status(500).json({
      success: false,
      error: "Failed to remove item from cart",
      message: "An error occurred while removing the item from your cart"
    });
  }
};

// PUT /cart/increment/:itemId - Increment cart item quantity
export const incrementCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Cart not found"
      });
      return;
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
      return;
    }

    // Check if incrementing would exceed max quantity
    if (cart.items[itemIndex].quantity >= 10) {
      res.status(400).json({
        success: false,
        error: "Cannot add more than 10 of the same item"
      });
      return;
    }

    // Increment quantity
    cart.items[itemIndex].quantity += 1;
    cart.items[itemIndex].updatedAt = new Date();

    // Update cart totals
    await cart.populate("items.product");
    const populatedItems = assertPopulatedCartItems(cart.items);
    const { totalItems, totalPrice, discount } = calculateCartTotals(populatedItems);
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.discount = discount;
    cart.lastUpdated = new Date();

    await cart.save();

    const response: CartResponse = {
      success: true,
      message: "Item quantity incremented successfully",
      data: {
        items: populatedItems.map<CartItemResponse>(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          brand: item.product.brand,
          imageUrl: item.product.imageUrl,
          size: item.size,
          quantity: item.quantity,
          price: getProductPrice(item.product, item.size),
          originalPrice: getProductOriginalPrice(item.product, item.size),
          discount: item.product.discount || 0,
          type: item.product.type || "perfume",
        })),
        collectionItems: [],
        totalItems,
        totalPrice,
        discount,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error incrementing cart item:", err);
    res.status(500).json({
      success: false,
      error: "Failed to increment item quantity",
      message: "An error occurred while updating your cart"
    });
  }
};

// PUT /cart/decrement/:itemId - Decrement cart item quantity
export const decrementCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Cart not found"
      });
      return;
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Item not found in cart"
      });
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

    // Update cart totals
    await cart.populate("items.product");
    const populatedItems = assertPopulatedCartItems(cart.items);
    const { totalItems, totalPrice, discount } = calculateCartTotals(populatedItems);
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.discount = discount;
    cart.lastUpdated = new Date();

    await cart.save();

    const response: CartResponse = {
      success: true,
      message: "Item quantity decremented successfully",
      data: {
        items: populatedItems.map<CartItemResponse>(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          brand: item.product.brand,
          imageUrl: item.product.imageUrl,
          size: item.size,
          quantity: item.quantity,
          price: getProductPrice(item.product, item.size),
          originalPrice: getProductOriginalPrice(item.product, item.size),
          discount: item.product.discount || 0,
          type: item.product.type || "perfume",
        })),
        collectionItems: [],
        totalItems,
        totalPrice,
        discount,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error decrementing cart item:", err);
    res.status(500).json({
      success: false,
      error: "Failed to decrement item quantity",
      message: "An error occurred while updating your cart"
    });
  }
};
//Colection

function isPopulatedCollectionCartItem(item: any): item is Document & ICollectionCartItemWithProduct {
  return item && 
         item.collection && 
         typeof item.collection === 'object' && 
         '_id' in item.collection &&
         'name' in item.collection &&
         item.products &&
         Array.isArray(item.products) &&
         item.products.every((p: any) => p.product && typeof p.product === 'object' && '_id' in p.product);
}

function assertPopulatedCollectionCartItems(items: any[]): (Document & ICollectionCartItemWithProduct)[] {
  return items.filter(isPopulatedCollectionCartItem);
}

// POST /cart/collection/add - Add collection to cart
export const addCollectionToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    const { 
      collectionId, 
      products,
      quantity = 1 
    }: AddToCollectionCartRequest = req.body;

    // Validate required fields
    if (!collectionId || !products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({ 
        success: false, 
        error: "Collection ID and products are required" 
      });
      return;
    }

    // Verify collection exists
    const collection = await Collection.findById(collectionId).populate('perfumes');
    if (!collection) {
      res.status(404).json({ 
        success: false, 
        error: "Collection not found" 
      });
      return;
    }

    // Validate quantity
    if (quantity <= 0 || quantity > 10) {
      res.status(400).json({ 
        success: false, 
        error: "Quantity must be between 1 and 10" 
      });
      return;
    }

    // Validate products in the collection
    for (const productItem of products) {
      if (!productItem.productId || !productItem.size || !productItem.quantity) {
        res.status(400).json({
          success: false,
          error: "Each product must have productId, size, and quantity"
        });
        return;
      }

      if (productItem.quantity <= 0 || productItem.quantity > 10) {
        res.status(400).json({
          success: false,
          error: "Product quantity must be between 1 and 10"
        });
        return;
      }

      // Check if product is actually in the collection
      const isProductInCollection = collection.perfumes.some(
        (perfume: any) => perfume._id.toString() === productItem.productId
      );

      if (!isProductInCollection) {
        res.status(400).json({
          success: false,
          error: `Product ${productItem.productId} is not part of this collection`
        });
        return;
      }
    }

    // Find or create user's cart
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
      // Update existing collection item
      const newQuantity = cart.collectionItems[existingCollectionIndex].quantity + quantity;
      if (newQuantity > 10) {
        res.status(400).json({ 
          success: false, 
          error: "Cannot add more than 10 of the same collection" 
        });
        return;
      }
      cart.collectionItems[existingCollectionIndex].quantity = newQuantity;
      cart.collectionItems[existingCollectionIndex].updatedAt = new Date();
    } else {
      // Add new collection item to cart
      cart.collectionItems.push({
        collectionId: new Types.ObjectId(collectionId),
        products: products.map(p => ({
          productId: new Types.ObjectId(p.productId),
          size: p.size,
          quantity: p.quantity
        })),
        quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Populate all items for total calculation
    await cart.populate("items.product");
    await cart.populate({
      path: "collectionItems.collectionId",
      model: "Collection"
    });
    await cart.populate({
      path: "collectionItems.products.productId",
      model: "Perfume"
    });

    // Update cart totals
    const populatedItems = assertPopulatedCartItems(cart.items);
    const populatedCollectionItems = assertPopulatedCollectionCartItems(cart.collectionItems);
    
    const { totalItems, totalPrice, discount } = calculateCombinedCartTotals(
      populatedItems,
      populatedCollectionItems
    );
    
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.discount = discount;
    cart.lastUpdated = new Date();

    await cart.save();

    // Build response
    const response: CartResponse = {
      success: true,
      message: "Collection added to cart successfully",
      data: {
        items: populatedItems.map<CartItemResponse>(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          brand: item.product.brand,
          imageUrl: item.product.imageUrl,
          size: item.size,
          quantity: item.quantity,
          price: getProductPrice(item.product, item.size),
          originalPrice: getProductOriginalPrice(item.product, item.size),
          discount: item.product.discount || 0,
          type: item.product.type || "perfume",
        })),
        collectionItems: populatedCollectionItems.map<CollectionCartItemResponse>(item => {
          let totalPrice = 0;
          let originalTotalPrice = 0;

          const productDetails = item.products.map(p => {
            const price = getProductPrice(p.product, p.size);
            const originalPrice = getProductOriginalPrice(p.product, p.size);
            totalPrice += price * p.quantity;
            originalTotalPrice += originalPrice * p.quantity;

            return {
              productId: p.product._id.toString(),
              name: p.product.name,
              brand: p.product.brand,
              imageUrl: p.product.imageUrl,
              size: p.size,
              quantity: p.quantity,
              price,
              originalPrice,
              discount: p.product.discount || 0,
              type: p.product.type || "perfume",
            };
          });

          return {
            id: item._id.toString(),
            collectionId: item.collectionId.toString(),
            collectionName: item.collection.name,
            products: productDetails,
            quantity: item.quantity,
            totalPrice: totalPrice * item.quantity,
            originalTotalPrice: originalTotalPrice * item.quantity,
            discount: (originalTotalPrice - totalPrice) * item.quantity,
          };
        }),
        totalItems,
        totalPrice,
        discount,
      },
    };

    res.status(201).json(response);
  } catch (err) {
    console.error("Error adding collection to cart:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to add collection to cart",
      message: "An error occurred while adding the collection to your cart"
    });
  }
};

// DELETE /cart/collection/:itemId - Remove collection from cart
export const removeCollectionFromCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Cart not found"
      });
      return;
    }

    const itemIndex = cart.collectionItems.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Collection item not found in cart"
      });
      return;
    }

    // Remove the collection item
    cart.collectionItems.splice(itemIndex, 1);

    // Update cart totals
    await cart.populate("items.product");
    await cart.populate({
      path: "collectionItems.collectionId",
      model: "Collection"
    });
    await cart.populate({
      path: "collectionItems.products.productId",
      model: "Perfume"
    });

    const populatedItems = assertPopulatedCartItems(cart.items);
    const populatedCollectionItems = assertPopulatedCollectionCartItems(cart.collectionItems);
    
    const { totalItems, totalPrice, discount } = calculateCombinedCartTotals(
      populatedItems,
      populatedCollectionItems
    );
    
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.discount = discount;
    cart.lastUpdated = new Date();

    await cart.save();

    const response: CartResponse = {
      success: true,
      message: "Collection removed from cart successfully",
      data: {
        items: populatedItems.map<CartItemResponse>(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          brand: item.product.brand,
          imageUrl: item.product.imageUrl,
          size: item.size,
          quantity: item.quantity,
          price: getProductPrice(item.product, item.size),
          originalPrice: getProductOriginalPrice(item.product, item.size),
          discount: item.product.discount || 0,
          type: item.product.type || "perfume",
        })),
        collectionItems: populatedCollectionItems.map<CollectionCartItemResponse>(item => {
          let totalPrice = 0;
          let originalTotalPrice = 0;

          const productDetails = item.products.map(p => {
            const price = getProductPrice(p.product, p.size);
            const originalPrice = getProductOriginalPrice(p.product, p.size);
            totalPrice += price * p.quantity;
            originalTotalPrice += originalPrice * p.quantity;

            return {
              productId: p.product._id.toString(),
              name: p.product.name,
              brand: p.product.brand,
              imageUrl: p.product.imageUrl,
              size: p.size,
              quantity: p.quantity,
              price,
              originalPrice,
              discount: p.product.discount || 0,
              type: p.product.type || "perfume",
            };
          });

          return {
            id: item._id.toString(),
            collectionId: item.collectionId.toString(),
            collectionName: item.collection.name,
            products: productDetails,
            quantity: item.quantity,
            totalPrice: totalPrice * item.quantity,
            originalTotalPrice: originalTotalPrice * item.quantity,
            discount: (originalTotalPrice - totalPrice) * item.quantity,
          };
        }),
        totalItems,
        totalPrice,
        discount,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error removing collection from cart:", err);
    res.status(500).json({
      success: false,
      error: "Failed to remove collection from cart",
      message: "An error occurred while removing the collection from your cart"
    });
  }
};



export const updateCollectionQuantity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0 || quantity > 10) {
      res.status(400).json({
        success: false,
        error: "Quantity must be between 0 and 10"
      });
      return;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Cart not found"
      });
      return;
    }

    const itemIndex = cart.collectionItems.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Collection item not found in cart"
      });
      return;
    }

    if (quantity === 0) {
      // Remove collection if quantity is 0
      cart.collectionItems.splice(itemIndex, 1);
    } else {
      cart.collectionItems[itemIndex].quantity = quantity;
      cart.collectionItems[itemIndex].updatedAt = new Date();
    }

    // Update cart totals and send response (similar to previous methods)
    await updateCartTotalsAndRespond(cart, res, "Collection updated successfully");
  } catch (err) {
    console.error("Error updating collection:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update collection",
      message: "An error occurred while updating your collection"
    });
  }
};

// PUT /cart/collection/increment/:itemId - Increment collection quantity
export const incrementCollectionQuantity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Cart not found"
      });
      return;
    }

    const itemIndex = cart.collectionItems.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Collection item not found in cart"
      });
      return;
    }

    // Check if incrementing would exceed max quantity
    if (cart.collectionItems[itemIndex].quantity >= 10) {
      res.status(400).json({
        success: false,
        error: "Cannot add more than 10 of the same collection"
      });
      return;
    }

    // Increment quantity
    cart.collectionItems[itemIndex].quantity += 1;
    cart.collectionItems[itemIndex].updatedAt = new Date();

    await updateCartTotalsAndRespond(cart, res, "Collection quantity incremented successfully");
  } catch (err) {
    console.error("Error incrementing collection:", err);
    res.status(500).json({
      success: false,
      error: "Failed to increment collection quantity",
      message: "An error occurred while updating your cart"
    });
  }
};

// PUT /cart/collection/decrement/:itemId - Decrement collection quantity
export const decrementCollectionQuantity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req.user?.userId as string);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
      return;
    }

    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({
        success: false,
        error: "Cart not found"
      });
      return;
    }

    const itemIndex = cart.collectionItems.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        error: "Collection item not found in cart"
      });
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

    await updateCartTotalsAndRespond(cart, res, "Collection quantity decremented successfully");
  } catch (err) {
    console.error("Error decrementing collection:", err);
    res.status(500).json({
      success: false,
      error: "Failed to decrement collection quantity",
      message: "An error occurred while updating your cart"
    });
  }
};

// Helper function to update cart totals and send response
async function updateCartTotalsAndRespond(cart: any, res: Response, message: string) {
  // Populate all items for total calculation
  await cart.populate("items.product");
  await cart.populate({
    path: "collectionItems.collectionId",
    model: "Collection"
  });
  await cart.populate({
    path: "collectionItems.products.productId",
    model: "Perfume"
  });

  const populatedItems = assertPopulatedCartItems(cart.items);
  const populatedCollectionItems = assertPopulatedCollectionCartItems(cart.collectionItems);
  
  const { totalItems, totalPrice, discount } = calculateCombinedCartTotals(
    populatedItems,
    populatedCollectionItems
  );
  
  cart.totalItems = totalItems;
  cart.totalPrice = totalPrice;
  cart.discount = discount;
  cart.lastUpdated = new Date();

  await cart.save();

  const response: CartResponse = {
    success: true,
    message,
    data: {
      items: populatedItems.map<CartItemResponse>(item => ({
        id: item._id.toString(),
        productId: item.product._id.toString(),
        name: item.product.name,
        brand: item.product.brand,
        imageUrl: item.product.imageUrl,
        size: item.size,
        quantity: item.quantity,
        price: getProductPrice(item.product, item.size),
        originalPrice: getProductOriginalPrice(item.product, item.size),
        discount: item.product.discount || 0,
        type: item.product.type || "perfume",
      })),
      collectionItems: populatedCollectionItems.map<CollectionCartItemResponse>(item => {
        let totalPrice = 0;
        let originalTotalPrice = 0;

        const productDetails = item.products.map(p => {
          const price = getProductPrice(p.product, p.size);
          const originalPrice = getProductOriginalPrice(p.product, p.size);
          totalPrice += price * p.quantity;
          originalTotalPrice += originalPrice * p.quantity;

          return {
            productId: p.product._id.toString(),
            name: p.product.name,
            brand: p.product.brand,
            imageUrl: p.product.imageUrl,
            size: p.size,
            quantity: p.quantity,
            price,
            originalPrice,
            discount: p.product.discount || 0,
            type: p.product.type || "perfume",
          };
        });

        return {
          id: item._id.toString(),
          collectionId: item.collectionId.toString(),
          collectionName: item.collection.name,
          products: productDetails,
          quantity: item.quantity,
          totalPrice: totalPrice * item.quantity,
          originalTotalPrice: originalTotalPrice * item.quantity,
          discount: (originalTotalPrice - totalPrice) * item.quantity,
        };
      }),
      totalItems,
      totalPrice,
      discount,
    },
  };

  res.json(response);
}