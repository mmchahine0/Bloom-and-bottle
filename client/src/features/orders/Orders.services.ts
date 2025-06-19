import { apiClient } from "../../api/base";
import { UserOrder } from "./Orders.types";
import { ENDPOINTS } from "../../api/endpoints";
import {OrdersResponse} from "./Orders.types"

export const getUserOrders = async (
  accessToken: string,
  page: number = 1,
  limit: number = 10
): Promise<OrdersResponse> => {
  const response = await apiClient({
    method: "GET",
    endpoint: `${ENDPOINTS.Orders.UserOrders}?page=${page}&limit=${limit}`,
    accessToken,
  });

  return response as OrdersResponse;
};

export const getOrderById = async (
  orderId: string,
  accessToken: string
): Promise<UserOrder> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Orders.GetOrder(orderId),
    accessToken,
  });
  
  return (response as { data: UserOrder }).data;
};