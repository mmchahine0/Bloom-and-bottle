import { Document, Types } from 'mongoose';

// Base interfaces
export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  discount: number;
  type: 'perfume' | 'sample';
  sizes?: Array<{ 
    label: string; 
    price: number; 
  }>;
}

export interface ICollection {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  price: number;
  featured: boolean;
  perfumes: Types.ObjectId[];
  createdAt: Date;
}

export interface ICollectionWithProducts extends Omit<ICollection, 'perfumes'> {
  perfumes: IProduct[];
}

// Cart item interfaces
export interface ICartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  size: string;
  quantity: number;
  price: number;
  originalPrice: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItemWithProduct extends Omit<ICartItem, 'product'> {
  product: IProduct;
  price: number;
  originalPrice: number;
  discount: number;
}

export interface ICollectionCartItem {
  _id: Types.ObjectId;
  collectionId: Types.ObjectId;
  products: Array<{
    productId: Types.ObjectId;
    size: string;
    quantity: number;
  }>;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICollectionCartItemWithPopulated extends Omit<ICollectionCartItem, 'collectionId'> {
  collectionId: ICollection;
}

// Cart interface
export interface ICart extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: Types.DocumentArray<ICartItem>;
  collectionItems: Types.DocumentArray<ICollectionCartItem>;
  totalItems: number;
  totalPrice: number;
  discount: number;
  lastUpdated: Date;
}

// Response interfaces for frontend
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

export interface CollectionCartItemResponse {
  id: string;
  collectionId: string;
  collectionName: string;
  collectionDescription?: string;
  collectionImage?: string;
  quantity: number;
  price: number; // Fixed collection price
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  totalDiscount: number;
  subtotalProducts: number;
  subtotalCollections: number;
}

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItemResponse[];
    collectionItems: CollectionCartItemResponse[];
    summary: CartSummary;
  };
  message?: string;
}

// Request interfaces
export interface AddToCartRequest {
  productId: string;
  size: string;
  quantity?: number;
}

export interface AddCollectionToCartRequest {
  collectionId: string;
  quantity?: number;
}

export interface UpdateQuantityRequest {
  quantity: number;
}

// Order compatibility interfaces
export interface OrderItem {
  productId: string;
  size: string;
  quantity: number;
  price: number;
}

export interface CreateOrderData {
  items: OrderItem[];
  totalPrice: number;
}