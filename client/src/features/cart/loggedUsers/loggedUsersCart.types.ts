import type { CartItem, Cart } from '../Cart.types';

// UPDATED: API Response Types to match new backend structure
export interface CartAPIResponse {
  success: boolean;
  message?: string;
  data: {
    items: CartItemAPI[];
    collectionItems: CollectionCartItemAPI[];
    summary: {
      totalItems: number;
      totalPrice: number;
      totalDiscount: number;
      subtotalProducts: number;
      subtotalCollections: number;
    };
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
  discount: number;
  type: 'perfume' | 'sample';
}

// UPDATED: Simplified collection response to match backend
export interface CollectionCartItemAPI {
  id: string;
  collectionId: string;
  collectionName: string;
  collectionDescription?: string;
  collectionImage?: string;
  quantity: number;
  price: number; // Fixed collection price per unit (backend provides this)
}

export interface AddToCartRequest {
  productId: string;
  size: string;
  quantity: number;
  type?: 'perfume' | 'sample' | 'collection';
  collectionId?: string;
  collectionProducts?: Array<{
    productId: string;
    size: string;
    quantity: number;
  }>;
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
  message?: string;
  data: {
    items: CartItemAPI[];
    collectionItems: CollectionCartItemAPI[]; 
    summary: {
      totalItems: number;
      totalPrice: number;
      totalDiscount: number;
      subtotalProducts: number;
      subtotalCollections: number;
    };
  };
}

// Since these interfaces are identical to AddToCartAPIResponse, we can use type aliases instead
export type UpdateCartAPIResponse = AddToCartAPIResponse;
export type RemoveCartAPIResponse = AddToCartAPIResponse;
export type ClearCartAPIResponse = AddToCartAPIResponse;

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

// WhatsApp Order Types for Logged Users
export interface WhatsAppCollectionItem {
  name: string;
  quantity: number;
  totalPrice: number;
  description?: string;
}

export interface LoggedUserWhatsAppOrder {
  orderId: string;
  items: Array<{
    name: string;
    brand: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  collections?: WhatsAppCollectionItem[];
  totalPrice: number;
  totalItems: number;
  timestamp: string;
  customerInfo: {
    userId: string;
    name?: string;
    email?: string;
  };
  databaseOrderId: string;
}

// UPDATED: Collection request to match backend
export interface AddCollectionToCartRequest {
  collectionId: string;
  quantity: number;
  items: Array<{
    productId: string;
    size: string;
    quantity: number;
  }>;
}

// UPDATED: Place order request to match backend
export interface PlaceOrderRequest {
  items: Array<{
    productId: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  collectionItems: Array<{
    collectionId: string;
    quantity: number;
    totalPrice: number;
  }>;
  totalPrice: number;
  originalTotalPrice?: number;
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
    originalTotalPrice?: number;
    status: string;
    createdAt: string;
  };
}

// UPDATED: Helper function to transform CartItemAPI to CartItem
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

// FIXED: Helper function to transform API cart response to Cart type
export const transformCartAPIResponse = (response: CartAPIResponse): Cart => {
  if (!response || !response.data) {
    return {
      items: [],
      collectionItems: [],
      totalItems: 0,
      totalPrice: 0,
      discount: 0,
    };
  }

  return {
    items: response.data.items.map(transformCartItemAPI),
    collectionItems: response.data.collectionItems.map(item => ({
      id: item.id,
      collectionId: item.collectionId,
      collectionName: item.collectionName,
      collectionDescription: item.collectionDescription,
      collectionImage: item.collectionImage,
      quantity: item.quantity,
      // FIXED: Don't multiply by quantity here - backend provides per-unit price
      // The totalPrice should be calculated as price * quantity in the display logic
      totalPrice: item.price, // This is the per-unit price from backend
      originalTotalPrice: item.price, // No discounts for collections
      discount: 0, // Collections don't have discounts
    })),
    totalItems: response.data.summary.totalItems,
    totalPrice: response.data.summary.totalPrice,
    discount: response.data.summary.totalDiscount,
  };
};