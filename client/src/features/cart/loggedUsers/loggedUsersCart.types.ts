import type { CartItem, Cart, CollectionProduct } from '../Cart.types';

// API Request/Response Types
export interface CartAPIResponse {
  success: boolean;
  message: string;
  data: {
    items: CartItemAPI[];
    totalItems: number;
    totalPrice: number;
    discount: number;
  };
}

export interface CartItemAPI {
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
  type: 'perfume' | 'sample' | 'collection';
}

export interface AddToCartRequest {
  productId: string;
  size: string;
  quantity: number;
  type: 'perfume' | 'sample' | 'collection';
  collectionId?: string;
  collectionProducts?: CollectionProduct[];
}

export interface UpdateCartRequest {
  itemId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  itemId: string;
}

export interface AddToCartAPIResponse {
  success: boolean;
  message: string;
  data: {
    items: CartItemAPI[];
    totalItems: number;
    totalPrice: number;
    discount: number;
  };
}

export interface UpdateCartAPIResponse {
  success: boolean;
  message: string;
  data: {
    items: CartItemAPI[];
    totalItems: number;
    totalPrice: number;
    discount: number;
  };
}

export interface RemoveCartAPIResponse {
  success: boolean;
  message: string;
  data: {
    items: CartItemAPI[];
    totalItems: number;
    totalPrice: number;
    discount: number;
  };
}

export interface ClearCartAPIResponse {
  success: boolean;
  message: string;
  data: {
    items: CartItemAPI[];
    totalItems: number;
    totalPrice: number;
    discount: number;
  };
}

// Order Types
export interface SaveOrderRequest {
  items: Array<{
    productId: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
}

export interface SaveOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      _id: string;
      user: string;
      items: Array<{
        product: string;
        size: string;
        quantity: number;
      }>;
      totalPrice: number;
      status: 'pending' | 'completed' | 'canceled';
      createdAt: string;
    };
  };
}

export interface GetUserOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Array<{
      _id: string;
      user: string;
      items: Array<{
        product: {
          _id: string;
          name: string;
          brand: string;
          imageUrl: string;
          price: number;
          type: 'perfume' | 'sample';
        };
        size: string;
        quantity: number;
      }>;
      totalPrice: number;
      status: 'pending' | 'completed' | 'canceled';
      createdAt: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

// Sync and Conflict Resolution Types
export interface SyncStatus {
  isLoading: boolean;
  lastSynced: Date | null;
  hasConflict: boolean;
  syncError: string | null;
}

export interface CartConflict {
  localCart: CartItem[];
  serverCart: CartItem[];
  conflictType: 'local_newer' | 'server_newer' | 'different_items';
}

export interface ConflictResolution {
  strategy: 'keep_local' | 'keep_server' | 'merge';
  items: CartItem[];
}

export interface MigrateGuestCartRequest {
  guestCart: {
    items: Array<{
      productId: string;
      size: string;
      quantity: number;
    }>;
  };
}

export interface MigrateGuestCartResponse {
  success: boolean;
  message: string;
  data: {
    items: CartItemAPI[];
    totalItems: number;
    totalPrice: number;
    discount: number;
    migratedItems: number;
  };
}

// WhatsApp Order Types for Logged Users
export interface LoggedUserWhatsAppOrder {
  orderId: string;
  databaseOrderId: string;
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
  customerInfo: {
    name?: string;
    email?: string;
    userId: string;
  };
}

// Cart State Types
export interface LoggedUserCart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  discount: number;
  lastSynced: Date | null;
}

export interface CartOperationState {
  isLoading: boolean;
  error: string | null;
  operation: 'add' | 'update' | 'remove' | 'clear' | 'sync' | null;
}

// Local Storage Types for Logged Users (backup)
export interface LoggedUserLocalCart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  discount: number;
  userId: string;
  lastSynced: Date;
  needsSync: boolean;
}

export interface OfflineCartAction {
  type: 'add' | 'update' | 'remove' | 'clear';
  payload: CartItem | string | null;
  timestamp: Date;
  synced: boolean;
}

// Utility Types
export interface CartItemTransform {
  fromAPI: (apiItem: CartItemAPI) => CartItem;
  toAPI: (cartItem: CartItem) => AddToCartRequest;
}

export interface CartCalculations {
  calculateItemPrice: (item: CartItem) => number;
  calculateCartTotal: (items: CartItem[]) => { totalItems: number; totalPrice: number };
  applyDiscount: (price: number, discount: number) => number;
}

// Helper function to transform CartItemAPI to CartItem
export const transformCartItemAPI = (apiItem: CartItemAPI): CartItem => ({
  id: apiItem.id,
  productId: apiItem.productId,
  name: apiItem.name,
  brand: apiItem.brand,
  imageUrl: apiItem.imageUrl,
  size: apiItem.size,
  quantity: apiItem.quantity,
  price: apiItem.price,
  originalPrice: apiItem.originalPrice,
  discount: apiItem.discount,
  type: apiItem.type
});

// Helper function to transform API cart response to Cart type
export const transformCartAPIResponse = (response: CartAPIResponse): Cart => {
  if (!response?.data?.items) {
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0,
      discount: 0
    };
  }

  return {
    items: response.data.items.map(transformCartItemAPI),
    totalItems: response.data.totalItems || 0,
    totalPrice: response.data.totalPrice || 0,
    discount: response.data.discount || 0
  };
};

export interface PlaceOrderRequest {
  items: Array<{
    productId: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  
}

export interface PlaceOrderAPIResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    orderId: string;
    items: Array<{
      product: string;
      size: string;
      quantity: number;
      price: number;
    }>;
    totalPrice: number;
    status: string;
    createdAt: string;
  };
}