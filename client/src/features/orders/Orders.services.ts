import { apiClient } from "../../api/base";
import { UserOrder } from "./Orders.types";
import { ENDPOINTS } from "../../api/endpoints";

export const getUserOrders = async (
  accessToken: string
): Promise<UserOrder[]> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Orders.UserOrders,
    accessToken,
  });
  
  return response as UserOrder[];
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
  
  return response as UserOrder;
};