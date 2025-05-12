import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Star,
  X,
  Loader,
  Filter,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Types
interface PerfumeSize {
  label: string;
  price: number;
}

interface PerfumeNotes {
  top: string[];
  middle: string[];
  base: string[];
}

interface Perfume {
  _id: string;
  name: string;
  type: "perfume" | "sample";
  sizes: PerfumeSize[];
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  notes: PerfumeNotes;
  rating: number;
  reviewsCount: number;
  stock: number;
  featured: boolean;
  limitedEdition: boolean;
  comingSoon: boolean;
  discount: number;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  data: Perfume[];
}

interface Filters {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  featured?: boolean;
  limitedEdition?: boolean;
  minRating?: number;
  sort?: string;
}

// Main Component
const MenPerfumesPage: React.FC = () => {
  // State
  const [filters, setFilters] = useState<Filters>({
    sort: "newest",
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [activeBrandFilter, setActiveBrandFilter] = useState<
    string | undefined
  >(undefined);
  const [activeRatingFilter, setActiveRatingFilter] = useState<
    number | undefined
  >(undefined);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>(
    {}
  );

  // Fetch perfumes
  const fetchPerfumes = async (): Promise<ApiResponse> => {
    // Build query parameters
    const params = new URLSearchParams();
    params.append("category", "men");
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (filters.brand) params.append("brand", filters.brand);
    if (filters.minPrice !== undefined)
      params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined)
      params.append("maxPrice", filters.maxPrice.toString());
    if (filters.available) params.append("available", "true");
    if (filters.featured) params.append("featured", "true");
    if (filters.limitedEdition) params.append("limitedEdition", "true");
    if (filters.minRating !== undefined)
      params.append("minRating", filters.minRating.toString());
    if (filters.sort) params.append("sort", filters.sort);

    // Simulate API fetch (replace with actual fetch in production)
    // const response = await fetch(`/api/perfumes?${params.toString()}`);
    // const data = await response.json();
    // return data;

    // For demo purposes, simulate a response:
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockBrands = [
          "Dior",
          "Tom Ford",
          "Chanel",
          "Versace",
          "Creed",
          "Paco Rabanne",
          "Lattafa",
          "Rasasi",
        ];

        const mockPerfumes: Perfume[] = Array.from(
          { length: 20 },
          (_, index) => ({
            _id: `perfume-${index}`,
            name: `Men's Fragrance ${index + 1}`,
            type: "perfume",
            sizes: [
              { label: "50ml", price: 80 + (index % 5) * 10 },
              { label: "100ml", price: 120 + (index % 5) * 10 },
            ],
            description:
              "A fragrance that captures the essence of masculinity.",
            price: 80 + (index % 5) * 20,
            imageUrl:
              "data:image/jpeg;base64,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",
            category: "men",
            brand: mockBrands[index % mockBrands.length],
            notes: {
              top: ["Citrus", "Bergamot"],
              middle: ["Lavender", "Cardamom"],
              base: ["Vanilla", "Cedar"],
            },
            rating: 3 + (index % 3),
            reviewsCount: 10 + index,
            stock: index % 3 === 0 ? 0 : 10 + index,
            featured: index % 4 === 0,
            limitedEdition: index % 7 === 0,
            comingSoon: false,
            discount: index % 5 === 0 ? 15 : 0,
            createdAt: new Date().toISOString(),
          })
        );

        // Filter based on filters
        let filteredPerfumes = [...mockPerfumes];

        if (filters.brand) {
          filteredPerfumes = filteredPerfumes.filter((p) =>
            p.brand.toLowerCase().includes(filters.brand!.toLowerCase())
          );
        }

        if (filters.minPrice !== undefined) {
          filteredPerfumes = filteredPerfumes.filter(
            (p) => p.price >= filters.minPrice!
          );
        }

        if (filters.maxPrice !== undefined) {
          filteredPerfumes = filteredPerfumes.filter(
            (p) => p.price <= filters.maxPrice!
          );
        }

        if (filters.available) {
          filteredPerfumes = filteredPerfumes.filter((p) => p.stock > 0);
        }

        if (filters.featured) {
          filteredPerfumes = filteredPerfumes.filter((p) => p.featured);
        }

        if (filters.limitedEdition) {
          filteredPerfumes = filteredPerfumes.filter((p) => p.limitedEdition);
        }

        if (filters.minRating !== undefined) {
          filteredPerfumes = filteredPerfumes.filter(
            (p) => p.rating >= filters.minRating!
          );
        }

        // Sort
        if (filters.sort) {
          switch (filters.sort) {
            case "price_asc":
              filteredPerfumes.sort((a, b) => a.price - b.price);
              break;
            case "price_desc":
              filteredPerfumes.sort((a, b) => b.price - a.price);
              break;
            case "name_asc":
              filteredPerfumes.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case "name_desc":
              filteredPerfumes.sort((a, b) => b.name.localeCompare(a.name));
              break;
            case "rating_desc":
              filteredPerfumes.sort((a, b) => b.rating - a.rating);
              break;
            case "newest":
              filteredPerfumes.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );
              break;
          }
        }

        // Pagination
        const start = (page - 1) * limit;
        const paginatedPerfumes = filteredPerfumes.slice(start, start + limit);

        resolve({
          success: true,
          page,
          totalPages: Math.ceil(filteredPerfumes.length / limit),
          totalItems: filteredPerfumes.length,
          data: paginatedPerfumes,
        });
      }, 500);
    });
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["perfumes", page, filters],
    queryFn: fetchPerfumes,
    placeholderData: (previousData) => previousData,
  });
  // Effect to reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Handle filter changes
  const applyFilters = () => {
    const newFilters: Filters = {};

    if (activeBrandFilter) newFilters.brand = activeBrandFilter;
    if (activeRatingFilter) newFilters.minRating = activeRatingFilter;
    if (priceRange.min !== undefined) newFilters.minPrice = priceRange.min;
    if (priceRange.max !== undefined) newFilters.maxPrice = priceRange.max;

    // Preserve the sort option
    newFilters.sort = filters.sort;

    setFilters(newFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setActiveBrandFilter(undefined);
    setActiveRatingFilter(undefined);
    setPriceRange({});
    setFilters({ sort: filters.sort });
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Title */}
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Men Fragrances</h1>
      </div>

      {/* Filters and Sorting */}
      <div className="container mx-auto px-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm hover:bg-gray-50"
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>

            {/* Active Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {activeBrandFilter && (
                <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span>Brand: {activeBrandFilter}</span>
                  <button
                    onClick={() => {
                      setActiveBrandFilter(undefined);
                      setFilters({ ...filters, brand: undefined });
                    }}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {(priceRange.min !== undefined ||
                priceRange.max !== undefined) && (
                <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span>
                    Price:
                    {priceRange.min !== undefined
                      ? ` $${priceRange.min}`
                      : " $0"}
                    {" - "}
                    {priceRange.max !== undefined
                      ? `$${priceRange.max}`
                      : " Any"}
                  </span>
                  <button
                    onClick={() => {
                      setPriceRange({});
                      setFilters({
                        ...filters,
                        minPrice: undefined,
                        maxPrice: undefined,
                      });
                    }}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-600">
              Sort by:
            </label>
            <select
              id="sort"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="name_desc">Name: Z-A</option>
              <option value="rating_desc">Highest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          ></div>

          {/* Filter Panel */}
          <div className="relative z-10 w-full max-w-md bg-white h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button onClick={() => setShowFilters(false)}>
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
                    <label className="block text-sm text-gray-600 mb-1">
                      Min Price
                    </label>
                    <input
                      type="number"
                      value={priceRange.min || ""}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          min: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Max Price
                    </label>
                    <input
                      type="number"
                      value={priceRange.max || ""}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          max: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="text-lg font-medium mb-4">Minimum Rating</h3>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        setActiveRatingFilter(
                          activeRatingFilter === rating ? undefined : rating
                        )
                      }
                      className={`flex items-center gap-1 px-3 py-2 text-sm border rounded-md transition-colors ${
                        activeRatingFilter === rating
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                      }`}
                    >
                      {rating}+
                      <Star
                        size={14}
                        className={
                          activeRatingFilter === rating
                            ? "fill-white text-white"
                            : "fill-yellow-400 text-yellow-400"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <h3 className="text-lg font-medium mb-4">Other Filters</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!filters.available}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          available: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-500"
                    />
                    <span>In Stock Only</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!filters.featured}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          featured: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-500"
                    />
                    <span>Featured Products</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!filters.limitedEdition}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          limitedEdition: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-500"
                    />
                    <span>Limited Edition</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-4">
              <button
                onClick={clearFilters}
                className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="container mx-auto px-4 mb-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size={40} className="animate-spin text-gray-400" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            <p>Something went wrong. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              No products found matching your criteria.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Product Count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {data?.data.length} of {data?.totalItems} products
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {data?.data.map((perfume) => (
                <div
                  key={perfume._id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300"
                >
                  <div className="relative">
                    {perfume.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {perfume.discount}% OFF
                      </div>
                    )}
                    {perfume.limitedEdition && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Limited
                      </div>
                    )}
                    <Link to={`/perfume/${perfume._id}`}>
                      <img
                        src={perfume.imageUrl}
                        alt={`Image of ${perfume.name}`}
                        className="w-full h-48 object-cover object-center"
                      />
                    </Link>
                  </div>

                  <div className="p-3">
                    <Link to={`/perfume/${perfume._id}`}>
                      <h3 className="text-sm md:text-base font-semibold text-gray-800 hover:text-blue-500 line-clamp-1">
                        {perfume.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-600 mb-1">
                      {perfume.brand}
                    </p>

                    <div className="flex items-baseline gap-2">
                      <span className="text-sm md:text-base font-bold text-gray-900">
                        ${perfume.price.toFixed(2)}
                      </span>
                      {perfume.discount > 0 && (
                        <span className="text-xs text-gray-500 line-through">
                          $
                          {(
                            perfume.price /
                            (1 - perfume.discount / 100)
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <button
                        className={`w-full py-1.5 px-3 rounded text-sm font-medium ${
                          perfume.stock > 0
                            ? "bg-black text-white hover:bg-gray-800"
                            : "bg-gray-200 text-gray-600 cursor-not-allowed"
                        }`}
                        disabled={perfume.stock === 0}
                      >
                        {perfume.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((old) => Math.max(old - 1, 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 rounded-md disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === data.totalPages ||
                        (p >= page - 1 && p <= page + 1)
                    )
                    .reduce((items, p, i, filtered) => {
                      if (i > 0 && filtered[i - 1] !== p - 1) {
                        items.push(
                          <span key={`ellipsis-${i}`} className="px-2">
                            ...
                          </span>
                        );
                      }
                      items.push(
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 flex items-center justify-center rounded-md ${
                            p === page
                              ? "bg-blue-500 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                      return items;
                    }, [] as React.ReactNode[])}

                  <button
                    onClick={() =>
                      setPage((old) => Math.min(old + 1, data.totalPages))
                    }
                    disabled={page === data.totalPages}
                    className="p-2 border border-gray-300 rounded-md disabled:opacity-50"
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
  );
};

export default MenPerfumesPage;
