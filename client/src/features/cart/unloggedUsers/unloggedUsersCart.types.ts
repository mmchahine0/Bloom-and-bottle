export interface LocalStorageCart {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    discount: number;
    sessionId: string;
    lastUpdated: Date;
  }
  
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
  
  export interface LocalStorageOrder {
    orderId: string;
    items: CartItem[];
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
  
  export interface UpdateQuantityData {
    itemId: string;
    quantity: number;
  }
  
  export interface WhatsAppOrderMessage {
    orderId: string;
    items: Array<{
      name: string;
      brand: string;
      size: string;
      quantity: number;
      price: number;
    }>;
    totalPrice: number;
    totalItems: number;
    timestamp: string;
  }