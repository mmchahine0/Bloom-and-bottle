import { apiClient } from "../../../api/base";
import {
  ProductsResponse,
  PaginationParams,
  Product,
} from "./adminProducts.types";
import { ENDPOINTS } from "../../../api/endpoints";

// Get all products (perfumes and samples) with pagination and filters
export const getAllProducts = async (
  accessToken: string,
  params: PaginationParams
): Promise<ProductsResponse> => {
  // Convert params to URL search params
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
  if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params.sortDirection)
    queryParams.append("sortDirection", params.sortDirection);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);

  const endpoint =
    params.type === "sample"
      ? ENDPOINTS.Products.Sample.GetAll
      : params.type === "perfume"
      ? ENDPOINTS.Products.Perfume.GetAll
      : `${ENDPOINTS.Products.GetAllAdmin}`;

  const response = await apiClient({
    method: "GET",
    endpoint: `${endpoint}?${queryParams.toString()}`,
    accessToken,
  });
  return response as ProductsResponse;
};

// Get product details
export const getProductDetails = async (
  productId: string,
  type: "perfume" | "sample",
  accessToken: string
): Promise<ProductsResponse> => {
  const endpoint =
    type === "sample"
      ? ENDPOINTS.Products.Sample.GetById(productId)
      : ENDPOINTS.Products.Perfume.GetById(productId);

  const response = await apiClient({
    method: "GET",
    endpoint,
    accessToken,
  });
  return response as ProductsResponse;
};

export const createProduct = async (
  productData: FormData | Omit<Product, "id" | "createdAt" | "updatedAt" | "createdBy">,
  accessToken: string,
): Promise<ProductsResponse> => {
  // Determine endpoint based on type
  let endpoint = ENDPOINTS.Products.Perfume.Create

  if (productData instanceof FormData) {
    const type = productData.get("type") as string
    endpoint = type === "sample" ? ENDPOINTS.Products.Sample.Create : ENDPOINTS.Products.Perfume.Create
  } else {
    endpoint = productData.type === "sample" ? ENDPOINTS.Products.Sample.Create : ENDPOINTS.Products.Perfume.Create
  }

  const response = await apiClient({
    method: "POST",
    endpoint,
    data: productData,
    accessToken,
  })
  return response as ProductsResponse
}

// Update product
export const updateProduct = async (
  productId: string,
  productData: FormData | Partial<Omit<Product, "id" | "createdAt" | "updatedAt" | "createdBy">>,
  accessToken: string
): Promise<ProductsResponse> => {
  const response = await apiClient({
    method: "PUT",
    endpoint: ENDPOINTS.Products.Perfume.Update(productId),
    accessToken,
    data: productData,
  });
  return response as ProductsResponse;
};

// Delete product
export const deleteProduct = async (
  productId: string,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "DELETE",
    endpoint: ENDPOINTS.Products.Perfume.Delete(productId),
    accessToken,
  });
};

// Toggle featured status
export const toggleFeaturedStatus = async (
  productId: string,
  featured: boolean,
  accessToken: string
): Promise<ProductsResponse> => {
  const response = await apiClient({
    method: "PUT",
    endpoint: ENDPOINTS.Products.Perfume.Update(productId),
    accessToken,
    data: { featured },
  });
  return response as ProductsResponse;
};

// Update stock
export const updateStock = async (
  productId: string,
  stock: boolean,
  accessToken: string
): Promise<ProductsResponse> => {
  const response = await apiClient({
    method: "PUT",
    endpoint: ENDPOINTS.Products.Perfume.Update(productId),
    accessToken,
    data: { stock },
  });
  return response as ProductsResponse;
};
