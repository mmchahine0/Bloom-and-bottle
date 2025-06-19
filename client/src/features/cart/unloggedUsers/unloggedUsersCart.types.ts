export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  imageUrl: string;
  size: string;
  quantity: number;
  price: number;
  originalPrice: number;
  discount?: number;
  type: "perfume" | "sample";
}

// NEW: Collection cart item for unlogged users (simplified like backend)
export interface CollectionCartItem {
  id: string;
  collectionId: string;
  collectionName: string;
  collectionDescription?: string;
  collectionImage?: string;
  quantity: number;
  totalPrice: number; // Fixed price for collection
  originalTotalPrice: number; // Same as totalPrice (no discounts)
  discount: number; // Always 0 for collections
}

// UPDATED: Cart structure to match logged users
export interface LocalStorageCart {
  items: CartItem[];
  collectionItems: CollectionCartItem[]; // NEW: Added collections support
  totalItems: number;
  totalPrice: number;
  discount: number; // Only from individual products
  sessionId: string;
  lastUpdated: Date;
}

// UPDATED: Order structure to include collections
export interface LocalStorageOrder {
  orderId: string;
  items: CartItem[];
  collectionItems: CollectionCartItem[]; // NEW: Collections in orders
  totalPrice: number;
  totalItems: number;
  customerInfo?: {
    name?: string;
    phone?: string;
  };
  timestamp: Date;
  status: "pending" | "completed" | "canceled";
}

export interface GuestSession {
  sessionId: string;
  createdAt: Date;
  cart: LocalStorageCart;
  orders: LocalStorageOrder[];
}

export interface LocalStorageKeys {
  GUEST_CART: 'guest_cart';
  GUEST_ORDERS: 'guest_orders';
  GUEST_SESSION: 'guest_session';
}

export interface CartOperationResult {
  success: boolean;
  message: string;
  cart?: LocalStorageCart;
}

export interface AddToCartData {
  productId: string;
  name: string;
  brand: string;
  imageUrl: string;
  size: string;
  quantity: number;
  price: number;
  originalPrice: number;
  discount?: number;
  type: "perfume" | "sample";
}

// NEW: Add collection to cart data
export interface AddCollectionToCartData {
  collectionId: string;
  collectionName: string;
  collectionDescription?: string;
  collectionImage?: string;
  quantity: number;
  price: number; // Fixed collection price
}

export interface UpdateQuantityData {
  itemId: string;
  quantity: number;
}

// UPDATED: WhatsApp message to include collections
export interface WhatsAppOrderMessage {
  orderId: string;
  items: Array<{
    name: string;
    brand: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  collections?: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
    description?: string;
  }>;
  totalPrice: number;
  totalItems: number;
  timestamp: string;
}

// NEW: Cart summary interface
export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  totalDiscount: number;
  subtotalProducts: number;
  subtotalCollections: number;
}

// NEW: Collection operation interfaces
export interface UpdateCollectionQuantityData {
  collectionId: string;
  quantity: number;
}

export interface RemoveCollectionData {
  collectionId: string;
}