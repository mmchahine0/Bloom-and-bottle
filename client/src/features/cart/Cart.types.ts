// UPDATED Cart.types.ts - Cleaned up and compatible with new backend

export interface CollectionProduct {
  productId: string;
  size: string;
  quantity: number;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  discount?: number;
  type: "perfume" | "sample";
}

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  products: CollectionProduct[];
  totalPrice: number;
  originalPrice: number;
  discount?: number;
  type: "collection";
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
  type: "perfume" | "sample" | "collection";
  collectionId?: string;
  collectionProducts?: CollectionProduct[];
}

// UPDATED: Simplified CollectionCartItem to match backend
export interface CollectionCartItem {
  id: string;
  collectionId: string;
  collectionName: string;
  collectionDescription?: string;
  collectionImage?: string;
  quantity: number;
  totalPrice: number; // Fixed price for collection (price * quantity)
  originalTotalPrice: number; // Same as totalPrice (no discounts)
  discount: number; // Always 0 for collections
}

// UPDATED: Cart interface to match backend response
export interface Cart {
  items: CartItem[];
  collectionItems: CollectionCartItem[];
  totalItems: number;
  totalPrice: number;
  originalTotalPrice?: number;
  discount: number; // Only from individual products
}

export interface WhatsAppOrderData {
  orderId: string;
  timestamp: Date;
  customerInfo?: {
    userId: string;
    name: string;
    email: string;
  };
  items: CartItem[];
  collectionItems?: {
    collectionName: string;
    quantity: number;
    products: {
      name: string;
      size: string;
      quantity: number;
      price: number;
      originalPrice: number;
      discount?: number;
    }[];
    totalPrice: number;
    discount?: number;
  }[];
  totalItems: number;
  totalPrice: number;
  originalTotalPrice: number;
  discount: number;
}

export interface OrderSummary {
  orderId: string;
  status: "pending" | "completed" | "canceled";
  createdAt: Date;
  totalPrice: number;
  itemCount: number;
  items: CartItem[];
}

export interface CartOperationResult {
  success: boolean;
  message: string;
  cart?: Cart;
  error?: string;
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
  type: "perfume" | "sample" | "collection";
  collectionId?: string;
  collectionProducts?: CollectionProduct[];
}

export interface UpdateQuantityData {
  itemId: string;
  quantity: number;
}

export interface RemoveItemData {
  itemId: string;
}

export interface CartState {
  isLoading: boolean;
  error: string | null;
  cart: Cart | null;
  isUserLoggedIn: boolean;
  lastUpdated: Date | null;
}

export interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isUserLoggedIn: boolean;
  
  // Cart operations
  addToCart: (item: AddToCartData) => Promise<CartOperationResult>;
  updateQuantity: (itemId: string, quantity: number) => Promise<CartOperationResult>;
  removeItem: (itemId: string) => Promise<CartOperationResult>;
  clearCart: () => Promise<CartOperationResult>;
  
  // Cart utilities
  getItemById: (itemId: string) => CartItem | undefined;
  getItemsByProductId: (productId: string) => CartItem[];
  calculateItemTotal: (item: CartItem) => number;
  
  // Checkout
  checkout: () => Promise<CartOperationResult>;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  discount?: number;
  type: "perfume" | "sample";
  sizes: Array<{
    label: string;
    price: number;
  }>;
  stock: boolean;
  category: "men" | "women" | "un";
  description?: string;
  notes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  featured: boolean;
  limitedEdition: boolean;
  comingSoon: boolean;
}

export interface AddToCartFromProductData {
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CartItemValidation {
  item: CartItem;
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

export interface CartStorageAdapter {
  save: (cart: Cart, userId?: string) => Promise<void>;
  load: (userId?: string) => Promise<Cart | null>;
  clear: (userId?: string) => Promise<void>;
  exists: (userId?: string) => Promise<boolean>;
}

export interface CartConfig {
  maxItems: number;
  maxQuantityPerItem: number;
  enableLocalStorage: boolean;
  enableSync: boolean;
  autoSyncInterval: number; // milliseconds
  whatsappNumber: string;
  storageKey: string;
}

export interface CartAnalytics {
  itemsAdded: number;
  itemsRemoved: number;
  quantityUpdates: number;
  checkouts: number;
  abandonnedCarts: number;
  averageCartValue: number;
  sessionDuration: number;
}

export interface CartEvent {
  type: 'add' | 'remove' | 'update' | 'clear' | 'checkout' | 'abandon';
  timestamp: Date;
  item?: CartItem;
  quantity?: number;
  value?: number;
  userId?: string;
  sessionId: string;
}

export interface CartError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  operation: string;
  recoverable: boolean;
}

export type CartErrorType = 
  | 'NETWORK_ERROR'
  | 'STORAGE_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'SYNC_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'ITEM_NOT_FOUND'
  | 'INVALID_QUANTITY'
  | 'OUT_OF_STOCK'
  | 'UNKNOWN_ERROR';

export interface WhatsAppMessage {
  to: string;
  message: string;
  orderData: WhatsAppOrderData;
}

export interface WhatsAppConfig {
  number: string;
  messageTemplate: string;
  enableDeepLink: boolean;
  includeOrderSummary: boolean;
  includeCustomerInfo: boolean;
}

export interface UseCartOptions {
  autoLoad?: boolean;
  enableSync?: boolean;
  syncInterval?: number;
  enableAnalytics?: boolean;
}

export interface UseCartReturn {
  cart: Cart | null;
  isLoading: boolean;
  error: CartError | null;
  
  // Operations
  addItem: (item: AddToCartData) => Promise<CartOperationResult>;
  updateItem: (itemId: string, quantity: number) => Promise<CartOperationResult>;
  removeItem: (itemId: string) => Promise<CartOperationResult>;
  clearCart: () => Promise<CartOperationResult>;
  checkout: () => Promise<CartOperationResult>;
  
  // Utilities
  getItem: (itemId: string) => CartItem | undefined;
  hasItem: (productId: string, size?: string) => boolean;
  getItemCount: () => number;
  getTotalPrice: () => number;
  
  // State management
  refresh: () => Promise<void>;
  reset: () => void;
}

export interface CartMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (oldCart: any) => Cart;
  validate: (cart: any) => boolean;
}

export interface MigrationResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  itemsMigrated: number;
  errors: string[];
}

// UPDATED: Response interfaces to match backend
export interface CartItemResponse {
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
  type: string;
}

export interface CollectionCartItemResponse {
  id: string;
  collectionId: string;
  collectionName: string;
  collectionDescription?: string;
  collectionImage?: string;
  quantity: number;
  price: number; // Fixed collection price
}

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItemResponse[];
    collectionItems: CollectionCartItemResponse[];
    summary: {
      totalItems: number;
      totalPrice: number;
      totalDiscount: number;
      subtotalProducts: number;
      subtotalCollections: number;
    };
  };
  message?: string;
}

// UPDATED: Simplified collection cart request to match backend
export interface AddToCollectionCartRequest {
  collectionId: string;
  quantity: number;
  items: {
    productId: string;
    size: string;
    quantity: number;
  }[];
}

export interface AddToCollectionCartData extends AddToCollectionCartRequest {
  collectionName: string;
  collectionDescription?: string;
  collectionImage?: string;
  price: number; // Fixed collection price
}

// Guest cart interfaces - UPDATED
export interface GuestCartItem {
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

export interface GuestCollectionCartItem {
  id: string;
  collectionId: string;
  collectionName: string;
  collectionDescription?: string;
  collectionImage?: string;
  quantity: number;
  totalPrice: number;
  originalTotalPrice: number;
  discount: number;
}

export interface GuestCart {
  items: GuestCartItem[];
  collectionItems: GuestCollectionCartItem[];
  totalItems: number;
  totalPrice: number;
  discount: number; // Only from individual products
  sessionId: string;
  lastUpdated: Date;
}