export interface PaginationMetadata {
  nextPage: number | null;
  totalItems: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortDirection?: "asc" | "desc";
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface OrderItem {
  product: string; // Product ID
  size: string;
  quantity: number;
}

export interface OrderItemExtended {
  product: Product;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  user: string; // User ID
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "completed" | "canceled";
  createdAt: string;
}

export interface OrderWithExtras {
  id: string;
  user: User;
  items: OrderItemExtended[];
  totalPrice: number;
  status: "pending" | "completed" | "canceled";
  createdAt: string;
}

export interface OrdersResponse {
  statusCode: number;
  message: string;
  data: OrderWithExtras[];
  pagination: PaginationMetadata;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  orderId: string;
  action: "delete" | null;
}

export interface StatusMessage {
  type: "success" | "error" | "info";
  message: string;
}

export interface APIError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message: string;
}
