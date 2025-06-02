export interface Collection {
    _id: string;
    name: string;
    description?: string;
    perfumes: string[]; 
    image?: string;
    featured: boolean;
    createdAt: Date;
    updatedAt?: Date;
  }
  
  export interface Testimonial {
    _id: string;
    imageUrl: string;
    featured: boolean;
    createdAt: Date;
    updatedAt?: Date;
  }
  
  export interface CollectionParams {
    page: number;
    limit: number;
    search?: string;
    featured?: boolean;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }
  
  export interface TestimonialParams {
    page: number;
    limit: number;
    search?: string;
    featured?: boolean;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }
  
  export interface CollectionsResponse {
    data: Collection[];
    pagination: {
      totalItems: number;
      currentPage: number;
      nextPage: number | null;
    };
  }
  
  export interface TestimonialsResponse {
    data: Testimonial[];
    pagination: {
      totalItems: number;
      currentPage: number;
      nextPage: number | null;
    };
  }
  
  export interface CreateCollectionData {
    name: string;
    description?: string;
    perfumes?: string[];
    image?: string;
    featured?: boolean;
  }
  
  export interface UpdateCollectionData {
    name?: string;
    description?: string;
    perfumes?: string[];
    image?: string;
    featured?: boolean;
  }
  
  export interface CreateTestimonialData {
    imageUrl: string;
    featured?: boolean;
  }
  
  export interface UpdateTestimonialData {
    imageUrl?: string;
    featured?: boolean;
  }