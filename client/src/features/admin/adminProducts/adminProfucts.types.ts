export interface PaginationMetadata {
  nextPage: number | null;
  totalItems: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  category?: string;
  brand?: string;
  featured?: boolean;
  limitedEdition?: boolean;
  comingSoon?: boolean;
  priceMin?: number;
  priceMax?: number;
  dateFrom?: string;
  dateTo?: string;
  sortDirection?: "asc" | "desc";
  sortBy?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Size {
  label: string;
  price: number;
}

export interface Notes {
  top: string[];
  middle: string[];
  base: string[];
}

export interface Product {
  id: string;
  name: string;
  type: "perfume" | "sample";
  sizes: Size[];
  description: string;
  price: number;
  imageUrl: string;
  category: "men" | "women" | "un";
  brand: string;
  notes: Notes;
  rating: number;
  reviewsCount: number;
  stock: number;
  featured: boolean;
  limitedEdition: boolean;
  comingSoon: boolean;
  discount: number;
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithCreator extends Omit<Product, "createdBy"> {
  createdBy: User;
}

export interface ProductsResponse {
  statusCode: number;
  message: string;
  data: ProductWithCreator[];
  pagination: PaginationMetadata;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  productId: string;
  action: "delete" | null;
}

export interface EditDialogState {
  isOpen: boolean;
  product: ProductWithCreator | null;
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
