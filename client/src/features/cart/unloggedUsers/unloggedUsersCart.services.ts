// FIXED: Services for unlogged users cart operations

import type {
  LocalStorageCart,
  CartItem,
  CollectionCartItem,
  AddToCartData,
  AddCollectionToCartData,
  LocalStorageOrder,
  CartSummary,
} from './unloggedUsersCart.types';

const STORAGE_KEYS = {
  GUEST_CART: 'guest_cart',
  GUEST_ORDERS: 'guest_orders',
  GUEST_SESSION: 'guest_session',
} as const;

const WHATSAPP_NUMBER = '+96176913342';

// Generate unique IDs
export const generateSessionId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateOrderId = (): string => {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateItemId = (productId: string, size: string): string => {
  return `${productId}_${size}_${Date.now()}`;
};

export const generateCollectionId = (collectionId: string): string => {
  return `collection_${collectionId}_${Date.now()}`;
};

// Safe localStorage operations
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

// FIXED: Calculate item price with discount
export const calculateItemPrice = (item: CartItem): number => {
  if (!item) return 0;
  
  // Use original price as base for discount calculation
  const basePrice = item.originalPrice || item.price || 0;
  
  if (item.discount && item.discount > 0 && item.discount <= 100) {
    const discountAmount = basePrice * (item.discount / 100);
    return Math.max(0, basePrice - discountAmount);
  }
  
  return item.price || 0;
};

// FIXED: Calculate cart totals properly
export const calculateCartTotals = (cart: LocalStorageCart): CartSummary => {
  if (!cart) {
    return {
      totalItems: 0,
      totalPrice: 0,
      totalDiscount: 0,
      subtotalProducts: 0,
      subtotalCollections: 0,
    };
  }

  // Ensure arrays exist
  const items = cart.items || [];
  const collectionItems = cart.collectionItems || [];

  // Calculate individual items
  const itemsTotalItems = items.reduce((sum, item) => {
    return sum + (item?.quantity || 0);
  }, 0);
  
  const itemsSubtotal = items.reduce((sum, item) => {
    if (!item) return sum;
    const itemPrice = calculateItemPrice(item);
    return sum + (itemPrice * (item.quantity || 0));
  }, 0);
  
  const itemsDiscount = items.reduce((sum, item) => {
    if (!item || !item.discount || item.discount <= 0) return sum;
    const basePrice = item.originalPrice || item.price || 0;
    const discountAmount = basePrice * (item.discount / 100);
    return sum + (discountAmount * (item.quantity || 0));
  }, 0);

  // Calculate collection items
  const collectionsTotalItems = collectionItems.reduce((sum, item) => {
    return sum + (item?.quantity || 0);
  }, 0);
  
  const collectionsSubtotal = collectionItems.reduce((sum, item) => {
    if (!item) return sum;
    const collectionPrice = item.totalPrice || 0;
    return sum + (collectionPrice * (item.quantity || 0));
  }, 0);

  return {
    totalItems: itemsTotalItems + collectionsTotalItems,
    totalPrice: itemsSubtotal + collectionsSubtotal,
    totalDiscount: itemsDiscount, // Only from products
    subtotalProducts: itemsSubtotal,
    subtotalCollections: collectionsSubtotal,
  };
};

// FIXED: Get cart from localStorage with proper validation
export const getCartFromLocalStorage = (): LocalStorageCart => {
  try {
    const savedCart = safeLocalStorage.get(STORAGE_KEYS.GUEST_CART);
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      
      // FIXED: Ensure cart has all required fields with validation
      const validatedCart: LocalStorageCart = {
        items: Array.isArray(parsedCart.items) ? parsedCart.items : [],
        collectionItems: Array.isArray(parsedCart.collectionItems) ? parsedCart.collectionItems : [],
        totalItems: parsedCart.totalItems || 0,
        totalPrice: parsedCart.totalPrice || 0,
        discount: parsedCart.discount || 0,
        sessionId: parsedCart.sessionId || generateSessionId(),
        lastUpdated: parsedCart.lastUpdated ? new Date(parsedCart.lastUpdated) : new Date(),
      };
      
      // FIXED: Recalculate totals to ensure consistency
      const summary = calculateCartTotals(validatedCart);
      return {
        ...validatedCart,
        totalItems: summary.totalItems,
        totalPrice: summary.totalPrice,
        discount: summary.totalDiscount,
      };
    }
  } catch (error) {
    console.error('Error getting cart from localStorage:', error);
  }

  // Return empty cart if none exists or error
  return {
    items: [],
    collectionItems: [],
    totalItems: 0,
    totalPrice: 0,
    discount: 0,
    sessionId: generateSessionId(),
    lastUpdated: new Date(),
  };
};

// FIXED: Save cart to localStorage with validation
export const saveCartToLocalStorage = (cart: LocalStorageCart): boolean => {
  try {
    if (!cart) {
      console.error('Cannot save null/undefined cart');
      return false;
    }
    
    const cartToSave = {
      ...cart,
      lastUpdated: new Date(),
      // Ensure arrays exist
      items: cart.items || [],
      collectionItems: cart.collectionItems || [],
    };
    
    return safeLocalStorage.set(STORAGE_KEYS.GUEST_CART, JSON.stringify(cartToSave));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
    return false;
  }
};

// FIXED: Update cart totals and save with proper error handling
export const updateAndSaveCart = (cart: LocalStorageCart): LocalStorageCart => {
  if (!cart) {
    console.error('Cannot update null/undefined cart');
    return getCartFromLocalStorage();
  }
  
  try {
    const summary = calculateCartTotals(cart);
    const updatedCart = {
      ...cart,
      totalItems: summary.totalItems,
      totalPrice: summary.totalPrice,
      discount: summary.totalDiscount,
      lastUpdated: new Date(),
    };
    
    const saved = saveCartToLocalStorage(updatedCart);
    if (!saved) {
      console.error('Failed to save cart to localStorage');
    }
    
    return updatedCart;
  } catch (error) {
    console.error('Error updating cart:', error);
    return cart;
  }
};

// FIXED: Add item to cart with better validation
export const addItemToCart = (cart: LocalStorageCart, item: AddToCartData): LocalStorageCart => {
  if (!cart || !item) {
    console.error('Invalid cart or item data');
    return cart || getCartFromLocalStorage();
  }
  
  try {
    const items = cart.items || [];
    const existingItemIndex = items.findIndex(
      cartItem => cartItem && cartItem.productId === item.productId && cartItem.size === item.size
    );

    let updatedItems: CartItem[];
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      updatedItems = items.map((cartItem, index) =>
        index === existingItemIndex
          ? { ...cartItem, quantity: (cartItem.quantity || 0) + (item.quantity || 1) }
          : cartItem
      );
    } else {
      // Add new item
      const newItem: CartItem = {
        id: generateItemId(item.productId, item.size),
        productId: item.productId,
        name: item.name || '',
        brand: item.brand || '',
        imageUrl: item.imageUrl || '',
        size: item.size || '',
        quantity: item.quantity || 1,
        price: item.price || 0,
        originalPrice: item.originalPrice || item.price || 0,
        discount: item.discount || 0,
        type: item.type || 'perfume',
      };
      updatedItems = [...items, newItem];
    }

    const updatedCart = {
      ...cart,
      items: updatedItems,
    };

    return updateAndSaveCart(updatedCart);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return cart;
  }
};

// FIXED: Add collection to cart with better validation
export const addCollectionToCart = (cart: LocalStorageCart, collection: AddCollectionToCartData): LocalStorageCart => {
  if (!cart || !collection) {
    console.error('Invalid cart or collection data');
    return cart || getCartFromLocalStorage();
  }
  
  try {
    const collectionItems = cart.collectionItems || [];
    const existingCollectionIndex = collectionItems.findIndex(
      item => item && item.collectionId === collection.collectionId
    );

    let updatedCollectionItems: CollectionCartItem[];
    
    if (existingCollectionIndex >= 0) {
      // Update existing collection quantity
      updatedCollectionItems = collectionItems.map((item, index) =>
        index === existingCollectionIndex
          ? { ...item, quantity: (item.quantity || 0) + (collection.quantity || 1) }
          : item
      );
    } else {
      // Add new collection
      const newCollection: CollectionCartItem = {
        id: generateCollectionId(collection.collectionId),
        collectionId: collection.collectionId,
        collectionName: collection.collectionName || '',
        collectionDescription: collection.collectionDescription,
        collectionImage: collection.collectionImage,
        quantity: collection.quantity || 1,
        totalPrice: collection.price || 0, // FIXED: Use price from collection data
        originalTotalPrice: collection.price || 0, // No discounts for collections
        discount: 0, // Collections don't have discounts
      };
      
      // FIXED: Debug log to help troubleshoot
      console.log('Adding new collection to cart:', {
        id: newCollection.id,
        collectionId: newCollection.collectionId,
        name: newCollection.collectionName,
        price: newCollection.totalPrice,
        quantity: newCollection.quantity
      });
      
      updatedCollectionItems = [...collectionItems, newCollection];
    }

    const updatedCart = {
      ...cart,
      collectionItems: updatedCollectionItems,
    };

    return updateAndSaveCart(updatedCart);
  } catch (error) {
    console.error('Error adding collection to cart:', error);
    return cart;
  }
};

// FIXED: Update item quantity with validation
export const updateItemQuantity = (cart: LocalStorageCart, itemId: string, quantity: number): LocalStorageCart => {
  if (!cart || !itemId) {
    console.error('Invalid cart or item ID');
    return cart || getCartFromLocalStorage();
  }
  
  if (quantity <= 0) {
    return removeItemFromCart(cart, itemId);
  }

  try {
    const updatedItems = (cart.items || []).map(item =>
      item && item.id === itemId ? { ...item, quantity } : item
    );

    const updatedCart = {
      ...cart,
      items: updatedItems,
    };

    return updateAndSaveCart(updatedCart);
  } catch (error) {
    console.error('Error updating item quantity:', error);
    return cart;
  }
};

// FIXED: Update collection quantity with validation
export const updateCollectionQuantity = (cart: LocalStorageCart, collectionId: string, quantity: number): LocalStorageCart => {
  if (!cart || !collectionId) {
    console.error('Invalid cart or collection ID');
    return cart || getCartFromLocalStorage();
  }
  
  if (quantity <= 0) {
    return removeCollectionFromCart(cart, collectionId);
  }

  try {
    const updatedCollectionItems = (cart.collectionItems || []).map(item =>
      item && item.id === collectionId ? { ...item, quantity } : item
    );

    const updatedCart = {
      ...cart,
      collectionItems: updatedCollectionItems,
    };

    return updateAndSaveCart(updatedCart);
  } catch (error) {
    console.error('Error updating collection quantity:', error);
    return cart;
  }
};

// FIXED: Remove item from cart with validation
export const removeItemFromCart = (cart: LocalStorageCart, itemId: string): LocalStorageCart => {
  if (!cart || !itemId) {
    console.error('Invalid cart or item ID');
    return cart || getCartFromLocalStorage();
  }
  
  try {
    const updatedItems = (cart.items || []).filter(item => item && item.id !== itemId);
    
    const updatedCart = {
      ...cart,
      items: updatedItems,
    };

    return updateAndSaveCart(updatedCart);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return cart;
  }
};

// FIXED: Remove collection from cart with validation
export const removeCollectionFromCart = (cart: LocalStorageCart, collectionId: string): LocalStorageCart => {
  if (!cart || !collectionId) {
    console.error('Invalid cart or collection ID');
    return cart || getCartFromLocalStorage();
  }
  
  try {
    const updatedCollectionItems = (cart.collectionItems || []).filter(item => item && item.id !== collectionId);
    
    const updatedCart = {
      ...cart,
      collectionItems: updatedCollectionItems,
    };

    return updateAndSaveCart(updatedCart);
  } catch (error) {
    console.error('Error removing collection from cart:', error);
    return cart;
  }
};

// FIXED: Clear cart with proper initialization
export const clearCart = (): LocalStorageCart => {
  const emptyCart: LocalStorageCart = {
    items: [],
    collectionItems: [],
    totalItems: 0,
    totalPrice: 0,
    discount: 0,
    sessionId: generateSessionId(),
    lastUpdated: new Date(),
  };

  saveCartToLocalStorage(emptyCart);
  return emptyCart;
};

// FIXED: Format WhatsApp message with better error handling
export const formatWhatsAppMessage = (order: LocalStorageOrder): string => {
  if (!order) {
    return 'Invalid order data';
  }
  
  try {
    let message = `🛍️ *New Order* 🛍️\n\n`;
    message += `📋 *Order ID:* ${order.orderId || 'N/A'}\n`;
    message += `👤 *Customer:* Guest User\n`;
    message += `📅 *Date:* ${order.timestamp ? order.timestamp.toLocaleString() : new Date().toLocaleString()}\n\n`;
    
    // Add individual items
    const items = order.items || [];
    if (items.length > 0) {
      message += `🎁 *Individual Items:*\n`;
      items.forEach((item, index) => {
        if (!item) return;
        const itemPrice = calculateItemPrice(item);
        message += `${index + 1}. *${item.brand || 'N/A'} - ${item.name || 'N/A'}*\n`;
        message += `   Size: ${item.size || 'N/A'}\n`;
        message += `   Quantity: ${item.quantity || 0}\n`;
        message += `   Price: $${itemPrice.toFixed(2)} USD\n`;
        
        if (item.discount && item.discount > 0) {
          message += `   💰 Discount: ${item.discount}% OFF\n`;
        }
        message += `\n`;
      });
    }
  
    // Add collections
    const collectionItems = order.collectionItems || [];
    if (collectionItems.length > 0) {
      message += `📦 *Collections:*\n`;
      collectionItems.forEach((collection, index) => {
        if (!collection) return;
        message += `${index + 1}. *${collection.collectionName || 'Collection'}*\n`;
        if (collection.collectionDescription) {
          message += `   Description: ${collection.collectionDescription}\n`;
        }
        message += `   Quantity: ${collection.quantity || 0}\n`;
        message += `   Total Price: $${((collection.totalPrice || 0) * (collection.quantity || 1)).toFixed(2)} USD\n\n`;
      });
    }
  
    message += `📊 *Order Summary:*\n`;
    message += `Total Items: ${order.totalItems || 0}\n`;
    message += `*Total Price: $${(order.totalPrice || 0).toFixed(2)} USD*\n\n`;
    message += `📞 Please confirm this order and provide delivery details.\n`;
    message += `🚚 Free delivery all over Lebanon!`;
  
    return message;
  } catch (error) {
    console.error('Error formatting WhatsApp message:', error);
    return 'Error generating order message. Please contact support.';
  }
};

// Generate WhatsApp URL
export const generateWhatsAppURL = (order: LocalStorageOrder): string => {
  const message = formatWhatsAppMessage(order);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}?text=${encodedMessage}`;
};

// FIXED: Save order to localStorage with validation
export const saveOrderToLocalStorage = (order: LocalStorageOrder): boolean => {
  if (!order) {
    console.error('Cannot save null/undefined order');
    return false;
  }
  
  try {
    const existingOrders = safeLocalStorage.get(STORAGE_KEYS.GUEST_ORDERS);
    const orders: LocalStorageOrder[] = existingOrders ? JSON.parse(existingOrders) : [];
    orders.unshift(order); // Add to beginning
    
    // Keep only last 50 orders
    const limitedOrders = orders.slice(0, 50);
    return safeLocalStorage.set(STORAGE_KEYS.GUEST_ORDERS, JSON.stringify(limitedOrders));
  } catch (error) {
    console.error('Error saving order to localStorage:', error);
    return false;
  }
};

// Get orders from localStorage
export const getOrdersFromLocalStorage = (): LocalStorageOrder[] => {
  try {
    const savedOrders = safeLocalStorage.get(STORAGE_KEYS.GUEST_ORDERS);
    return savedOrders ? JSON.parse(savedOrders) : [];
  } catch (error) {
    console.error('Error getting orders from localStorage:', error);
    return [];
  }
};