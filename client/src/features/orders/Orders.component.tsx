import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { getUserOrders } from "./Orders.services";
import { UserOrder, OrderItem, OrderCollectionItem } from "./Orders.types";
import { Helmet } from "react-helmet-async";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/loading spinner/LoadingSpinner.component";
import { format } from "date-fns";
import { 
  ChevronDown, 
  ChevronRight, 
  Package, 
  Calendar, 
  DollarSign,
  ChevronLeft,
  ChevronRightIcon
} from "lucide-react";

const Orders = () => {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );

  const { data: ordersResponse, isLoading, error, refetch } = useQuery({
    queryKey: ["userOrders", currentPage],
    queryFn: () => getUserOrders(accessToken, currentPage, ordersPerPage),
    enabled: !!accessToken,
    staleTime: 0, // Always stale
  });

  useEffect(() => {
    if (accessToken) {
      refetch();
    }
    // eslint-disable-next-line
  }, []); // Only on mount

  const orders = ordersResponse?.data || [];
  const pagination = ordersResponse?.pagination;

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "canceled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "pending":
        return "⏳";
      case "canceled":
        return "✕";
      default:
        return "?";
    }
  };

  // Render individual product item
  const ProductItem = ({ item }: { item: OrderItem }) => (
    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
      {item.product.imageUrl && (
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
          className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm lg:text-base truncate">{item.product.name}</p>
        <p className="text-xs lg:text-sm text-gray-600">{item.product.brand}</p>
        <p className="text-xs lg:text-sm text-gray-500">
          Size: {item.size} • Qty: {item.quantity} • ${item.price.toFixed(2)}
        </p>
      </div>
    </div>
  );

  // Render collection item
  const CollectionItem = ({ item }: { item: OrderCollectionItem }) => (
    <div className="p-3 bg-blue-50 rounded border border-blue-200">
      <div className="flex items-center gap-3 mb-2">
        {item.collectionId.image && (
          <img
            src={item.collectionId.image}
            alt={item.collectionName}
            className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded"
          />
        )}
        <div className="flex-1">
          <p className="font-medium text-sm lg:text-base text-blue-900">
            📦 {item.collectionName} (Collection)
          </p>
          <p className="text-xs lg:text-sm text-blue-700">
            Qty: {item.quantity} • Total: ${item.totalPrice.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Products in collection */}
      <div className="ml-4 space-y-1">
        <p className="text-xs font-medium text-gray-700">Includes:</p>
        {item.products.map((product, index) => (
          <div key={index} className="text-xs text-gray-600 ml-2">
            • {product.name} ({product.size}) x{product.quantity}
          </div>
        ))}
      </div>
    </div>
  );

  // Mobile card view for orders
  const OrderCard = ({ order }: { order: UserOrder }) => {
    const isExpanded = expandedOrders.has(order._id);
    const totalItems = order.items.length + order.collectionItems.length;
    
    return (
      <Card className="p-4 mb-4 hover:shadow-md transition-shadow">
        <div className="space-y-3">
          {/* Order Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-sm">
                  Order #{order._id.substring(0, 8)}...
                </h3>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {order.totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
            <span
              className={`px-3 py-1 text-xs rounded-full border flex items-center gap-1 ${getStatusBadgeClass(
                order.status
              )}`}
            >
              <span>{getStatusIcon(order.status)}</span>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {/* Order Summary */}
          <div className="text-sm text-gray-600">
            {totalItems} item{totalItems !== 1 ? 's' : ''} 
            {order.collectionItems.length > 0 && (
              <span className="text-blue-600 ml-2">
                (includes {order.collectionItems.length} collection{order.collectionItems.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleOrderExpansion(order._id)}
            className="w-full justify-center text-sm"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 mr-1" />
                View Details
              </>
            )}
          </Button>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="pt-3 border-t space-y-3">
              <h4 className="font-medium text-sm">Order Items:</h4>
              <div className="space-y-2">
                {/* Regular Products */}
                {order.items.map((item, index) => (
                  <ProductItem key={`item-${index}`} item={item} />
                ))}
                
                {/* Collection Items */}
                {order.collectionItems.map((item, index) => (
                  <CollectionItem key={`collection-${index}`} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Pagination Component
  const Pagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Page {pagination.currentPage} of {pagination.totalPages} 
          ({pagination.totalOrders} total orders)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!pagination.hasPrevPage}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Unable to load orders
          </h2>
          <p className="text-gray-600">
            There was an error loading your orders. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Orders | Your Store</title>
        <meta
          name="description"
          content="View your order history and track order status"
        />
      </Helmet>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track your orders and view your purchase history
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" label="Loading your orders..." />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No orders found
            </h2>
            <p className="text-gray-500 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Button asChild>
              <a href="/home">Browse Products</a>
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Order</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Items</TableHead>
                      <TableHead className="font-semibold text-right">Total</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: UserOrder) => {
                      const isExpanded = expandedOrders.has(order._id);
                      const totalItems = order.items.length + order.collectionItems.length;
                      
                      return (
                        <>
                          <TableRow
                            key={order._id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleOrderExpansion(order._id)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                                #{order._id.substring(0, 8)}...
                              </div>
                            </TableCell>
                            <TableCell>
                              {format(new Date(order.createdAt), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${getStatusBadgeClass(
                                  order.status
                                )}`}
                              >
                                <span>{getStatusIcon(order.status)}</span>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {totalItems} item{totalItems !== 1 ? 's' : ''}
                              {order.collectionItems.length > 0 && (
                                <div className="text-xs text-blue-600">
                                  +{order.collectionItems.length} collection{order.collectionItems.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${order.totalPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="outline" size="sm">
                                {isExpanded ? 'Hide' : 'View'} Details
                              </Button>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-gray-50">
                                <div className="py-4">
                                  <h4 className="font-semibold mb-3 text-gray-900">Order Items:</h4>
                                  <div className="grid gap-3">
                                    {/* Regular Products */}
                                    {order.items.map((item, index) => (
                                      <div key={`desktop-item-${index}`} className="p-3 bg-white rounded-lg border">
                                        <ProductItem item={item} />
                                      </div>
                                    ))}
                                    
                                    {/* Collection Items */}
                                    {order.collectionItems.map((item, index) => (
                                      <div key={`desktop-collection-${index}`} className="bg-white rounded-lg border">
                                        <CollectionItem item={item} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="space-y-4">
                {orders.map((order: UserOrder) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            </div>

            {/* Pagination */}
            <Pagination />
          </>
        )}
      </main>
    </>
  );
};

export default Orders;