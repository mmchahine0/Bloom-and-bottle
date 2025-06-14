import { v4 as uuidv4 } from 'uuid';
import type { 
    Cart, 
    CartItem, 
    WhatsAppOrderData, 
    AddToCartData,
    CollectionItem,
    CollectionProduct,
    GuestCart,
} from './Cart.types';
import { addToCartAPI } from './loggedUsers/loggedUsersCart.services';
import { addCollectionToCartAPI } from '../home/Home.services';

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
  message += `🎁 *Items Ordered:*\n`;
  
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

export const calculateItemPrice = (item: CartItem): number => {
  // Validate discount values
  const validateDiscount = (discount?: number): number => {
    if (!discount || discount <= 0 || discount > 100) return 0;
    return discount;
  };

  // Calculate individual product price with discount
  const calculateProductPrice = (product: CollectionProduct): number => {
    const productDiscount = validateDiscount(product.discount);
    const basePrice = product.originalPrice || product.price;
    
    if (productDiscount > 0) {
      return basePrice - (basePrice * (productDiscount / 100));
    }
    return basePrice;
  };

  // Handle collection type items
  if (item.type === 'collection' && item.collectionProducts) {
    // Calculate total for all products in collection
    const collectionTotal = item.collectionProducts.reduce((total, product) => {
      const productPrice = calculateProductPrice(product);
      return total + (productPrice * product.quantity);
    }, 0);

    // Apply collection-level discount if exists
    const collectionDiscount = validateDiscount(item.discount);
    if (collectionDiscount > 0) {
      return collectionTotal - (collectionTotal * (collectionDiscount / 100));
    }
    return collectionTotal;
  }

  // Handle regular items (perfume or sample)
  const itemDiscount = validateDiscount(item.discount);
  const basePrice = item.originalPrice || item.price;
  
  if (itemDiscount > 0) {
    return basePrice - (basePrice * (itemDiscount / 100));
  }
  return basePrice;
};

export const calculateItemTotal = (item: CartItem): number => {
  const itemPrice = calculateItemPrice(item);
  return itemPrice * item.quantity;
};

export const calculateCartTotals = (items: CartItem[]): { totalItems: number; totalPrice: number; totalDiscount: number } => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const { totalPrice, totalDiscount } = items.reduce((acc, item) => {
    const originalTotal = item.originalPrice * item.quantity;
    const discountedTotal = calculateItemTotal(item);
    const itemDiscount = originalTotal - discountedTotal;
    
    return {
      totalPrice: acc.totalPrice + discountedTotal,
      totalDiscount: acc.totalDiscount + itemDiscount,
    };
  }, { totalPrice: 0, totalDiscount: 0 });

  return { totalItems, totalPrice, totalDiscount };
};

export const applyDiscount = (price: number, discount: number): number => {
  if (discount <= 0 || discount > 100) return price;
  return price - (price * (discount / 100));
};

/**
 * Remove item from cart
 */
export const removeItemFromCart = (cart: Cart, itemId: string): Cart => {
  const updatedItems = cart.items.filter(item => item.id !== itemId);
  const { totalItems, totalPrice, totalDiscount } = calculateCartTotals(updatedItems);

  return {
    items: updatedItems,
    totalItems,
    totalPrice,
    discount: totalDiscount,
  };
};

/**
 * Update item quantity in cart
 */
export const updateItemQuantity = (cart: Cart, itemId: string, quantity: number): Cart => {
  if (quantity <= 0) {
    return removeItemFromCart(cart, itemId);
  }

  const updatedItems = cart.items.map(item =>
    item.id === itemId ? { ...item, quantity } : item
  );

  const { totalItems, totalPrice, totalDiscount } = calculateCartTotals(updatedItems);

  return {
    items: updatedItems,
    totalItems,
    totalPrice,
    discount: totalDiscount,
  };
};

export const clearCart = (): Cart => {
  return {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    discount: 0,
  };
};

export const getCartSummary = (cart: Cart): {
  itemCount: number;
  uniqueProducts: number;
  totalValue: number;
  averageItemValue: number;
  hasDiscounts: boolean;
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
  };
};

export const transformToCartItem = (data: AddToCartData): CartItem => {
  if (data.type === 'collection' && data.collectionProducts) {
    return {
      id: `${data.collectionId}_${Date.now()}`,
      productId: data.productId,
      name: data.name,
      brand: data.brand,
      imageUrl: data.imageUrl,
      size: 'collection',
      quantity: data.quantity,
      price: data.price,
      originalPrice: data.originalPrice,
      discount: data.discount,
      type: 'collection',
      collectionId: data.collectionId,
      collectionProducts: data.collectionProducts,
    };
  }

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

// NEW: Merge guest cart with user cart
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
        type: item.type
      }, accessToken);
    }

    // Handle collection items
    for (const collection of guestCart.collectionItems) {
      await addCollectionToCartAPI({
        collectionId: collection.collectionId,
        products: collection.products.map((p: { productId: string; size: string; quantity: number }) => ({
          productId: p.productId,
          size: p.size,
          quantity: p.quantity
        })),
        quantity: collection.quantity
      }, accessToken);
    }

    // Clear guest cart after successful merge
    localStorage.removeItem(CART_CONFIG.STORAGE_KEYS.GUEST_CART);
  } catch (error) {
    console.error('Error merging guest cart:', error);
    throw error;
  }
};

// NEW: Save guest cart
export const saveGuestCart = (cart: GuestCart): void => {
  try {
    localStorage.setItem(CART_CONFIG.STORAGE_KEYS.GUEST_CART, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving guest cart:', error);
    throw error;
  }
};

// NEW: Get guest cart
export const getGuestCart = (): GuestCart => {
  try {
    const cart = localStorage.getItem(CART_CONFIG.STORAGE_KEYS.GUEST_CART);
    if (!cart) {
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
    return JSON.parse(cart);
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

// NEW: Calculate guest cart totals
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

  // Calculate collection items
  cart.collectionItems.forEach(collection => {
    totalItems += collection.quantity;
    totalPrice += collection.totalPrice;
    totalDiscount += collection.discount;
  });

  return {
    ...cart,
    totalItems,
    totalPrice,
    discount: totalDiscount,
    lastUpdated: new Date()
  };
};