import { apiClient } from "../../../api/base";
import { OrdersResponse, PaginationParams } from "./adminOrders.types";
import { ENDPOINTS } from "../../../api/endpoints";

export const getAllOrders = async (
  accessToken: string,
  params: PaginationParams
): Promise<OrdersResponse> => {
  // Convert params to URL search params
  const queryParams = new URLSearchParams();

  // Add required pagination params
  queryParams.append("page", params.page.toString());
  queryParams.append("limit", params.limit.toString());

  // Add optional filters if they exist
  if (params.search) queryParams.append("search", params.search);
  if (params.status) queryParams.append("status", params.status);
  if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params.sortDirection)
    queryParams.append("sortDirection", params.sortDirection);

  const response = await apiClient({
    method: "GET",
    endpoint: `${ENDPOINTS.Orders.AdminAll}?${queryParams.toString()}`,
    accessToken,
  });
  return response as OrdersResponse;
};

export const getOrderDetails = async (
  orderId: string,
  accessToken: string
): Promise<OrdersResponse> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Orders.OrderDetails(orderId),
    accessToken,
  });
  return response as OrdersResponse;
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "PUT",
    endpoint: ENDPOINTS.Orders.UpdateStatus(orderId),
    accessToken,
    data: { status },
  });
};

export const deleteOrder = async (
  orderId: string,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "DELETE",
    endpoint: ENDPOINTS.Orders.DeleteOrder(orderId),
    accessToken,
  });
};
