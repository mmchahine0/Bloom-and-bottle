// Collection Types
export interface Collection {
    id: string;
    _id?: string;
    name: string;
    description?: string;
    image?: string;
    featured: boolean;
    price: number;
    perfumes?: ProductWithCreator[];
    createdAt: string;
    updatedAt?: string;
  }
  
  export interface CollectionWithPerfumes extends Omit<Collection, 'perfumeIds'> {
    perfumes: ProductWithCreator[]; // Populated perfumes
  }
  
  // Product Types (for selection in collections)
  export interface Product {
    id: string;
    _id?: string;
    name: string;
    brand: string;
    type: "perfume" | "sample";
    category: "men" | "women" | "un";
    price: number;
    discount?: number;
    stock?: boolean;
    imageUrl: string;
    description?: string;
    featured: boolean;
    limitedEdition: boolean;
    comingSoon: boolean;
    createdAt: string;
    updatedAt?: string;
  }
  
  export interface ProductWithCreator extends Product {
    createdBy?: {
      id: string;
      name: string;
      email: string;
    };
  }
  
  // Feedback Picture Types
  export interface FeedbackPicture {
    id: string;
    _id?: string;
    imageUrl: string;
    customerName?: string;
    productName?: string;
    rating?: number;
    comment?: string;
    featured: boolean;
    approved: boolean;
    createdAt: string;
    updatedAt?: string;
  }
  
  // API Response Types
  export interface CollectionsResponse {
    data: CollectionWithPerfumes[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage?: number;
      prevPage?: number;
    };
  }
  
  export interface ProductsResponse {
    data: ProductWithCreator[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage?: number;
      prevPage?: number;
    };
  }
  
  export interface FeedbackPicturesResponse {
    data: FeedbackPicture[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage?: number;
      prevPage?: number;
    };
  }
  
  // Pagination and Filter Parameters
  export interface PaginationParams {
    page: number;
    limit: number;
    search?: string;
    featured?: boolean;
    sortDirection?: "asc" | "desc";
    sortBy?: string;
    dateFrom?: string;
    dateTo?: string;
  }
  
  export interface CollectionParams extends PaginationParams {
    includePerfumes?: boolean;
    perfumeIds?: string[];
    category?: "men" | "women" | "un";
  }
  
  export interface FeedbackParams extends PaginationParams {
    approved?: boolean;
    rating?: number;
    productName?: string;
  }
  
  // Dialog and UI State Types
  export interface ConfirmDialogState {
    isOpen: boolean;
    itemId: string;
    action: "delete" | "approve" | "feature" | null;
    itemType: "collection" | "feedback";
  }
  
  export interface StatusMessage {
    type: "success" | "error" | "warning";
    message: string;
  }
  
  // Form Data Types
  export interface CollectionFormData {
    name: string;
    description?: string;
    perfumeIds: string[];
    image?: File | string;
    featured: boolean;
  }
  
  export interface FeedbackFormData {
    imageUrl?: string;
    customerName?: string;
    productName?: string;
    rating?: number;
    comment?: string;
    featured: boolean;
    approved: boolean;
  }
  
  // Tab Management
  export type AdminTab = "collections" | "feedback";
  
  export interface TabConfig {
    id: AdminTab;
    label: string;
    description: string;
  }
  