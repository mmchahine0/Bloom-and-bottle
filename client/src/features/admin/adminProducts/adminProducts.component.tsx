import type React from "react";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/persist/persist";
import {
  getAllProducts,
  updateProduct,
  deleteProduct,
  toggleFeaturedStatus,
  updateStock,
  createProduct,
} from "./adminProducts.services";
import type {
  ConfirmDialogState,
  StatusMessage,
  Product,
  ProductWithCreator,
  PaginationParams,
} from "./adminProducts.types";
import { Helmet } from "react-helmet-async";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/loading spinner/LoadingSpinner.component";
import { ConfirmActionDialog } from "@/components/common/alert dialog form/ConfirmActionDialog.component";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductDetailsDialog } from "../../../components/common/productEdit/ProductDetailsDialog";
import { ProductEditDialog } from "../../../components/common/productEdit/ProductEditDialog";

const ProductsDashboard = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [featuredFilter, setFeaturedFilter] = useState<boolean | undefined>(
    undefined
  );
  const [limitedEditionFilter, setLimitedEditionFilter] = useState<
    boolean | undefined
  >(undefined);
  const [comingSoonFilter, setComingSoonFilter] = useState<boolean | undefined>(
    undefined
  );
  const [priceMinFilter, setPriceMinFilter] = useState<number | undefined>(
    undefined
  );
  const [priceMaxFilter, setPriceMaxFilter] = useState<number | undefined>(
    undefined
  );
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    productId: "",
    action: null,
  });
  const [detailDialog, setDetailDialog] = useState<{
    isOpen: boolean;
    product: ProductWithCreator | null;
  }>({
    isOpen: false,
    product: null,
  });
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    product: ProductWithCreator | null;
  }>({
    isOpen: false,
    product: null,
  });

  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );

  // Prepare query parameters
  const queryParams: PaginationParams = {
    page,
    limit: pageSize,
    search: searchTerm,
    type: typeFilter || undefined,
    category: categoryFilter || undefined,
    brand: brandFilter || undefined,
    featured: featuredFilter,
    limitedEdition: limitedEditionFilter,
    comingSoon: comingSoonFilter,
    minPrice: priceMinFilter,
    maxPrice: priceMaxFilter,
    dateFrom: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    dateTo: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    sortDirection,
    sortBy,
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => getAllProducts(accessToken, queryParams),
    enabled: !!accessToken,
  });

  // Clear status message after announcement
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Alt + P for previous page
      if (e.altKey && e.key === "p" && page > 1) {
        e.preventDefault();
        setPage((p) => Math.max(1, p - 1));
      }
      // Alt + N for next page
      if (e.altKey && e.key === "n" && data?.pagination.nextPage) {
        e.preventDefault();
        setPage((p) => p + 1);
      }
      // Alt + F to focus search
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        document.getElementById("product-search")?.focus();
      }
      // Alt + A to add new product
      if (e.altKey && e.key === "a") {
        e.preventDefault();
        handleAddNew();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [page, data?.pagination?.nextPage, isLoading]);

  // Product update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      productData,
    }: {
      productId: string;
      productData: FormData | Partial<Omit<Product, "id" | "createdAt" | "updatedAt" | "createdBy">>;
    }) => updateProduct(productId, productData, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setStatusMessage({
        type: "success",
        message: "Product updated successfully",
      });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setEditDialog({ isOpen: false, product: null });
    },
    onError: () => {
      setStatusMessage({
        type: "error",
        message: "Failed to update product",
      });
      toast({
        title: "Failed",
        description: "Product update failed",
        variant: "destructive",
      });
    },
  });

  //Product creation
  const createMutation = useMutation({
    mutationFn: (productData: FormData | Omit<Product, "createdBy" | "id" | "createdAt" | "updatedAt">) => {
      return createProduct(productData, accessToken)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast({
        title: "Success",
        description: "Product created successfully",
      })
      setEditDialog({ isOpen: false, product: null }) 
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "Product creation failed",
        variant: "destructive",
      })
    },
  })

  // Toggle featured status mutation
  const featuredMutation = useMutation({
    mutationFn: ({
      productId,
      featured,
    }: {
      productId: string;
      featured: boolean;
    }) => toggleFeaturedStatus(productId, featured, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setStatusMessage({
        type: "success",
        message: "Featured status updated successfully",
      });
      toast({
        title: "Success",
        description: "Featured status updated successfully",
      });
    },
    onError: () => {
      setStatusMessage({
        type: "error",
        message: "Failed to update featured status",
      });
      toast({
        title: "Failed",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    },
  });

  // Stock update mutation
  const stockMutation = useMutation({
    mutationFn: ({
      productId,
      stock,
    }: {
      productId: string;
      stock: boolean;
    }) => updateStock(productId, stock, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setStatusMessage({
        type: "success",
        message: "Stock availability updated successfully",
      });
      toast({
        title: "Success",
        description: "Stock availability updated successfully",
      });
    },
    onError: () => {
      setStatusMessage({
        type: "error",
        message: "Failed to update stock availability",
      });
      toast({
        title: "Failed",
        description: "Failed to update stock availability",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({
      productId,
    }: {
      productId: string;
    }) => deleteProduct(productId, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setStatusMessage({
        type: "success",
        message: "Product deleted successfully",
      });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: () => {
      setStatusMessage({
        type: "error",
        message: "Failed to delete product",
      });
      toast({
        title: "Failed",
        description: "Product deletion failed",
        variant: "destructive",
      });
    },
  });

  const handleDeleteConfirm = (product: ProductWithCreator) => {
    setConfirmDialog({
      isOpen: true,
      productId: (product as any)._id,
      action: "delete",
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.productId && confirmDialog.action === "delete") {
      deleteMutation.mutate({
        productId: confirmDialog.productId,
      });
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const handleViewDetails = (product: ProductWithCreator) => {
    setDetailDialog({
      isOpen: true,
      product,
    });
  };

  const handleEditProduct = (product: ProductWithCreator) => {
    setEditDialog({
      isOpen: true,
      product,
    });
  };

  const handleAddNew = () => {
    setEditDialog({
      isOpen: true,
      product: null, // null product means "create new"
    });
  };

  const handleToggleFeatured = (product: ProductWithCreator) => {
    featuredMutation.mutate({
      productId: product.id,
      featured: !product.featured,
    });
  };

  const handleUpdateStock = (product: ProductWithCreator, newStock: boolean) => {
    stockMutation.mutate({
      productId: product.id,
      stock: newStock,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    refetch();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter(null);
    setCategoryFilter(null);
    setBrandFilter(null);
    setFeaturedFilter(undefined);
    setLimitedEditionFilter(undefined);
    setComingSoonFilter(undefined);
    setPriceMinFilter(undefined);
    setPriceMaxFilter(undefined);
    setDateRange({ from: undefined, to: undefined });
    setSortDirection("desc");
    setSortBy("createdAt");
    setPage(1);
    refetch();
  };


  const toggleSortField = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const totalPages = isLoading ? 1 : Math.ceil((data?.pagination?.totalItems || 0) / pageSize);

  // Get stock status badge class based on stock level
  const getStockBadgeClass = (stock: boolean | undefined) => {
    return stock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  // Get category badge class
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "men":
        return "bg-blue-100 text-blue-800";
      case "women":
        return "bg-pink-100 text-pink-800";
      case "un":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get type badge class
  const getTypeBadgeClass = (type: string) => {
    return type === "perfume"
      ? "bg-indigo-100 text-indigo-800"
      : "bg-amber-100 text-amber-800";
  };

  // Format price with currency
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Responsive card view for mobile
  const ProductCard = ({ product }: { product: ProductWithCreator }) => (
    <Card className="p-4 mb-4">
      <div className="space-y-3">
        <div className="flex gap-4">
          {/* Image section */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <img
              src={product.imageUrl}
              alt={`${product.name} thumbnail`}
              className="object-cover w-full h-full rounded-md"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.png'; // Add a placeholder image
              }}
            />
          </div>
          
          {/* Content section */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{product.name}</h3>
                  <Badge
                    variant="outline"
                    className={getTypeBadgeClass(product.type)}
                  >
                    {product.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{product.brand}</p>
              </div>
              <Badge className={getCategoryBadgeClass(product.category)}>
                {product.category}
              </Badge>
            </div>
  
            <div className="flex justify-between items-center text-sm mt-2">
              <div>
                <span className="text-gray-600">Price: </span>
                <span className="font-medium">{formatPrice(product.price)}</span>
                {product.discount && product.discount > 0 && (
                  <span className="ml-2 text-red-600">-{product.discount}%</span>
                )}
              </div>
              <div>
                <span className="text-gray-600">Stock: </span>
                <span
                  className={`font-medium ${
                    !product.stock ? "text-red-600" : ""
                  }`}
                >
                  {product.stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
          </div>
        </div>
  
        <div className="flex flex-wrap gap-2">
          {product.featured && <Badge variant="secondary">Featured</Badge>}
          {product.limitedEdition && (
            <Badge variant="secondary">Limited Edition</Badge>
          )}
          {product.comingSoon && <Badge variant="secondary">Coming Soon</Badge>}
        </div>
  
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(product)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditProduct(product)}
            className="flex-1"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteConfirm(product)}
            className="flex-shrink-0"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );

  // Add this function before the return statement in the ProductsDashboard component

  const handleSaveProduct = (
    productData: FormData | Omit<Product, "createdBy" | "id" | "createdAt" | "updatedAt">,
    isNew: boolean,
    existingProduct?: ProductWithCreator | null
  ) => {
    if (isNew) {
      createMutation.mutate(productData)
    } else if (existingProduct) {
      updateMutation.mutate({
        productId: (existingProduct as any)._id,
        productData: productData,
      })
    }
  }

  // Add this state for loading indicator
  const [saveLoading, setSaveLoading] = useState(false);

  // Update the useEffect for mutations to track loading state
  useEffect(() => {
    setSaveLoading(updateMutation.isPending || createMutation.isPending);
  }, [updateMutation.isPending, createMutation.isPending]);

  // Handle stock update
  const handleStockUpdate = (product: ProductWithCreator, newStock: boolean) => {
    handleUpdateStock(product, newStock);
  };

  // Remove the stock comparison since we're using boolean now
  const getStockStatus = (stock: boolean | undefined) => {
    return stock ? "In Stock" : "Out of Stock";
  };

  return (
    <>
      <Helmet>
        <title>Products Management | Admin Panel</title>
        <meta
          name="description"
          content="Manage perfumes and samples inventory"
        />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {statusMessage?.message}
      </div>

      <main
        className="w-full max-w-full overflow-hidden"
        aria-labelledby="dashboard-title"
      >
        <header className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1
              id="dashboard-title"
              className="text-2xl font-bold"
              tabIndex={-1}
            >
              Products Management
              <span className="sr-only">
                {`Showing page ${page} of ${totalPages}. Press Alt + P for previous page, Alt + N for next page, Alt + F to search products, Alt + A to add a new product.`}
              </span>
            </h1>

            <div className="flex items-center gap-2">
              <Button onClick={handleAddNew}>Add New Product</Button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <form
              onSubmit={handleSearch}
              className="flex flex-1 gap-2"
              role="search"
            >
              <Input
                id="product-search"
                type="text"
                placeholder="Search products, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                aria-label="Search products"
              />
              <Button type="submit">Search</Button>
            </form>

            <div className="flex items-center gap-2">
              <span id="rows-per-page-label" className="text-sm text-gray-600">
                Show:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
                aria-labelledby="rows-per-page-label"
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} rows
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Extended filters */}
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            <Select
              value={typeFilter || "all"}
              onValueChange={(value) =>
                setTypeFilter(value === "all" ? null : value)
              }
              aria-label="Filter by type"
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="perfume">Perfumes</SelectItem>
                <SelectItem value="sample">Samples</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) =>
                setCategoryFilter(value === "all" ? null : value)
              }
              aria-label="Filter by category"
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="un">Unisex</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Checkbox
                id="featured-filter"
                checked={featuredFilter === true}
                onCheckedChange={(checked) =>
                  setFeaturedFilter(
                    checked === "indeterminate" ? undefined : checked
                  )
                }
              />
              <label
                htmlFor="featured-filter"
                className="text-sm cursor-pointer"
              >
                Featured
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="limited-filter"
                checked={limitedEditionFilter === true}
                onCheckedChange={(checked) =>
                  setLimitedEditionFilter(
                    checked === "indeterminate" ? undefined : checked
                  )
                }
              />
              <label
                htmlFor="limited-filter"
                className="text-sm cursor-pointer"
              >
                Limited Edition
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="coming-soon-filter"
                checked={comingSoonFilter === true}
                onCheckedChange={(checked) =>
                  setComingSoonFilter(
                    checked === "indeterminate" ? undefined : checked
                  )
                }
              />
              <label
                htmlFor="coming-soon-filter"
                className="text-sm cursor-pointer"
              >
                Coming Soon
              </label>
              
            </div>

            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>

          {/* Price range filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="min-price" className="text-sm w-20">
                Min Price:
              </label>
              <Input
                id="min-price"
                type="number"
                min="0"
                placeholder="Min"
                value={priceMinFilter || ""}
                onChange={(e) =>
                  setPriceMinFilter(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="max-price" className="text-sm w-20">
                Max Price:
              </label>
              <Input
                id="max-price"
                type="number"
                min="0"
                placeholder="Max"
                value={priceMaxFilter || ""}
                onChange={(e) =>
                  setPriceMaxFilter(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-24"
              />
            </div>
          </div>
        </header>

        {/* Desktop Table View */}
        <div
          className="hidden lg:block overflow-x-auto"
          role="region"
          aria-label="Products management table"
        >
          <div className="min-w-full border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead className="w-[100px]" scope="col">
      Image
    </TableHead>
    <TableHead className="w-[200px]" scope="col">
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => toggleSortField("name")}
      >
        Name
        {sortBy === "name" && (
          <span className="text-xs">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </TableHead>
                  
                  <TableHead className="w-[100px]" scope="col">
                    Type
                  </TableHead>
                  <TableHead className="w-[150px]" scope="col">
                    Brand
                  </TableHead>
                  <TableHead className="w-[100px]" scope="col">
                    Category
                  </TableHead>
                  <TableHead className="w-[150px]" scope="col">
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => toggleSortField("price")}
                    >
                      Price
                      {sortBy === "price" && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]" scope="col">
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => toggleSortField("stock")}
                    >
                      Stock
                      {sortBy === "stock" && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[150px]" scope="col">
                    Flags
                  </TableHead>
                  <TableHead className="w-[250px]" scope="col">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center"
                      role="status"
                      aria-busy="true"
                    >
                      <div className="flex items-center justify-center">
                        <div
                          className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Loading products...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data?.data.length === 0 ? (
                  <TableRow key="no-products">
                    <TableCell colSpan={8} className="h-24 text-center">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((product: ProductWithCreator, index: number) => (
                    <TableRow
                      key={`product.id ${index}`}
                      aria-label={`Product: ${product.name}`}
                    >
                      <TableCell>
    <div className="relative w-16 h-16">
      <img
        src={product.imageUrl}
        alt={`${product.name} thumbnail`}
        className="object-cover w-full h-full rounded-md"
        onError={(e) => {
          e.currentTarget.src = '/placeholder-image.png'; // Add a placeholder image
        }}
      />
    </div>
  </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeClass(product.type)}>
                          {product.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>
                        <Badge
                          className={getCategoryBadgeClass(product.category)}
                        >
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatPrice(product.price)}
                        {typeof product.discount === 'number' && product.discount > 0 && (
                          <span className="ml-2 text-red-600">
                            -{product.discount}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStockBadgeClass(product.stock ?? false)}>
                          {getStockStatus(product.stock)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.featured && (
                            <Badge variant="outline" className="text-xs">
                              Feat
                            </Badge>
                          )}
                          {product.limitedEdition && (
                            <Badge variant="outline" className="text-xs">
                              Limited
                            </Badge>
                          )}
                          {product.comingSoon && (
                            <Badge variant="outline" className="text-xs">
                              Coming
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(product)}
                            className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="hover:bg-yellow-50 hover:text-yellow-600 transition-colors duration-200"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteConfirm(product)}
                            className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div
          className="lg:hidden"
          role="region"
          aria-label="Products management cards"
        >
          {isLoading ? (
            <LoadingSpinner size="lg" label="Loading products..." />
          ) : data?.data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No products found
            </div>
          ) : (
            <ul className="space-y-4" role="list">
              {data?.data.map((product: ProductWithCreator, index: number) => (
                <li key={`${product.id} ${index}`} role="listitem">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        <nav
  className="mt-4 flex flex-col items-center justify-between gap-4 py-4"
  role="navigation"
  aria-label="Pagination navigation"
>
  <div className="flex items-center gap-4">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      disabled={page === 1 || isLoading}
      aria-label={`Go to previous page${page === 1 ? " (disabled)" : ""}`}
      className="focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      Previous
    </Button>
    <span
      className="text-sm text-gray-600"
      aria-live="polite"
      role="status"
    >
      {isLoading ? (
        "Loading..."
      ) : (
        `Page ${page} of ${totalPages}`
      )}
    </span>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPage((p) => p + 1)}
      disabled={isLoading || !data?.pagination?.nextPage}
      aria-label={`Go to next page${
        isLoading || !data?.pagination?.nextPage ? " (disabled)" : ""
      }`}
      className="focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      Next
    </Button>
  </div>
  <div
    className="text-sm text-gray-500"
    aria-live="polite"
    role="status"
  >
    {isLoading ? (
      "Loading total count..."
    ) : (
      `Total products: ${data?.pagination?.totalItems || 0}`
    )}
  </div>
</nav>

        {/* Confirmation Dialog */}
        <ConfirmActionDialog
          isOpen={confirmDialog.isOpen}
          onOpenChange={(isOpen) =>
            setConfirmDialog((prev) => ({ ...prev, isOpen }))
          }
          onConfirm={handleConfirmAction}
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
          itemDetails={{
            name: `Product ${
              confirmDialog.productId
                ? confirmDialog.productId.substring(0, 8) + "..."
                : ""
            }`,
            action: "delete",
          }}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />

        {/* Product Details Dialog */}
        <ProductDetailsDialog
          isOpen={detailDialog.isOpen}
          onOpenChange={(isOpen) =>
            setDetailDialog((prev) => ({ ...prev, isOpen }))
          }
          product={detailDialog.product}
          onToggleFeatured={handleToggleFeatured}
          onUpdateStock={handleStockUpdate}
        />

        {/* Product Edit Dialog */}
        <ProductEditDialog
          isOpen={editDialog.isOpen}
          onOpenChange={(isOpen) =>
            setEditDialog((prev) => ({ ...prev, isOpen }))
          }
          product={editDialog.product}
          onSave={handleSaveProduct}
          isLoading={saveLoading}
        />
      </main>
    </>
  );
};

export default ProductsDashboard;
