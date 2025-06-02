export interface Sample {
    _id: string
    name: string
    brand: string
    price: number
    discount: number
    description?: string
    imageUrl: string
    stock: boolean
    featured: boolean
    limitedEdition: boolean
    comingSoon: boolean
    category: "men" | "women" | "un"
    type: "sample"
    createdAt: string
    updatedAt: string
  }
  
  export interface SampleResponse {
    success: boolean
    data: Sample[]
    totalItems: number
    totalPages: number
    currentPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  
  export interface SampleFilters {
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