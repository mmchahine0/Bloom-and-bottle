import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "./adminOrders.services";
import {
  ConfirmDialogState,
  StatusMessage,
  OrderWithExtras,
} from "./adminOrders.types";
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
import { DetailDialog } from "../../../components/common/detailDialog/detailDialog";
import { Input } from "@/components/ui/input";
import { DatePickerDemo } from "../../../components/common/calendarDate/calendarDate";
import { format } from "date-fns";

const OrdersDashboard = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    orderId: "",
    action: null,
  });
  const [detailDialog, setDetailDialog] = useState<{
    isOpen: boolean;
    order: OrderWithExtras | null;
  }>({
    isOpen: false,
    order: null,
  });

  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );

  // Prepare query parameters
  const queryParams = {
    page,
    limit: pageSize,
    search: searchTerm,
    status: statusFilter || undefined,
    dateFrom: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    dateTo: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    sortDirection,
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["orders", queryParams],
    queryFn: () => getAllOrders(accessToken, queryParams),
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
        document.getElementById("order-search")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setStatusMessage({
        type: "success",
        message: "Order status updated successfully",
      });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: () => {
      setStatusMessage({
        type: "error",
        message: "Failed to update order status",
      });
      toast({
        title: "Failed",
        description: "Order status failed to update",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => deleteOrder(orderId, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setStatusMessage({
        type: "success",
        message: "Order deleted successfully",
      });
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
    },
    onError: () => {
      setStatusMessage({
        type: "error",
        message: "Failed to delete order",
      });
      toast({
        title: "Failed",
        description: "Order deletion failed",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (order: OrderWithExtras, newStatus: string) => {
    statusMutation.mutate({
      orderId: order.id,
      status: newStatus,
    });
  };

  const handleDeleteConfirm = (order: OrderWithExtras) => {
    setConfirmDialog({
      isOpen: true,
      orderId: order.id,
      action: "delete",
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.orderId && confirmDialog.action === "delete") {
      deleteMutation.mutate(confirmDialog.orderId);
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const handleViewDetails = (order: OrderWithExtras) => {
    setDetailDialog({
      isOpen: true,
      order,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    refetch();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setDateRange({ from: undefined, to: undefined });
    setSortDirection("desc");
    setPage(1);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const totalPages = Math.ceil((data?.pagination.totalItems || 0) / pageSize);

  // Get status badge class based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Responsive card view for mobile
  const OrderCard = ({ order }: { order: OrderWithExtras }) => (
    <Card className="p-4 mb-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">
              Order #{order.id.substring(0, 8)}...
            </h3>
            <p className="text-sm text-gray-500">
              by {order.user.name || order.user.email}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeClass(
              order.status
            )}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {format(new Date(order.createdAt), "MMM dd, yyyy")}
          </span>
          <span className="font-medium">{order.totalPrice}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(order)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteConfirm(order)}
            className="flex-shrink-0"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Orders Management | Admin Panel</title>
        <meta
          name="description"
          content="Manage customer orders and track order status"
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
              Orders Management
              <span className="sr-only">
                {`Showing page ${page} of ${totalPages}. Press Alt + P for previous page, Alt + N for next page, Alt + F to search orders.`}
              </span>
            </h1>

            <div
              className="flex items-center gap-2"
              role="toolbar"
              aria-label="Table controls"
            >
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

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <form
              onSubmit={handleSearch}
              className="flex flex-1 gap-2"
              role="search"
            >
              <Input
                id="order-search"
                type="text"
                placeholder="Search orders or customer names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                aria-label="Search orders"
              />
              <Button type="submit">Search</Button>
            </form>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all" ? null : value)
                }
                aria-label="Filter by status"
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>

              <DatePickerDemo />

              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="whitespace-nowrap"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </header>

        {/* Desktop Table View */}
        <div
          className="hidden lg:block overflow-x-auto"
          role="region"
          aria-label="Orders management table"
        >
          <div className="min-w-full border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]" scope="col">
                    Order ID
                  </TableHead>
                  <TableHead className="w-[200px]" scope="col">
                    Customer
                  </TableHead>
                  <TableHead
                    className="w-[150px] cursor-pointer"
                    scope="col"
                    onClick={toggleSortDirection}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]" scope="col">
                    Total
                  </TableHead>
                  <TableHead className="w-[150px]" scope="col">
                    Status
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
                      colSpan={6}
                      className="h-24 text-center"
                      role="status"
                      aria-busy="true"
                    >
                      <div className="flex items-center justify-center">
                        <div
                          className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Loading orders...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((order: OrderWithExtras) => (
                    <TableRow
                      key={order.id}
                      aria-label={`Order ID: ${order.id}`}
                    >
                      <TableCell className="font-medium">
                        #{order.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {order.user.name || order.user.email}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{order.totalPrice}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-sm ${getStatusBadgeClass(
                            order.status
                          )}`}
                          role="status"
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              handleStatusUpdate(order, value)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                              <SelectItem value="canceled">Canceled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(order)}
                          >
                            View
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteConfirm(order)}
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
          aria-label="Orders management cards"
        >
          {isLoading ? (
            <LoadingSpinner size="lg" label="Loading orders..." />
          ) : data?.data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders found</div>
          ) : (
            <ul className="space-y-4" role="list">
              {data?.data.map((order: OrderWithExtras) => (
                <li key={order.id} role="listitem">
                  <OrderCard order={order} />
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label={`Go to previous page${
                page === 1 ? " (disabled)" : ""
              }`}
              className="focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Previous
            </Button>
            <span
              className="text-sm text-gray-600"
              aria-live="polite"
              role="status"
            >
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data?.pagination.nextPage}
              aria-label={`Go to next page${
                !data?.pagination.nextPage ? " (disabled)" : ""
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
            Total orders: {data?.pagination.totalItems || 0}
          </div>
        </nav>

        {/* Confirmation Dialog */}
        <ConfirmActionDialog
          isOpen={confirmDialog.isOpen}
          onOpenChange={(isOpen) =>
            setConfirmDialog((prev) => ({ ...prev, isOpen }))
          }
          onConfirm={handleConfirmAction}
          title="Delete Order"
          description="Are you sure you want to delete this order? This action cannot be undone."
          itemDetails={{
            name: `Order #${
              confirmDialog.orderId
                ? confirmDialog.orderId.substring(0, 8) + "..."
                : ""
            }`,
            action: "delete",
          }}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />

        {/* Order Details Dialog */}
        <DetailDialog
          isOpen={detailDialog.isOpen}
          onOpenChange={(isOpen: boolean) =>
            setDetailDialog((prev) => ({ ...prev, isOpen }))
          }
          order={detailDialog.order}
          onStatusChange={handleStatusUpdate}
        />
      </main>
    </>
  );
};

export default OrdersDashboard;
