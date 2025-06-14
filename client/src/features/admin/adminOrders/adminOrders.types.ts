import { ReactNode } from "react";

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
  [x: string]: ReactNode;
  id: string;
  email: string;
  name?: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  type: 'perfume' | 'sample' | 'collection';
}

export interface OrderItem {
  product: string; // Product ID
  size: string;
  quantity: number;
  _id: string;
}

export interface OrderItemExtended {
  product: Product;
  size: string;
  quantity: number;
  _id: string;
}

export interface Order {
  _id: string;
  user: string; // User ID
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "completed" | "canceled";
  createdAt: string;
}

export interface OrderWithExtras {
  _id: string;
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
