import { v4 as uuidv4 } from 'uuid';
import type { 
    Cart, 
    CartItem, 
    WhatsAppOrderData, 
    AddToCartData,
    CollectionItem,
    GuestCart,
    CollectionCartItem,
} from './Cart.types';
import { addToCartAPI, addCollectionToCartAPI } from './loggedUsers/loggedUsersCart.services';

// ==================== CONSTANTS ====================

export const CART_CONFIG = {
  MAX_ITEMS: 50,
  MAX_QUANTITY_PER_ITEM: 10,
  WHATSAPP_NUMBER: '+96176913342',
  STORAGE_KEYS: {
    GUEST_CART: 'guest_cart',
    GUEST_ORDERS: 'guest_orders',
    GUEST_SESSION: 'guest_session',
  },
} as const;

// UPDATED: WhatsApp message formatter for new cart structure
export const formatWhatsAppMessage = (orderData: WhatsAppOrderData): string => {
  const isLoggedUser = !!orderData.customerInfo?.userId;
  
  let message = `🛍️ *New Order* 🛍️\n\n`;
  message += `📋 *Order ID:* ${orderData.orderId}\n`;
  
  if (isLoggedUser) {
    message += `👤 *Customer:* ${orderData.customerInfo?.name || 'N/A'}\n`;
    message += `📧 *Email:* ${orderData.customerInfo?.email || 'N/A'}\n`;
    message += `🆔 *User ID:* ${orderData.customerInfo?.userId}\n`;
  } else {
    message += `👤 *Customer:* Guest User\n`;
  }
  
  message += `📅 *Date:* ${orderData.timestamp.toLocaleString()}\n\n`;
  
  // Add individual items
  if (orderData.items && orderData.items.length > 0) {
    message += `🎁 *Individual Items:*\n`;
    orderData.items.forEach((item, index) => {
      const itemPrice = calculateItemPrice(item);
      message += `${index + 1}. *${item.brand} - ${item.name}*\n`;
      message += `   Size: ${item.size}\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: $${itemPrice.toFixed(2)} USD\n`;
      
      if (item.discount && item.discount > 0) {
        message += `   💰 Discount: ${item.discount}% OFF\n`;
      }
      message += `\n`;
    });
  }

  message += `📊 *Order Summary:*\n`;
  message += `Total Items: ${orderData.totalItems}\n`;
  message += `*Total Price: $${orderData.totalPrice.toFixed(2)} USD*\n\n`;
  
  if (isLoggedUser) {
    message += `✅ *Order saved to account for tracking*\n`;
  }
  
  message += `📞 Please confirm this order and provide delivery details.\n`;
  message += `🚚 Free delivery all over Lebanon!`;

  return message;
};

export const generateWhatsAppURL = (orderData: WhatsAppOrderData): string => {
  const message = formatWhatsAppMessage(orderData);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${CART_CONFIG.WHATSAPP_NUMBER.replace(/\s+/g, '')}?text=${encodedMessage}`;
};

// UPDATED: Calculate item price with proper discount handling
export const calculateItemPrice = (item: CartItem): number => {
  // Validate discount values
  const validateDiscount = (discount?: number): number => {
    if (!discount || discount <= 0 || discount > 100) return 0;
    return discount;
  };

  // Handle regular items (perfume or sample)
  const itemDiscount = validateDiscount(item.discount);
  const basePrice = item.originalPrice || item.price;
  
  if (itemDiscount > 0) {
    return basePrice - (basePrice * (itemDiscount / 100));
  }
  return item.price; // Use current price if no discount
};

export const calculateItemTotal = (item: CartItem): number => {
  const itemPrice = calculateItemPrice(item);
  return itemPrice * item.quantity;
};

// UPDATED: Calculate cart totals for new structure
export const calculateCartTotals = (
  items: CartItem[], 
  collectionItems: CollectionCartItem[] = []
): { totalItems: number; totalPrice: number; totalDiscount: number } => {
  
  // Calculate individual items
  const itemsTotalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const { totalPrice: itemsPrice, totalDiscount: itemsDiscount } = items.reduce((acc, item) => {
    const originalTotal = item.originalPrice * item.quantity;
    const discountedTotal = calculateItemTotal(item);
    const itemDiscount = originalTotal - discountedTotal;
    
    return {
      totalPrice: acc.totalPrice + discountedTotal,
      totalDiscount: acc.totalDiscount + itemDiscount,
    };
  }, { totalPrice: 0, totalDiscount: 0 });

  // Calculate collection items (collections don't have discounts)
  const collectionsTotalItems = collectionItems.reduce((sum, item) => sum + item.quantity, 0);
  const collectionsTotalPrice = collectionItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return { 
    totalItems: itemsTotalItems + collectionsTotalItems, 
    totalPrice: itemsPrice + collectionsTotalPrice, 
    totalDiscount: itemsDiscount // Only from individual items
  };
};

export const applyDiscount = (price: number, discount: number): number => {
  if (discount <= 0 || discount > 100) return price;
  return price - (price * (discount / 100));
};

// UPDATED: Remove item from cart (new structure)
export const removeItemFromCart = (cart: Cart, itemId: string): Cart => {
  const updatedItems = cart.items.filter(item => item.id !== itemId);
  const { totalItems, totalPrice, totalDiscount } = calculateCartTotals(updatedItems, cart.collectionItems);

  return {
    ...cart,
    items: updatedItems,
    totalItems,
    totalPrice,
    discount: totalDiscount,
  };
};

// UPDATED: Update item quantity in cart (new structure)
export const updateItemQuantity = (cart: Cart, itemId: string, quantity: number): Cart => {
  if (quantity <= 0) {
    return removeItemFromCart(cart, itemId);
  }

  const updatedItems = cart.items.map(item =>
    item.id === itemId ? { ...item, quantity } : item
  );

  const { totalItems, totalPrice, totalDiscount } = calculateCartTotals(updatedItems, cart.collectionItems);

  return {
    ...cart,
    items: updatedItems,
    totalItems,
    totalPrice,
    discount: totalDiscount,
  };
};

// UPDATED: Clear cart (new structure)
export const clearCart = (): Cart => {
  return {
    items: [],
    collectionItems: [], // Include collection items
    totalItems: 0,
    totalPrice: 0,
    discount: 0,
  };
};

// UPDATED: Get cart summary (new structure)
export const getCartSummary = (cart: Cart): {
  itemCount: number;
  uniqueProducts: number;
  totalValue: number;
  averageItemValue: number;
  hasDiscounts: boolean;
  collectionsCount: number;
} => {
  const uniqueProducts = new Set(cart.items.map(item => item.productId)).size;
  const hasDiscounts = cart.items.some(item => item.discount && item.discount > 0);
  const averageItemValue = cart.totalItems > 0 ? cart.totalPrice / cart.totalItems : 0;

  return {
    itemCount: cart.totalItems,
    uniqueProducts,
    totalValue: cart.totalPrice,
    averageItemValue,
    hasDiscounts,
    collectionsCount: cart.collectionItems?.length || 0, // Add collections count
  };
};

export const transformToCartItem = (data: AddToCartData): CartItem => {
  // SIMPLIFIED: No longer handle collection type in cart items
  // Collections are handled separately via collectionItems array
  return {
    id: `${data.productId}_${data.size}_${Date.now()}`,
    productId: data.productId,
    name: data.name,
    brand: data.brand,
    imageUrl: data.imageUrl,
    size: data.size,
    quantity: data.quantity,
    price: data.price,
    originalPrice: data.originalPrice,
    discount: data.discount,
    type: data.type,
  };
};

export const safeJSONParse = <T>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
};

export const safeLocalStorage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage get error:', error);
      return null;
    }
  },
  
  set: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('localStorage set error:', error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('localStorage remove error:', error);
      return false;
    }
  },
};

// DEPRECATED: This function is no longer needed with simplified collections
// Keeping for backward compatibility
export const calculateCollectionTotal = (collection: CollectionItem): number => {
  const productsTotal = collection.products.reduce((total, product) => {
    const productPrice = product.discount 
      ? product.originalPrice - (product.originalPrice * (product.discount / 100))
      : product.price;
    return total + (productPrice * product.quantity);
  }, 0);

  if (collection.discount) {
    return productsTotal - (productsTotal * (collection.discount / 100));
  }

  return productsTotal;
};

// Helper function to generate session ID
const generateSessionId = (): string => {
  return uuidv4();
};

// UPDATED: Merge guest cart with user cart (simplified for new backend)
export const mergeGuestCartWithUserCart = async (
  guestCart: GuestCart,
  accessToken: string
): Promise<void> => {
  try {
    // Handle individual items
    for (const item of guestCart.items) {
      await addToCartAPI({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      }, accessToken);
    }

    // Handle collection items (simplified - just collectionId and quantity)
    for (const collection of guestCart.collectionItems) {
      await addCollectionToCartAPI({
        collectionId: collection.collectionId,
        quantity: collection.quantity,
        items: []
      }, accessToken);
    }

    // Clear guest cart after successful merge
    localStorage.removeItem(CART_CONFIG.STORAGE_KEYS.GUEST_CART);
  } catch (error) {
    console.error('Error merging guest cart:', error);
    throw error;
  }
};

// UPDATED: Save guest cart (new structure)
export const saveGuestCart = (cart: GuestCart): void => {
  try {
    localStorage.setItem(CART_CONFIG.STORAGE_KEYS.GUEST_CART, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving guest cart:', error);
    throw error;
  }
};

// UPDATED: Get guest cart (new structure)
export const getGuestCart = (): GuestCart => {
  try {
    const cart = localStorage.getItem(CART_CONFIG.STORAGE_KEYS.GUEST_CART);
    if (!cart) {
      return {
        items: [],
        collectionItems: [], // Include collection items
        totalItems: 0,
        totalPrice: 0,
        discount: 0,
        sessionId: generateSessionId(),
        lastUpdated: new Date()
      };
    }
    
    const parsedCart = JSON.parse(cart);
    
    // Ensure collectionItems exists for backward compatibility
    if (!parsedCart.collectionItems) {
      parsedCart.collectionItems = [];
    }
    
    return parsedCart;
  } catch (error) {
    console.error('Error getting guest cart:', error);
    return {
      items: [],
      collectionItems: [],
      totalItems: 0,
      totalPrice: 0,
      discount: 0,
      sessionId: generateSessionId(),
      lastUpdated: new Date()
    };
  }
};

// UPDATED: Calculate guest cart totals (new structure)
export const calculateGuestCartTotals = (cart: GuestCart): GuestCart => {
  let totalItems = 0;
  let totalPrice = 0;
  let totalDiscount = 0;

  // Calculate individual items
  cart.items.forEach(item => {
    totalItems += item.quantity;
    const itemPrice = item.discount && item.discount > 0
      ? item.originalPrice - (item.originalPrice * (item.discount / 100))
      : item.price;
    totalPrice += itemPrice * item.quantity;
    totalDiscount += (item.originalPrice - itemPrice) * item.quantity;
  });

  // Calculate collection items (collections don't have discounts)
  cart.collectionItems.forEach(collection => {
    totalItems += collection.quantity;
    totalPrice += collection.totalPrice * collection.quantity; // Fixed price * quantity
    // Collections don't contribute to discount
  });

  return {
    ...cart,
    totalItems,
    totalPrice,
    discount: totalDiscount, // Only from individual items
    lastUpdated: new Date()
  };
};

// NEW: Helper functions for collection cart items
export const addCollectionToGuestCart = (
  cart: GuestCart, 
  collectionData: {
    collectionId: string;
    collectionName: string;
    collectionDescription?: string;
    collectionImage?: string;
    quantity: number;
    price: number; // Fixed collection price
  }
): GuestCart => {
  const existingIndex = cart.collectionItems.findIndex(
    item => item.collectionId === collectionData.collectionId
  );

  if (existingIndex >= 0) {
    // Update existing collection
    cart.collectionItems[existingIndex].quantity += collectionData.quantity;
  } else {
    // Add new collection
    cart.collectionItems.push({
      id: `collection_${collectionData.collectionId}_${Date.now()}`,
      collectionId: collectionData.collectionId,
      collectionName: collectionData.collectionName,
      collectionDescription: collectionData.collectionDescription,
      collectionImage: collectionData.collectionImage,
      quantity: collectionData.quantity,
      totalPrice: collectionData.price, // Fixed price per collection
      originalTotalPrice: collectionData.price, // No discounts for collections
      discount: 0, // Collections don't have discounts
    });
  }

  return calculateGuestCartTotals(cart);
};

export const removeCollectionFromGuestCart = (cart: GuestCart, collectionId: string): GuestCart => {
  cart.collectionItems = cart.collectionItems.filter(item => item.collectionId !== collectionId);
  return calculateGuestCartTotals(cart);
};

export const updateCollectionQuantityInGuestCart = (
  cart: GuestCart, 
  collectionId: string, 
  quantity: number
): GuestCart => {
  if (quantity <= 0) {
    return removeCollectionFromGuestCart(cart, collectionId);
  }

  const collectionIndex = cart.collectionItems.findIndex(item => item.collectionId === collectionId);
  if (collectionIndex >= 0) {
    cart.collectionItems[collectionIndex].quantity = quantity;
  }

  return calculateGuestCartTotals(cart);
};