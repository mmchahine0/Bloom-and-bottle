import { apiClient } from "@/api/base";
import { ENDPOINTS } from "@/api/endpoints";
import type {
  CollectionsResponse,
  ProductsResponse,
  FeedbackPicturesResponse,
  Collection,
  FeedbackPicture,
  CollectionParams,
  FeedbackParams,
  PaginationParams,

} from "./adminCollection.types";

// Collections Services
export const getAllCollections = async (
  accessToken: string,
  params: CollectionParams
): Promise<CollectionsResponse> => {
  const queryParams = new URLSearchParams();

  // Add required pagination params
  queryParams.append("page", params.page.toString());
  queryParams.append("limit", params.limit.toString());

  // Add optional filters if they exist
  if (params.search) queryParams.append("search", params.search);
  if (params.featured !== undefined)
    queryParams.append("featured", params.featured.toString());
  if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params.sortDirection)
    queryParams.append("sortDirection", params.sortDirection);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);

  const response = await apiClient({
    method: "GET",
    endpoint: `${ENDPOINTS.Admin.Collections.GetAll}?${queryParams.toString()}`,
    accessToken,
  });
  return response as CollectionsResponse;
};

export const createCollection = async (
  collectionData: FormData | Omit<Collection, "id" | "createdAt" | "updatedAt">,
  accessToken: string
): Promise<Collection> => {
  const response = await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Admin.Collections.Create,
    data: collectionData,
    accessToken,
  });
  return response as Collection;
};

export const updateCollection = async (
  collectionId: string,
  collectionData: FormData | Partial<Omit<Collection, "id" | "createdAt" | "updatedAt">>,
  accessToken: string
): Promise<Collection> => {
  const response = await apiClient({
    method: "PUT",
    endpoint: ENDPOINTS.Admin.Collections.Update(collectionId),
    data: collectionData,
    accessToken,
  });
  return response as Collection;
};

export const deleteCollection = async (
  collectionId: string,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "DELETE",
    endpoint: ENDPOINTS.Admin.Collections.Delete(collectionId),
    accessToken,
  });
};


export const getCollectionById = async (
  collectionId: string,
  accessToken: string
): Promise<Collection> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Admin.Collections.GetById(collectionId),
    accessToken,
  });
  return response as Collection;
};

// Products Services (for collection building)
export const getAllProductsForSelection = async (
  accessToken: string,
  params: PaginationParams
): Promise<ProductsResponse> => {
  const queryParams = new URLSearchParams();

  // Add required pagination params
  queryParams.append("page", params.page.toString());
  queryParams.append("limit", params.limit.toString());

  // Add optional filters if they exist
  if (params.search) queryParams.append("search", params.search);
  if (params.sortDirection)
    queryParams.append("sortDirection", params.sortDirection);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);

  const response = await apiClient({
    method: "GET",
    endpoint: `${ENDPOINTS.Products.GetAllAdmin}?${queryParams.toString()}`,
    accessToken,
  });
  return response as ProductsResponse;
};

// Feedback Pictures Services
export const getAllFeedbackPictures = async (
  accessToken: string,
  params: FeedbackParams
): Promise<FeedbackPicturesResponse> => {
  const queryParams = new URLSearchParams();

  // Add required pagination params
  queryParams.append("page", params.page.toString());
  queryParams.append("limit", params.limit.toString());

  // Add optional filters if they exist
  if (params.search) queryParams.append("search", params.search);
  if (params.approved !== undefined)
    queryParams.append("approved", params.approved.toString());
  if (params.featured !== undefined)
    queryParams.append("featured", params.featured.toString());
  if (params.rating !== undefined)
    queryParams.append("rating", params.rating.toString());
  if (params.productName) queryParams.append("productName", params.productName);
  if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params.sortDirection)
    queryParams.append("sortDirection", params.sortDirection);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);

  const response = await apiClient({
    method: "GET",
    endpoint: `${ENDPOINTS.Admin.Feedbacks.GetAll}?${queryParams.toString()}`,
    accessToken,
  });
  return response as FeedbackPicturesResponse;
};

export const uploadFeedbackPicture = async (
  feedbackData: FormData | Omit<FeedbackPicture, "id" | "createdAt" | "updatedAt">,
  accessToken: string
): Promise<FeedbackPicture> => {
  const response = await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Admin.Feedbacks.Create,
    data: feedbackData,
    accessToken,
  });
  return response as FeedbackPicture;
};

export const updateFeedbackPicture = async (
  feedbackId: string,
  feedbackData: FormData | Partial<Omit<FeedbackPicture, "id" | "createdAt" | "updatedAt">>,
  accessToken: string
): Promise<FeedbackPicture> => {
  const response = await apiClient({
    method: "PUT",
    endpoint: ENDPOINTS.Admin.Feedbacks.Update(feedbackId),
    data: feedbackData,
    accessToken,
  });
  return response as FeedbackPicture;
};

export const deleteFeedbackPicture = async (
  feedbackId: string,
  accessToken: string
): Promise<void> => {
  await apiClient({
    method: "DELETE",
    endpoint: ENDPOINTS.Admin.Feedbacks.Delete(feedbackId),
    accessToken,
  });
};

export const getFeedbackById = async (
  feedbackId: string,
  accessToken: string
): Promise<FeedbackPicture> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Admin.Feedbacks.GetById(feedbackId),
    accessToken,
  });
  return response as FeedbackPicture;
};

// Utility function for image upload
export const uploadImage = async (
  imageFile: File,
  accessToken: string
): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await apiClient({
    method: "POST",
    endpoint: ENDPOINTS.Admin.Upload.Image,
    data: formData,
    accessToken,
  });
  return response as { url: string };
};