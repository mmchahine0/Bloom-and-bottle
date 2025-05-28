import type { PerfumeResponse, PerfumeFilters, Perfume } from "./Perfumes.types"
import { apiClient } from "@/api/base"
import { ENDPOINTS } from "@/api/endpoints"

export const getAllPerfumes = async (filters?: PerfumeFilters): Promise<PerfumeResponse> => {
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
    ? `${ENDPOINTS.Products.Perfume.GetAll}?${params.toString()}`
    : ENDPOINTS.Products.Perfume.GetAll

  const response = await apiClient({
    method: "GET",
    endpoint,
  })

  return response as PerfumeResponse
}

// Get Single Perfume Service
export const getPerfumeById = async (id: string): Promise<{ success: boolean; data: Perfume }> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Products.Perfume.GetById(id),
  })

  return response as { success: boolean; data: Perfume }
}