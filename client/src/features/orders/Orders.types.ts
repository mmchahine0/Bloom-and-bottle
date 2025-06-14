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
    _id: string;
  }
  
  export interface UserOrder {
    _id: string;
    user: string; 
    items: OrderItem[];
    totalPrice: number;
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