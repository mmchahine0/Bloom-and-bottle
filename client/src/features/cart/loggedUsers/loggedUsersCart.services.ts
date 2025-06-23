import { apiClient } from '@/api/base';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  CartAPIResponse,
  AddToCartRequest,
  UpdateCartRequest,
  AddToCartAPIResponse,
  UpdateCartAPIResponse,
  RemoveCartAPIResponse,
  ClearCartAPIResponse,
  PlaceOrderRequest,
  PlaceOrderAPIResponse,
  AddCollectionToCartRequest,
} from './loggedUsersCart.types';
import { transformCartAPIResponse } from './loggedUsersCart.types';
import type { Cart } from '../Cart.types';
import { CartItem } from '../unloggedUsers/unloggedUsersCart.types';

export const getCartFromAPI = async (accessToken: string): Promise<Cart> => {
  try {
    const response = await apiClient({
      method: 'GET',
      endpoint: ENDPOINTS.Cart.Base, // FIXED: Uses "/cart" not "/cart/order-data"
      accessToken,
    }) as CartAPIResponse;

    if (!response || !response.success) {
      throw new Error('Invalid cart response from server');
    }

    
    // Ensure collectionItems exists in response
    if (!response.data.collectionItems) {
      response.data.collectionItems = [];
    }
    
    const transformedCart = transformCartAPIResponse(response);

    return transformedCart;

  } catch (error) {
    console.error('Error fetching cart from API:', error);
    // Return an empty cart instead of throwing
    return {
      items: [],
      collectionItems: [],
      totalItems: 0,
      totalPrice: 0,
      discount: 0
    };
  }
};

export const addToCartAPI = async (
  item: AddToCartRequest,
  accessToken: string
): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'POST',
      endpoint: ENDPOINTS.Cart.AddItem, // Uses "/cart/add"
      data: item,
      accessToken,
    }) as AddToCartAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to add item to cart');
    }

  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

export const updateCartAPI = async (
  update: UpdateCartRequest,
  accessToken: string
): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'PUT',
      endpoint: ENDPOINTS.Cart.UpdateItem(update.itemId), // Uses "/cart/update/${itemId}"
      data: { quantity: update.quantity },
      accessToken,
    }) as UpdateCartAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to update cart item');
    }

  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCartAPI = async (
  itemId: string,
  accessToken: string
): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'DELETE',
      endpoint: ENDPOINTS.Cart.RemoveItem(itemId), // Uses "/cart/item/${itemId}"
      accessToken,
    }) as RemoveCartAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to remove item from cart');
    }

  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

export const clearCartAPI = async (accessToken: string): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'DELETE',
      endpoint: ENDPOINTS.Cart.Clear, // Uses "/cart/clear"
      accessToken,
    }) as ClearCartAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to clear cart');
    }

  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export const placeOrderAPI = async (
  orderData: PlaceOrderRequest,
  accessToken: string
): Promise<PlaceOrderAPIResponse> => {
  try {
    const response = await apiClient({
      method: 'POST',
      endpoint: ENDPOINTS.Orders.PlaceOrder, // Uses "/orders"
      data: orderData,
      accessToken,
    }) as PlaceOrderAPIResponse;

    return response;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

export const incrementCartAPI = async (
  itemId: string,
  accessToken: string
): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'PUT',
      endpoint: ENDPOINTS.Cart.IncrementItem(itemId), // Uses "/cart/increment/${itemId}"
      accessToken,
    }) as UpdateCartAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to increment item');
    }

  } catch (error) {
    console.error('Error incrementing cart item:', error);
    throw error;
  }
};

export const decrementCartAPI = async (
  itemId: string,
  accessToken: string
): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'PUT',
      endpoint: ENDPOINTS.Cart.DecrementItem(itemId), // Uses "/cart/decrement/${itemId}"
      accessToken,
    }) as UpdateCartAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to decrement item');
    }

  } catch (error) {
    console.error('Error decrementing cart item:', error);
    throw error;
  }
};

export const addCollectionToCartAPI = async (
  collectionData: AddCollectionToCartRequest, 
  accessToken: string
): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'POST',
      endpoint: ENDPOINTS.Cart.AddCollection, // Uses "/cart/collection/add"
      data: collectionData, 
      accessToken,
    }) as AddToCartAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to add collection to cart');
    }


  } catch (error) {
    console.error('Error adding collection to cart:', error);
    throw error;
  }
};

export const removeCollectionFromCartAPI = async (
  itemId: string,
  accessToken: string
): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'DELETE',
      endpoint: ENDPOINTS.Cart.RemoveCollection(itemId), // Uses "/cart/collection/${itemId}"
      accessToken,
    }) as RemoveCartAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to remove collection from cart');
    }

  } catch (error) {
    console.error('Error removing collection from cart:', error);
    throw error;
  }
};

export const updateCollectionQuantityAPI = async (
  itemId: string,
  quantity: number,
  accessToken: string
): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'PUT',
      endpoint: ENDPOINTS.Cart.UpdateCollection(itemId), // Uses "/cart/collection/update/${itemId}"
      data: { quantity },
      accessToken,
    }) as UpdateCartAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to update collection quantity');
    }

  } catch (error) {
    console.error('Error updating collection quantity:', error);
    throw error;
  }
};

export const incrementCollectionQuantityAPI = async (
  itemId: string,
  accessToken: string
): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'PUT',
      endpoint: ENDPOINTS.Cart.IncrementCollection(itemId), // Uses "/cart/collection/increment/${itemId}"
      accessToken,
    }) as UpdateCartAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to increment collection quantity');
    }

  } catch (error) {
    console.error('Error incrementing collection quantity:', error);
    throw error;
  }
};

export const decrementCollectionQuantityAPI = async (
  itemId: string,
  accessToken: string
): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'PUT',
      endpoint: ENDPOINTS.Cart.DecrementCollection(itemId), // Uses "/cart/collection/decrement/${itemId}"
      accessToken,
    }) as UpdateCartAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to decrement collection quantity');
    }

  } catch (error) {
    console.error('Error decrementing collection quantity:', error);
    throw error;
  }
};

// ADDED: Get cart order data (for order creation)

export const getCartOrderDataAPI = async (
  accessToken: string
): Promise<PlaceOrderAPIResponse['data']> => {
  try {
    const response = await apiClient({
      method: 'GET',
      endpoint: ENDPOINTS.Cart.GetCartData, // Uses "/cart/order-data"
      accessToken,
    }) as PlaceOrderAPIResponse;

    if (!response.success) {
      throw new Error(response.message || 'Failed to get cart order data');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting cart order data:', error);
    throw error;
  }
};

export const calculateItemPrice = (item: CartItem): number => {
  if (!item) return 0;
  
  const basePrice = item.originalPrice || item.price || 0;
  
  if (item.discount && item.discount > 0 && item.discount <= 100) {
    const discountAmount = basePrice * (item.discount / 100);
    return Math.max(0, basePrice - discountAmount);
  }
  
  return item.price || 0;
};