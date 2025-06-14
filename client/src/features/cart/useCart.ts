import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import type { RootState } from '@/redux/persist/persist';
import type { AddToCartRequest } from './loggedUsers/loggedUsersCart.types';
import type { AddToCartData, CartItem } from './Cart.types';
import type { AddToCollectionCartRequest, AddToCollectionCartData } from './Cart.types';
import { addToCartAPI } from './loggedUsers/loggedUsersCart.services';
import {addCollectionToCartAPI} from "../home/Home.services"

const STORAGE_KEYS = {
  GUEST_CART: 'guest_cart',
} as const;

// Guest cart interface
interface GuestCart {
  items: CartItem[];
  collectionItems: GuestCollectionCartItem[];
  totalItems: number;
  totalPrice: number;
  discount: number;
  sessionId: string;
  lastUpdated: Date;
}

// Guest collection cart item interface
interface GuestCollectionCartItem {
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

export const useCart = () => {
  const { toast } = useToast();
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  const userId = useSelector((state: RootState) => state.auth?.id);
  const isAuthenticated = !!(accessToken && userId);

  // Add to cart mutation for logged users
  const addToCartMutation = useMutation({
    mutationFn: (item: AddToCartRequest) => addToCartAPI(item, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast({
        title: 'Success',
        description: 'Item added to cart successfully',
      });
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // NEW: Add collection to cart mutation for logged users
  const addCollectionToCartMutation = useMutation({
    mutationFn: (collection: AddToCollectionCartRequest) => addCollectionToCartAPI(collection, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast({
        title: 'Success',
        description: 'Collection added to cart successfully',
      });
    },
    onError: (error) => {
      console.error('Error adding collection to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add collection to cart. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Get or create guest cart
  const getGuestCart = (): GuestCart => {
    const existingCart = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
    if (existingCart) {
      return JSON.parse(existingCart);
    }

    return {
      items: [],
      collectionItems: [],
      totalItems: 0,
      totalPrice: 0,
      discount: 0,
      sessionId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date(),
    };
  };

  // Calculate guest cart totals
  const calculateGuestCartTotals = (cart: GuestCart): GuestCart => {
    // Calculate individual items totals
    const itemsTotalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const itemsTotalPrice = cart.items.reduce((sum, item) => {
      const itemPrice = item.discount && item.discount > 0 
        ? item.originalPrice - (item.originalPrice * (item.discount / 100))
        : item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);

    // Calculate collection items totals
    const collectionsTotalItems = cart.collectionItems.reduce((sum, item) => sum + item.quantity, 0);
    const collectionsTotalPrice = cart.collectionItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      ...cart,
      totalItems: itemsTotalItems + collectionsTotalItems,
      totalPrice: itemsTotalPrice + collectionsTotalPrice,
      lastUpdated: new Date(),
    };
  };

  // Add to cart for unlogged users
  const addToCartUnlogged = (productData: AddToCartData) => {
    try {
      let cart = getGuestCart();

      const existingItemIndex = cart.items.findIndex(
        (item: CartItem) => item.productId === productData.productId && item.size === productData.size
      );

      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += productData.quantity;
      } else {
        cart.items.push({
          id: `${productData.productId}_${productData.size}_${Date.now()}`,
          ...productData,
        });
      }

      cart = calculateGuestCartTotals(cart);
      localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cart));
      
      toast({
        title: 'Success',
        description: 'Item added to cart successfully',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    }
  };

  // NEW: Add collection to cart for unlogged users
  const addCollectionToCartUnlogged = (collectionData: AddToCollectionCartData) => {
    try {
      let cart = getGuestCart();

      const existingCollectionIndex = cart.collectionItems.findIndex(
        (item) => item.collectionId === collectionData.collectionId
      );

      if (existingCollectionIndex >= 0) {
        // Update existing collection quantity
        cart.collectionItems[existingCollectionIndex].quantity += collectionData.quantity;
        
        // Recalculate totals for this collection item
        const collectionItem = cart.collectionItems[existingCollectionIndex];
        let totalPrice = 0;
        let originalTotalPrice = 0;

        collectionItem.products.forEach(product => {
          const itemPrice = product.discount && product.discount > 0 
            ? product.originalPrice - (product.originalPrice * (product.discount / 100))
            : product.price;
          totalPrice += itemPrice * product.quantity;
          originalTotalPrice += product.originalPrice * product.quantity;
        });

        collectionItem.totalPrice = totalPrice * collectionItem.quantity;
        collectionItem.originalTotalPrice = originalTotalPrice * collectionItem.quantity;
        collectionItem.discount = (originalTotalPrice - totalPrice) * collectionItem.quantity;
      } else {
        // Calculate totals for new collection item
        let totalPrice = 0;
        let originalTotalPrice = 0;

        collectionData.productDetails.forEach(product => {
          const itemPrice = product.discount && product.discount > 0 
            ? product.originalPrice - (product.originalPrice * (product.discount / 100))
            : product.price;
          totalPrice += itemPrice * product.quantity;
          originalTotalPrice += product.originalPrice * product.quantity;
        });

        // Add new collection item to cart
        cart.collectionItems.push({
          id: `collection_${collectionData.collectionId}_${Date.now()}`,
          collectionId: collectionData.collectionId,
          collectionName: collectionData.collectionName,
          collectionDescription: collectionData.collectionDescription,
          collectionImage: collectionData.collectionImage,
          products: collectionData.productDetails,
          quantity: collectionData.quantity,
          totalPrice: totalPrice * collectionData.quantity,
          originalTotalPrice: originalTotalPrice * collectionData.quantity,
          discount: (originalTotalPrice - totalPrice) * collectionData.quantity,
        });
      }

      cart = calculateGuestCartTotals(cart);
      localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cart));
      
      toast({
        title: 'Success',
        description: 'Collection added to cart successfully',
      });
    } catch (error) {
      console.error('Error adding collection to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add collection to cart',
        variant: 'destructive',
      });
    }
  };

  // Main add to cart function
  const addToCart = (item: AddToCartData) => {
    if (isAuthenticated) {
      addToCartMutation.mutate(item as AddToCartRequest);
    } else {
      addToCartUnlogged(item);
    }
  };

  // NEW: Main add collection to cart function
  const addCollectionToCart = (collection: AddToCollectionCartData) => {
    if (isAuthenticated) {
      addCollectionToCartMutation.mutate(collection as AddToCollectionCartRequest);
    } else {
      addCollectionToCartUnlogged(collection);
    }
  };

  return {
    addToCart,
    addCollectionToCart, // NEW
    isAuthenticated,
  };
};