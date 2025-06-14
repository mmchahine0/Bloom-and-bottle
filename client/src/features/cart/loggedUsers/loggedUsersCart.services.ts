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
} from './loggedUsersCart.types';
import { transformCartAPIResponse } from './loggedUsersCart.types';
import type { Cart } from '../Cart.types';

export const getCartFromAPI = async (accessToken: string): Promise<Cart> => {
  try {
    const response = await apiClient({
      method: 'GET',
      endpoint: ENDPOINTS.Cart.Base,
      accessToken,
    }) as CartAPIResponse;

    if (!response) {
      throw new Error('Invalid cart response from server');
    }

    return transformCartAPIResponse(response);

  } catch (error) {
    console.error('Error fetching cart from API:', error);
    // Return an empty cart instead of throwing
    return {
      items: [],
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
    const requestData = {
      ...item,
      type: item.type || 'perfume', // Default to perfume if type not specified
    };

    await apiClient({
      method: 'POST',
      endpoint: ENDPOINTS.Cart.AddItem,
      data: requestData,
      accessToken,
    }) as AddToCartAPIResponse;

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
    await apiClient({
      method: 'PUT',
      endpoint: ENDPOINTS.Cart.UpdateItem(update.itemId),
      data: { quantity: update.quantity },
      accessToken,
    }) as UpdateCartAPIResponse;

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
    await apiClient({
      method: 'DELETE',
      endpoint: ENDPOINTS.Cart.RemoveItem(itemId),
      accessToken,
    }) as RemoveCartAPIResponse;

  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

export const clearCartAPI = async (accessToken: string): Promise<void> => {
  try {
    await apiClient({
      method: 'DELETE',
      endpoint: ENDPOINTS.Cart.Clear,
      accessToken,
    }) as ClearCartAPIResponse;

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
      endpoint: ENDPOINTS.Orders.PlaceOrder,
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
    await apiClient({
      method: 'PUT',
      endpoint: ENDPOINTS.Cart.IncrementItem(itemId),
      accessToken,
    }) as UpdateCartAPIResponse;

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
    await apiClient({
      method: 'PUT',
      endpoint: ENDPOINTS.Cart.DecrementItem(itemId),
      accessToken,
    }) as UpdateCartAPIResponse;

  } catch (error) {
    console.error('Error decrementing cart item:', error);
    throw error;
  }
};





