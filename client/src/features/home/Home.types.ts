export interface Size {
    label: string;
    price: number;
  }
  
  export interface FeaturedItem {
    _id: string;
    name: string;
    brand: string;
    price: number;
    sizes: Size[];
    image: string;
    type: "perfume" | "sample";
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
  
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  