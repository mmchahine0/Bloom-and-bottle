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
    title: string;
    image: string;
  }
  
  export interface Collection {
    _id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    products: Array<{
      _id: string;
      name: string;
      brand: string;
      image: string;
      sizes: Array<{
        size: string;
        price: number;
      }>;
    }>;
  }
  
  export interface Feedback {
    _id: string;
    screenshot: string;
  }
  
  export interface HomepageData {
    featuredItems: Array<{
      _id: string;
      name: string;
      brand: string;
      price: number;
      sizes: Array<{ label: string; price: number }>;
      image: string;
      type: string;
    }>;
    collections: Collection[];
    feedbacks: Array<{
      _id: string;
      screenshot: string;
    }>;
  }
  
  export interface ApiResponse<T> {
    data: T;
    message?: string;
    status?: number;
  }
  
  export interface AddToCollectionCartRequest {
    collectionId: string;
    products: Array<{
      productId: string;
      size: string;
      quantity: number;
    }>;
    quantity?: number;
  }
  
  export interface HomeData {
    collections: Collection[];
    // ... other existing types ...
  }
  