
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { OrderWithExtras } from "../../../features/admin/adminOrders/adminOrders.types"
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
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

interface DetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderWithExtras | null;
  onStatusChange: (order: OrderWithExtras, newStatus: string) => void;
}

export function DetailDialog({
  isOpen,
  onOpenChange,
  order,
  onStatusChange,
}: DetailDialogProps) {
  if (!order) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Order Details | #{order.id.substring(0, 8)}...
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-medium text-lg mb-2">Customer Information</h3>
            <div className="space-y-1">
              <p>
                <span className="font-medium">Name: </span>
                {order.user.name || "N/A"}
              </p>
              <p>
                <span className="font-medium">Email: </span>
                {order.user.email}
              </p>
              <p>
                <span className="font-medium">User ID: </span>
                {order.user.id}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-2">Order Information</h3>
            <div className="space-y-1">
              <p>
                <span className="font-medium">Date: </span>
                {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
              </p>
              <p>
                <span className="font-medium">Total: </span>
                {order.totalPrice}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status: </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-sm ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <Select
                    value={order.status}
                    onValueChange={(value) => onStatusChange(order, value)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-lg mb-2">Order Items</h3>
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.product.name}
                    </TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.product.price}</TableCell>
                    <TableCell>
                      {item.product.price * item.quantity}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Total:
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.totalPrice}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium text-lg mb-2">Order Timeline</h3>
          <div className="pl-4 border-l-2 border-gray-200 space-y-2">
            <div className="relative">
              <div className="absolute -left-6 mt-1 w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <p className="text-sm">
                <span className="font-medium">
                  {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
                </span>
                <br />
                Order created
              </p>
            </div>
            {order.status !== "pending" && (
              <div className="relative">
                <div className="absolute -left-6 mt-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <p className="text-sm">
                  <span className="font-medium">Status updated</span>
                  <br />
                  Order marked as {order.status}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}