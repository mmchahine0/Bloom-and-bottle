import { ENDPOINTS } from "../../api/endpoints";
import { HomepageData, ApiResponse } from "./Home.types";
import { apiClient } from "../../api/base";
import type { AddToCollectionCartRequest, CartResponse } from "../cart/Cart.types";

export const getHomepageData = async (): Promise<ApiResponse<HomepageData>> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Homepage.Get,
  });
  return response as ApiResponse<HomepageData>;
}

  
// Add collection to cart API call
export const addCollectionToCartAPI = async (
  collectionData: AddToCollectionCartRequest,
  accessToken: string
): Promise<CartResponse> => {
  const response = await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Cart.AddCollection,
    accessToken,
    data: collectionData,
  });
  return response as CartResponse;
};

// Remove collection from cart API call
export const removeCollectionFromCartAPI = async (
  collectionItemId: string,
  accessToken: string
): Promise<CartResponse> => {
  const response = await apiClient({
    method: "DELETE",
    endpoint: ENDPOINTS.Cart.RemoveCollection(collectionItemId), 
    accessToken,
  });
  return response as CartResponse;
};

// Update collection quantity in cart API call
export const updateCollectionQuantityAPI = async (
  collectionItemId: string,
  quantity: number,
  accessToken: string
): Promise<CartResponse> => {
  const response = await apiClient({
    method: "PUT",
    endpoint: ENDPOINTS.Cart.UpdateCollection(collectionItemId),
    accessToken,
    data: { quantity },
  });
  return response as CartResponse;
};