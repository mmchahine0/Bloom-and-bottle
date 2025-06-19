export interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  type: 'perfume' | 'sample' | 'collection';
}

export interface OrderItem {
  product: Product;
  size: string;
  quantity: number;
  price: number;
  originalPrice: number;
  discount: number;
  _id: string;
  type: 'perfume' | 'sample';
}

// New interfaces for collection items
export interface CollectionProduct {
  productId: Product;
  name: string;
  size: string;
  quantity: number;
  price: number;
  originalPrice: number;
  discount: number;
}

export interface Collection {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
}

export interface OrderCollectionItem {
  collectionId: Collection;
  collectionName: string;
  products: CollectionProduct[];
  quantity: number;
  totalPrice: number;
  originalTotalPrice: number;
  discount: number;
  _id: string;
}

export interface UserOrder {
  _id: string;
  user: string; 
  items: OrderItem[];
  collectionItems: OrderCollectionItem[]; // Added this
  totalItems: number;
  totalPrice: number;
  originalTotalPrice: number;
  discount: number;
  status: "pending" | "completed" | "canceled";
  createdAt: string;
  updatedAt?: string;
}

export interface UserOrdersResponse {
  statusCode?: number;
  message?: string;
  data?: UserOrder[];
}

export interface APIError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  message: string;
}

export interface OrdersResponse {
  success: boolean;
  data: UserOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}