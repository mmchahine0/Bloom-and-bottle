import { apiClient } from "@/api/base";
import { ENDPOINTS } from "@/api/endpoints";
import { ProductsResponse, PaginationParams } from "../admin/adminProducts/adminProducts.types";

export const searchProducts = async (
  params: PaginationParams
): Promise<ProductsResponse> => {
  const queryParams = new URLSearchParams();

  // Add required pagination params
  queryParams.append("page", params.page.toString());
  queryParams.append("limit", params.limit.toString());

  // Add optional filters if they exist
  if (params.search) queryParams.append("search", params.search);
  if (params.type) queryParams.append("type", params.type);
  if (params.category) queryParams.append("category", params.category);
  if (params.brand) queryParams.append("brand", params.brand);
  if (params.featured !== undefined)
    queryParams.append("featured", params.featured.toString());
  if (params.limitedEdition !== undefined)
    queryParams.append("limitedEdition", params.limitedEdition.toString());
  if (params.comingSoon !== undefined)
    queryParams.append("comingSoon", params.comingSoon.toString());
  if (params.minPrice !== undefined)
    queryParams.append("priceMin", params.minPrice.toString());
  if (params.maxPrice !== undefined)
    queryParams.append("priceMax", params.maxPrice.toString());
  if (params.sortDirection)
    queryParams.append("sortDirection", params.sortDirection);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);

  const response = await apiClient({
    method: "GET",
    endpoint: `${ENDPOINTS.Products.GetAllUser}?${queryParams.toString()}`,
  });
  return response as ProductsResponse;
}; 
