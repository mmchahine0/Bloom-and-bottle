import type React from "react"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { X, Loader, Filter, ChevronRight, ChevronLeft } from "lucide-react"
import { getMenPerfumes } from "./MenP.services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {Filters} from "./MenP.types"


const MenPerfumesPage: React.FC = () => {
  // State
  const [filters, setFilters] = useState<Filters>({
    sort: "createdAt",
    sortDirection: "desc",
  })
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({})

  // Fetch perfumes
  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["men-perfumes", page, filters, priceRange],
    queryFn: () =>
      getMenPerfumes({
        ...filters,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        page,
        limit,
      }),
    placeholderData: (previousData) => previousData,
  })

  // Effect to reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [filters, priceRange])

  // Handle filter changes
  const applyFilters = () => {
    const newFilters: Filters = {
      sort: filters.sort,
      sortDirection: filters.sortDirection,
    }

    if (filters.featured !== undefined) newFilters.featured = filters.featured
    if (filters.limitedEdition !== undefined) newFilters.limitedEdition = filters.limitedEdition
    if (filters.comingSoon !== undefined) newFilters.comingSoon = filters.comingSoon

    setFilters(newFilters)
    setShowFilters(false)
  }

  const clearFilters = () => {
    setPriceRange({})
    setFilters({
      sort: "createdAt",
      sortDirection: "desc",
    })
    setShowFilters(false)
  }

  const clearAllFilters = () => {
    setPriceRange({})
    setFilters({
      sort: "createdAt",
      sortDirection: "desc",
    })
    setShowFilters(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (priceRange.min !== undefined || priceRange.max !== undefined) count++
    if (filters.featured) count++
    if (filters.limitedEdition) count++
    if (filters.comingSoon) count++
    return count
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Men's Fragrances</h1>
            <p className="text-gray-600">Discover the perfect scent for every occasion</p>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} />
                <span>Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              {/* Active Filter Pills */}
              <div className="flex flex-wrap gap-2">

                {(priceRange.min !== undefined || priceRange.max !== undefined) && (
                  <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <span>
                      Price: ${priceRange.min || 0} - ${priceRange.max || "∞"}
                    </span>
                    <button
                      onClick={() => {
                        setPriceRange({})
                      }}
                      className="hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {filters.featured && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <span>Featured</span>
                    <button
                      onClick={() => {
                        setFilters({ ...filters, featured: undefined })
                      }}
                      className="hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {filters.limitedEdition && (
                  <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    <span>Limited Edition</span>
                    <button
                      onClick={() => {
                        setFilters({ ...filters, limitedEdition: undefined })
                      }}
                      className="hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {filters.comingSoon && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <span>Coming Soon</span>
                    <button
                      onClick={() => {
                        setFilters({ ...filters, comingSoon: undefined })
                      }}
                      className="hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-600 whitespace-nowrap">
                Sort by:
              </label>
              <Select
                value={`${filters.sort}_${filters.sortDirection}`}
                onValueChange={(value) => {
                  const [sortField, direction] = value.split("_")
                  setFilters({
                    ...filters,
                    sort: sortField,
                    sortDirection: direction as "asc" | "desc",
                  })
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt_desc">Newest First</SelectItem>
                  <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="name_asc">Name: A-Z</SelectItem>
                  <SelectItem value="name_desc">Name: Z-A</SelectItem>
                  <SelectItem value="featured_desc">Featured First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />

          {/* Filter Panel */}
          <div className="relative z-10 w-full max-w-md bg-white h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
            

              {/* Price Range Filter */}
              <div>
                <h3 className="text-lg font-medium mb-4">Price Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Price ($)</label>
                    <Input
                      type="number"
                      value={priceRange.min || ""}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="0"
                      min="0"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Price ($)</label>
                    <Input
                      type="number"
                      value={priceRange.max || ""}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Any"
                      min="0"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Product Flags */}
              <div>
                <h3 className="text-lg font-medium mb-4">Product Type</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={!!filters.featured}
                      onCheckedChange={(checked) =>
                        setFilters({
                          ...filters,
                          featured: checked === true ? true : undefined,
                        })
                      }
                    />
                    <span>Featured Products</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={!!filters.limitedEdition}
                      onCheckedChange={(checked) =>
                        setFilters({
                          ...filters,
                          limitedEdition: checked === true ? true : undefined,
                        })
                      }
                    />
                    <span>Limited Edition</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={!!filters.comingSoon}
                      onCheckedChange={(checked) =>
                        setFilters({
                          ...filters,
                          comingSoon: checked === true ? true : undefined,
                        })
                      }
                    />
                    <span>Coming Soon</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-4">
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                Clear Filters
              </Button>
              <Button onClick={applyFilters} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading perfumes...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-700 mb-4">
                {error instanceof Error ? error.message : "Something went wrong. Please try again."}
              </p>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <p className="text-lg text-gray-600 mb-4">No products found matching your criteria.</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{data?.data.length}</span> of{" "}
                <span className="font-medium">{data?.totalItems}</span> products
              </div>
              {data && data.totalPages > 1 && (
                <div className="text-sm text-gray-600">
                  Page {page} of {data.totalPages}
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data?.data.map((perfume) => (
                <Link
                  key={perfume._id}
                  to={`/perfume/${perfume._id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  <div className="relative overflow-hidden">
                    {perfume.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        {perfume.discount}% OFF
                      </div>
                    )}
                    {perfume.limitedEdition && (
                      <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        Limited
                      </div>
                    )}
                    {perfume.featured && (
                      <div className="absolute bottom-3 left-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        Featured
                      </div>
                    )}
                    {perfume.comingSoon && (
                      <div className="absolute bottom-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        Coming Soon
                      </div>
                    )}
                    <img
                      src={perfume.imageUrl || "/placeholder.svg"}
                      alt={perfume.name}
                      className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{perfume.brand}</p>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
                        {perfume.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">${perfume.price.toFixed(2)}</span>
                        {perfume.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            ${(perfume.price / (1 - perfume.discount / 100)).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        {perfume.stock > 0 ? (
                          <span className="text-xs text-green-600 font-medium">In Stock</span>
                        ) : (
                          <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                        )}
                      </div>
                    </div>

                    {perfume.description && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{perfume.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((old) => Math.max(old - 1, 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === data.totalPages || (p >= page - 2 && p <= page + 2))
                    .reduce((items, p, i, filtered) => {
                      if (i > 0 && filtered[i - 1] !== p - 1) {
                        items.push(
                          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                            ...
                          </span>,
                        )
                      }
                      items.push(
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                            p === page ? "bg-blue-500 text-white" : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>,
                      )
                      return items
                    }, [] as React.ReactNode[])}

                  <button
                    onClick={() => setPage((old) => Math.min(old + 1, data.totalPages))}
                    disabled={page === data.totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MenPerfumesPage
