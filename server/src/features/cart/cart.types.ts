import { Document, Types } from 'mongoose';

// Base Product interface
export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  type?: string;
  sizes?: Array<{ 
    label: string; 
    price: number; 
    originalPrice?: number 
  }>;
}

// Base User interface
export interface IUser {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
}

// Base Collection interface
export interface ICollection {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  perfumes: Types.ObjectId[];
  image?: string;
  featured: boolean;
  createdAt: Date;
}

// Collection with populated products
export interface ICollectionWithProducts extends Omit<ICollection, 'perfumes'> {
  perfumes: IProduct[];
}

// Cart Item interface
export interface ICartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId | IProduct;
  size: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Item with populated product
export interface ICartItemWithProduct extends Omit<ICartItem, 'product'> {
  product: IProduct;
}

// NEW: Collection Cart Item interface
export interface ICollectionCartItem extends Document {
  _id: Types.ObjectId;
  collectionId: Types.ObjectId;
  products: Array<{
    productId: Types.ObjectId;
    size: string;
    quantity: number;
  }>;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// NEW: Collection Cart Item with populated data
export interface ICollectionCartItemWithProduct extends Omit<ICollectionCartItem, 'collectionId' | 'products'> {
  collectionId: ICollection;
  products: Array<{
    product: IProduct;
    size: string;
    quantity: number;
  }>;
}

// Cart interface
export interface ICart extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: Types.DocumentArray<ICartItem>;
  collectionItems: Types.DocumentArray<ICollectionCartItem>; // NEW
  totalItems: number;
  totalPrice: number;
  discount: number;
  lastUpdated: Date;
}

// Cart item response sent to client
export interface CartItemResponse {
  id: string;
  productId: string;
  name: string;
  brand: string;
  imageUrl: string;
  size: string;
  quantity: number;
  price: number;
  originalPrice: number;
  discount: number;
  type: string;
}

// NEW: Collection cart item response
export interface CollectionCartItemResponse {
  id: string;
  collectionId: string;
  collectionName: string;
  collectionDescription?: string;
  collectionImage?: string;
  products: Array<{
    productId: string;
    name: string;
    brand: string;
    imageUrl: string;
    size: string;
    quantity: number;
    price: number;
    originalPrice: number;
    discount: number;
    type: string;
  }>;
  quantity: number;
  totalPrice: number;
  originalTotalPrice: number;
  discount: number;
}

// Cart response structure
export interface CartResponse {
  success: boolean;
  data: {
    items: CartItemResponse[];
    collectionItems: CollectionCartItemResponse[]; // NEW
    totalItems: number;
    totalPrice: number;
    discount: number;
  };
  message?: string;
}

// Admin cart aggregation result
export interface AdminCartResult {
  _id: Types.ObjectId;
  user: IUser;
  items: Array<{
    _id: Types.ObjectId;
    product: IProduct;
    size: string;
    quantity: number;
    createdAt: Date;
  }>;
  collectionItems: Array<ICollectionCartItemWithProduct>; // NEW
  totalItems: number;
  totalPrice?: number;
  discount?: number;
  lastUpdated: Date;
}

// NEW: Add to collection cart request
export interface AddToCollectionCartRequest {
  collectionId: string;
  products: Array<{
    productId: string;
    size: string;
    quantity: number;
  }>;
  quantity: number;
}

// NEW: Add to collection cart data (for frontend)
export interface AddToCollectionCartData extends AddToCollectionCartRequest {
  collectionName: string;
  collectionDescription?: string;
  collectionImage?: string;
  productDetails: Array<{
    productId: string;
    name: string;
    brand: string;
    imageUrl: string;
    size: string;
    quantity: number;
    price: number;
    originalPrice: number;
    discount: number;
    type: string;
  }>;
}