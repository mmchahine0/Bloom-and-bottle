import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/persist/persist';
import type { CartContextType, CartItem, AddToCartData, CartOperationResult } from './Cart.types';
import { getCartFromAPI, addToCartAPI, updateCartAPI, removeFromCartAPI, clearCartAPI } from './loggedUsers/loggedUsersCart.services';
import { useToast } from '@/hooks/use-toast';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  const userId = useSelector((state: RootState) => state.auth?.id);
  const isUserLoggedIn = !!(accessToken && userId);

  // Fetch cart data
  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart', userId],
    queryFn: () => getCartFromAPI(accessToken!),
    enabled: isUserLoggedIn,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (item: AddToCartData) => addToCartAPI({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      type: item.type,
      collectionId: item.collectionId,
      collectionProducts: item.collectionProducts,
    }, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast({
        title: 'Success',
        description: 'Item added to cart successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartAPI({ itemId, quantity }, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast({
        title: 'Success',
        description: 'Cart updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update cart. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeFromCartAPI(itemId, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast({
        title: 'Success',
        description: 'Item removed from cart successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove item. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: () => clearCartAPI(accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast({
        title: 'Success',
        description: 'Cart cleared successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to clear cart. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Cart operations
  const addToCart = async (item: AddToCartData): Promise<CartOperationResult> => {
    try {
      await addToCartMutation.mutateAsync(item);
      return { success: true, message: 'Item added to cart successfully' };
    } catch {
      return { success: false, message: 'Failed to add item to cart', error: 'Failed to add item to cart' };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<CartOperationResult> => {
    try {
      await updateQuantityMutation.mutateAsync({ itemId, quantity });
      return { success: true, message: 'Cart updated successfully' };
    } catch {
      return { success: false, message: 'Failed to update cart', error: 'Failed to update cart' };
    }
  };

  const removeItem = async (itemId: string): Promise<CartOperationResult> => {
    try {
      await removeItemMutation.mutateAsync(itemId);
      return { success: true, message: 'Item removed from cart successfully' };
    } catch {
      return { success: false, message: 'Failed to remove item', error: 'Failed to remove item' };
    }
  };

  const clearCart = async (): Promise<CartOperationResult> => {
    try {
      await clearCartMutation.mutateAsync();
      return { success: true, message: 'Cart cleared successfully' };
    } catch {
      return { success: false, message: 'Failed to clear cart', error: 'Failed to clear cart' };
    }
  };

  // Cart utilities
  const getItemById = (itemId: string) => {
    return cart?.items.find(item => item.id === itemId);
  };

  const getItemsByProductId = (productId: string) => {
    return cart?.items.filter(item => item.productId === productId) || [];
  };

  const calculateItemTotal = (item: CartItem) => {
    return item.price * item.quantity;
  };

  // Checkout
  const checkout = async (): Promise<CartOperationResult> => {
    // Implement checkout logic here
    return { success: false, message: 'Checkout not implemented yet', error: 'Checkout not implemented yet' };
  };

  const value: CartContextType = {
    cart: cart || null,
    isLoading,
    error: error ? 'Failed to load cart' : null,
    isUserLoggedIn,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getItemById,
    getItemsByProductId,
    calculateItemTotal,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 