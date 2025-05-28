import type { SampleResponse, SampleFilters, Sample } from "./Samples.types"
import { apiClient } from "@/api/base"
import { ENDPOINTS } from "@/api/endpoints"

export const getAllSamples = async (filters?: SampleFilters): Promise<SampleResponse> => {
  const params = new URLSearchParams()

  if (filters) {
    // Pagination
    if (filters.page) params.append("page", filters.page.toString())
    if (filters.limit) params.append("limit", filters.limit.toString())

    // Filters
    if (filters.brand) params.append("brand", filters.brand)
    if (filters.minPrice !== undefined) params.append("priceMin", filters.minPrice.toString())
    if (filters.maxPrice !== undefined) params.append("priceMax", filters.maxPrice.toString())
    if (filters.featured !== undefined) params.append("featured", filters.featured.toString())
    if (filters.limitedEdition !== undefined) params.append("limitedEdition", filters.limitedEdition.toString())
    if (filters.comingSoon !== undefined) params.append("comingSoon", filters.comingSoon.toString())

    // Sorting
    if (filters.sort) params.append("sortBy", filters.sort)
    if (filters.sortDirection) params.append("sortDirection", filters.sortDirection)
  }

  const endpoint = params.toString()
    ? `${ENDPOINTS.Products.Sample.GetAll}?${params.toString()}`
    : ENDPOINTS.Products.Sample.GetAll

  const response = await apiClient({
    method: "GET",
    endpoint,
  })

  return response as SampleResponse
}

// Get Single Sample Service
export const getSampleById = async (id: string): Promise<{ success: boolean; data: Sample }> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Products.Sample.GetById(id),
  })

  return response as { success: boolean; data: Sample }
}