import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import type { RootState } from '@/redux/persist/persist';
import type { AddToCartRequest, AddCollectionToCartRequest } from './loggedUsers/loggedUsersCart.types';
import type { AddToCartData, CartItem } from './Cart.types';
import { addToCartAPI, addCollectionToCartAPI } from './loggedUsers/loggedUsersCart.services';

const STORAGE_KEYS = {
  GUEST_CART: 'guest_cart',
} as const;

// FIXED: Guest cart interface matching the unlogged users cart structure
interface GuestCart {
  items: CartItem[];
  collectionItems: GuestCollectionCartItem[];
  totalItems: number;
  totalPrice: number;
  discount: number;
  sessionId: string;
  lastUpdated: Date;
}

// FIXED: Guest collection cart item interface matching unlogged users cart
interface GuestCollectionCartItem {
  id: string;
  collectionId: string;
  collectionName: string;
  collectionDescription?: string;
  collectionImage?: string;
  quantity: number;
  totalPrice: number; // Fixed price for collection
  originalTotalPrice: number;
  discount: number; // Always 0 for collections
}

export const useCart = () => {
  const { toast } = useToast();
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  const userId = useSelector((state: RootState) => state.auth?.id);
  const isAuthenticated = !!(accessToken && userId);

  // FIXED: Helper function to invalidate cart cache
  const invalidateCartCache = () => {
    // Invalidate all cart-related queries
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    
    // Force refetch the cart data
    queryClient.refetchQueries({ queryKey: ['cart', userId] });
  };

  // Add to cart mutation for logged users - FIXED
  const addToCartMutation = useMutation({
    mutationFn: (item: AddToCartRequest) => addToCartAPI(item, accessToken!),
    onSuccess: () => {
      // FIXED: More aggressive cache invalidation
      invalidateCartCache();
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

  // UPDATED: Add collection to cart mutation for logged users - FIXED
  const addCollectionToCartMutation = useMutation({
    mutationFn: (collection: AddCollectionToCartRequest) => addCollectionToCartAPI(collection, accessToken!),
    onSuccess: () => {
      // FIXED: More aggressive cache invalidation
      invalidateCartCache();
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

  // FIXED: Get or create guest cart with proper validation
  const getGuestCart = (): GuestCart => {
    try {
      const existingCart = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
      if (existingCart) {
        const parsedCart = JSON.parse(existingCart);
        
        // FIXED: Ensure all required fields exist with validation
        return {
          items: Array.isArray(parsedCart.items) ? parsedCart.items : [],
          collectionItems: Array.isArray(parsedCart.collectionItems) ? parsedCart.collectionItems : [],
          totalItems: parsedCart.totalItems || 0,
          totalPrice: parsedCart.totalPrice || 0,
          discount: parsedCart.discount || 0,
          sessionId: parsedCart.sessionId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          lastUpdated: parsedCart.lastUpdated ? new Date(parsedCart.lastUpdated) : new Date(),
        };
      }
    } catch (error) {
      console.error('Error parsing guest cart from localStorage:', error);
    }

    // Return default empty cart
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

  // FIXED: Calculate guest cart totals with proper validation
  const calculateGuestCartTotals = (cart: GuestCart): GuestCart => {
    if (!cart) {
      return getGuestCart();
    }

    try {
      // Ensure arrays exist
      const items = cart.items || [];
      const collectionItems = cart.collectionItems || [];

      // Calculate individual items totals
      const itemsTotalItems = items.reduce((sum, item) => {
        return sum + (item?.quantity || 0);
      }, 0);
      
      const itemsTotalPrice = items.reduce((sum, item) => {
        if (!item) return sum;
        
        const basePrice = item.originalPrice || item.price || 0;
        let itemPrice = item.price || 0;
        
        // Apply discount if exists
        if (item.discount && item.discount > 0 && item.discount <= 100) {
          itemPrice = basePrice - (basePrice * (item.discount / 100));
        }
        
        return sum + (itemPrice * (item.quantity || 0));
      }, 0);
      
      const itemsDiscount = items.reduce((sum, item) => {
        if (!item || !item.discount || item.discount <= 0) return sum;
        
        const basePrice = item.originalPrice || item.price || 0;
        const discountAmount = basePrice * (item.discount / 100);
        return sum + (discountAmount * (item.quantity || 0));
      }, 0);

      // Calculate collection items totals
      const collectionsTotalItems = collectionItems.reduce((sum, item) => {
        return sum + (item?.quantity || 0);
      }, 0);
      
      const collectionsTotalPrice = collectionItems.reduce((sum, item) => {
        if (!item) return sum;
        return sum + ((item.totalPrice || 0) * (item.quantity || 0));
      }, 0);

      return {
        ...cart,
        totalItems: itemsTotalItems + collectionsTotalItems,
        totalPrice: itemsTotalPrice + collectionsTotalPrice,
        discount: itemsDiscount, // Only products have discounts, not collections
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error calculating guest cart totals:', error);
      return cart;
    }
  };

  // FIXED: Save guest cart with error handling
  const saveGuestCart = (cart: GuestCart): boolean => {
    try {
      if (!cart) {
        console.error('Cannot save null/undefined cart');
        return false;
      }
      
      localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cart));
      return true;
    } catch (error) {
      console.error('Error saving guest cart:', error);
      return false;
    }
  };

  // FIXED: Add to cart for unlogged users with better validation and event dispatch
  const addToCartUnlogged = (productData: AddToCartData) => {
    try {
      if (!productData || !productData.productId) {
        console.error('Invalid product data for adding to cart');
        toast({
          title: 'Error',
          description: 'Invalid product data',
          variant: 'destructive',
        });
        return;
      }

      let cart = getGuestCart();

      const existingItemIndex = cart.items.findIndex(
        (item: CartItem) => item && item.productId === productData.productId && item.size === productData.size
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity = (cart.items[existingItemIndex].quantity || 0) + (productData.quantity || 1);
      } else {
        // Add new item with proper validation
        const newItem: CartItem = {
          id: `${productData.productId}_${productData.size}_${Date.now()}`,
          productId: productData.productId,
          name: productData.name || '',
          brand: productData.brand || '',
          imageUrl: productData.imageUrl || '',
          size: productData.size || '',
          quantity: productData.quantity || 1,
          price: productData.price || 0,
          originalPrice: productData.originalPrice || productData.price || 0,
          discount: productData.discount || 0,
          type: productData.type || 'perfume',
        };
        cart.items.push(newItem);
      }

      // Recalculate totals
      cart = calculateGuestCartTotals(cart);
      
      // Save to localStorage
      const saved = saveGuestCart(cart);
      if (!saved) {
        throw new Error('Failed to save cart to localStorage');
      }
      
      console.log('Item added to guest cart:', cart);
      
      // FIXED: Dispatch custom event to notify cart component
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: cart }));
      
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

  // FIXED: Add collection to cart for unlogged users with proper validation
  const addCollectionToCartUnlogged = (collectionData: {
    collectionId: string;
    collectionName: string;
    collectionDescription?: string;
    collectionImage?: string;
    quantity: number;
    price: number; // Fixed collection price
  }) => {
    try {
      if (!collectionData || !collectionData.collectionId) {
        console.error('Invalid collection data for adding to cart');
        toast({
          title: 'Error',
          description: 'Invalid collection data',
          variant: 'destructive',
        });
        return;
      }

      // FIXED: Validate price before proceeding
      if (collectionData.price <= 0) {
        console.error('Invalid collection price:', collectionData.price);
        toast({
          title: 'Error',
          description: 'Invalid collection price',
          variant: 'destructive',
        });
        return;
      }

      console.log('Adding collection to guest cart with data:', collectionData);

      let cart = getGuestCart();
  
      const existingCollectionIndex = cart.collectionItems.findIndex(
        (item) => item && item.collectionId === collectionData.collectionId
      );
  
      if (existingCollectionIndex >= 0) {
        // Update existing collection quantity
        cart.collectionItems[existingCollectionIndex].quantity = 
          (cart.collectionItems[existingCollectionIndex].quantity || 0) + (collectionData.quantity || 1);
        console.log('Updated existing collection quantity:', cart.collectionItems[existingCollectionIndex]);
      } else {
        // Add new collection item to cart with proper validation
        const newCollection: GuestCollectionCartItem = {
          id: `collection_${collectionData.collectionId}_${Date.now()}`,
          collectionId: collectionData.collectionId,
          collectionName: collectionData.collectionName || '',
          collectionDescription: collectionData.collectionDescription,
          collectionImage: collectionData.collectionImage,
          quantity: collectionData.quantity || 1,
          totalPrice: collectionData.price || 0, // FIXED: Use the actual price
          originalTotalPrice: collectionData.price || 0, // No discounts for collections
          discount: 0, // Collections don't have discounts
        };
        
        console.log('Creating new collection item:', newCollection);
        cart.collectionItems.push(newCollection);
      }
  
      // Recalculate totals
      cart = calculateGuestCartTotals(cart);
      
      console.log('Cart after adding collection:', {
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        collectionItems: cart.collectionItems.length
      });
      
      // Save to localStorage
      const saved = saveGuestCart(cart);
      if (!saved) {
        throw new Error('Failed to save cart to localStorage');
      }
      
      console.log('Collection added to guest cart successfully');
      
      // FIXED: Dispatch custom event to notify cart component
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: cart }));
      
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

  // FIXED: Main add to cart function with better error handling
  const addToCart = (item: AddToCartData) => {
    try {
      if (!item) {
        console.error('No item data provided to addToCart');
        return;
      }

      if (isAuthenticated) {
        const cartRequest: AddToCartRequest = {
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
        };
        addToCartMutation.mutate(cartRequest);
      } else {
        addToCartUnlogged(item);
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    }
  };

  // FIXED: Main add collection to cart function with better error handling
  const addCollectionToCart = (collectionData: AddCollectionToCartRequest & { 
    collectionName?: string; 
    collectionDescription?: string; 
    collectionImage?: string; 
    price?: number; 
  }) => {
    try {
      if (!collectionData) {
        console.error('No collection data provided to addCollectionToCart');
        return;
      }

      if (isAuthenticated) {
        const collectionRequest: AddCollectionToCartRequest = {
          collectionId: collectionData.collectionId,
          quantity: collectionData.quantity,
          items: collectionData.items || [],
        };
        addCollectionToCartMutation.mutate(collectionRequest);
      } else {
        // For guest users, we need collection display data
        addCollectionToCartUnlogged({
          collectionId: collectionData.collectionId,
          collectionName: collectionData.collectionName || '',
          collectionDescription: collectionData.collectionDescription,
          collectionImage: collectionData.collectionImage,
          quantity: collectionData.quantity,
          price: collectionData.price || 0,
        });
      }
    } catch (error) {
      console.error('Error in addCollectionToCart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add collection to cart',
        variant: 'destructive',
      });
    }
  };

  return {
    addToCart,
    addCollectionToCart,
    isAuthenticated,
    // ADDED: Expose additional utilities
    invalidateCartCache,
    getGuestCart,
    calculateGuestCartTotals,
    saveGuestCart,
  };
};