import { apiClient } from "../../../api/base";
import { ProductsResponse, PaginationParams, Product } from "./adminProfucts.types";
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
  if (params.featured !== undefined) queryParams.append("featured", params.featured.toString());
  if (params.limitedEdition !== undefined) queryParams.append("limitedEdition", params.limitedEdition.toString());
  if (params.comingSoon !== undefined) queryParams.append("comingSoon", params.comingSoon.toString());
  if (params.priceMin !== undefined) queryParams.append("priceMin", params.priceMin.toString());
  if (params.priceMax !== undefined) queryParams.append("priceMax", params.priceMax.toString());
  if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params.sortDirection) queryParams.append("sortDirection", params.sortDirection);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);

  const endpoint = params.type === "sample" 
    ? ENDPOINTS.Products.Sample.GetAll
    : params.type === "perfume"
    ? ENDPOINTS.Products.Perfume.GetAll
    : `${ENDPOINTS.Products.Perfume.Base}/all`; // Custom endpoint for both types

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
  const endpoint = type === "sample" 
    ? ENDPOINTS.Products.Sample.GetById(productId)
    : ENDPOINTS.Products.Perfume.GetById(productId);

  const response = await apiClient({
    method: "GET",
    endpoint,
    accessToken,
  });
  return response as ProductsResponse;
};

// Create new product
export const createProduct = async (
  productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "createdBy">,
  accessToken: string
): Promise<ProductsResponse> => {
  const endpoint = productData.type === "sample" 
    ? ENDPOINTS.Products.Sample.Create
    : ENDPOINTS.Products.Perfume.Create;

  const response = await apiClient({
    method: "POST",
    endpoint,
    accessToken,
    data: productData,
  });
  return response as ProductsResponse;
};

// Update product
export const updateProduct = async (
  productId: string,
  type: "perfume" | "sample",
  productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt" | "createdBy">>,
  accessToken: string
): Promise<ProductsResponse> => {
  const endpoint = type === "sample" 
    ? ENDPOINTS.Products.Sample.Update(productId)
    : ENDPOINTS.Products.Perfume.Update(productId);

  const response = await apiClient({
    method: "PUT",
    endpoint,
    accessToken,
    data: productData,
  });
  return response as ProductsResponse;
};

// Delete product
export const deleteProduct = async (
  productId: string,
  type: "perfume" | "sample",
  accessToken: string
): Promise<void> => {
  const endpoint = type === "sample" 
    ? ENDPOINTS.Products.Sample.Delete(productId)
    : ENDPOINTS.Products.Perfume.Delete(productId);

  await apiClient({
    method: "DELETE",
    endpoint,
    accessToken,
  });
};

// Toggle featured status
export const toggleFeaturedStatus = async (
  productId: string,
  type: "perfume" | "sample",
  featured: boolean,
  accessToken: string
): Promise<ProductsResponse> => {
  const endpoint = type === "sample" 
    ? ENDPOINTS.Products.Sample.Update(productId)
    : ENDPOINTS.Products.Perfume.Update(productId);

  const response = await apiClient({
    method: "PUT",
    endpoint,
    accessToken,
    data: { featured },
  });
  return response as ProductsResponse;
};

// Update stock
export const updateStock = async (
  productId: string,
  type: "perfume" | "sample",
  stock: number,
  accessToken: string
): Promise<ProductsResponse> => {
  const endpoint = type === "sample" 
    ? ENDPOINTS.Products.Sample.Update(productId)
    : ENDPOINTS.Products.Perfume.Update(productId);

  const response = await apiClient({
    method: "PUT",
    endpoint,
    accessToken,
    data: { stock },
  });
  return response as ProductsResponse;
};