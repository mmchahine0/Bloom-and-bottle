export interface ProductSize {
    label: string;
    price: number;
    _id?: string;
  }
  
  export interface ProductNotes {
    top: string[];
    middle: string[];
    base: string[];
  }
  
  export interface Product {
    _id: string;
    name: string;
    type: "perfume" | "sample";
    sizes: ProductSize[];
    description: string;
    price: number;
    imageUrl: string;
    category: "men" | "women" | "un";
    brand: string;
    notes: string;
    rating: number;
    reviewsCount: number;
    stock: boolean;
    featured: boolean;
    limitedEdition: boolean;
    comingSoon: boolean;
    discount: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ProductResponse {
    product: Product;
    success: boolean;
    message?: string;
  }