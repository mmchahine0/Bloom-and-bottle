 // Frontend expected types
export interface FeaturedItem {
    _id: string;
    name: string;
    brand: string;
    price: number;
    sizes: number[];
    image: string;
    type: string;
  }
  
  export interface CollectionProduct {
    _id: string;
    name: string;
    image: string;
  }
  
  export interface Collection {
    _id: string;
    title: string;
    description: string;
    products: CollectionProduct[];
  }
  
  export interface Feedback {
    _id: string;
    screenshot: string;
  }
  
  export interface HomepageData {
    featuredItems: FeaturedItem[];
    collections: Collection[];
    feedbacks: Feedback[];
  }
  
  export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: any[];
  }
  
  // Backend model types
  export interface ICollection {
    _id: string;
    name: string;
    description?: string;
    perfumes: string[] | IPerfume[];
    image?: string;
    featured: boolean;
    createdAt: Date;
  }
  
  export interface ITestimonial {
    _id: string;
    imageUrl: string;
    featured: boolean;
    createdAt: Date;
  }
  
  export interface IPerfume {
    _id: string;
    name: string;
    type: 'perfume' | 'sample';
    sizes: Array<{
      label: string;
      price: number;
    }>;
    description?: string;
    price: number;
    imageUrl?: string;
    category: 'men' | 'women' | 'un';
    brand?: string;
    notes: {
      top: string[];
      middle: string[];
      base: string[];
    };
    rating: number;
    reviewsCount: number;
    stock: number;
    featured: boolean;
    limitedEdition: boolean;
    comingSoon: boolean;
    discount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Request body types
  export interface CreateCollectionRequest {
    name: string;
    description?: string;
    perfumes?: string[];
    image?: string;
    featured?: boolean;
  }
  
  export interface UpdateCollectionRequest {
    name?: string;
    description?: string;
    perfumes?: string[];
    image?: string;
    featured?: boolean;
  }
  
  export interface CreateTestimonialRequest {
    imageUrl: string;
    featured?: boolean;
  }
  
  export interface UpdateTestimonialRequest {
    imageUrl?: string;
    featured?: boolean;
  }
  
  // Route params
  export interface GetByIdParams {
    id: string;
  }