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
  minPrice?: number;
  maxPrice?: number;
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

export interface CreateProductInput {
  name: string;
  type: "perfume" | "sample";
  sizes: { label: string; price: number }[];
  description?: string;
  price: number;
  category: "men" | "women" | "un";
  brand: string;
  notes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  stock?: boolean;
  featured?: boolean;
  limitedEdition?: boolean;
  comingSoon?: boolean;
  discount?: number;
}

export interface Product extends CreateProductInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  imageUrl?: string;
  rating?: number;
  reviewsCount?: number;
}

export interface ProductWithCreator extends Omit<Product, "createdBy"> {
  _id: string;
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
