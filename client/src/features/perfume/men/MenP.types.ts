export interface Perfume {
  _id: string
  name: string
  brand: string
  price: number
  discount: number
  description?: string
  imageUrl: string
  stock: number
  featured: boolean
  limitedEdition: boolean
  comingSoon: boolean
  category: "men" | "women" | "un"
  type: "perfume" | "sample"
  createdAt: string
  updatedAt: string
}

export interface PerfumeResponse {
  success: boolean
  data: Perfume[]
  totalItems: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PerfumeFilters {
  brand?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  limitedEdition?: boolean
  comingSoon?: boolean
  sort?: string
  sortDirection?: "asc" | "desc"
  page?: number
  limit?: number
}

export interface Filters {
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  limitedEdition?: boolean
  comingSoon?: boolean
  sort?: string
  sortDirection?: "asc" | "desc"
}