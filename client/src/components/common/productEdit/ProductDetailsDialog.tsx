import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductWithCreator } from "../../../features/admin/adminProducts/adminProducts.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface ProductDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithCreator | null;
  onToggleFeatured: (product: ProductWithCreator) => void;
  onUpdateStock: (product: ProductWithCreator, newStock: boolean) => void;
}

export const ProductDetailsDialog = ({
  isOpen,
  onOpenChange,
  product,
  onToggleFeatured,
  onUpdateStock,
}: ProductDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState("details");

  if (!product) return null;

  // Format price with currency
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Calculate discounted price
  const discountedPrice = product.discount
    ? product.price * (1 - (product.discount || 0) / 100)
    : product.price;

  // Get category badge class
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "men":
        return "bg-blue-100 text-blue-800";
      case "women":
        return "bg-white text-[#2c2c2c]";
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

  // Get stock status badge class based on stock level
  const getStockBadgeClass = (stock: boolean) => {
    return stock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  // Format date relative to now
  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return `Unknown date + ${e}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.name}
            <Badge
              variant="outline"
              className={getTypeBadgeClass(product.type)}
            >
              {product.type}
            </Badge>
          </DialogTitle>
          <DialogDescription>Product ID: {product.id}</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="meta">Meta</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-72 mt-2">
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Brand:</span>
                  <span>{product.brand}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Category:</span>
                  <Badge className={getCategoryBadgeClass(product.category)}>
                    {product.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Price:</span>
                  <div className="flex items-center gap-2">
                    <span>{formatPrice(product.price)}</span>
                    {product.discount && product.discount > 0 && (
                      <>
                        <span className="text-red-600">
                          -{product.discount}%
                        </span>
                        <span className="text-green-600">
                          = {formatPrice(discountedPrice)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-sm font-medium">Description:</span>
                  <p className="mt-1 text-sm text-gray-600">
                    {product.description || "No description available."}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-sm font-medium">Status Flags:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge
                      variant={product.featured ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => onToggleFeatured(product)}
                    >
                      Featured
                    </Badge>
                    <Badge
                      variant={product.limitedEdition ? "default" : "outline"}
                    >
                      Limited Edition
                    </Badge>
                    <Badge variant={product.comingSoon ? "default" : "outline"}>
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Availability:</span>
                  <Badge className={getStockBadgeClass(product.stock || false)}>
                    {product.stock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Update Availability:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        onUpdateStock(product, !product.stock);
                      }}
                      variant={product.stock ? "destructive" : "default"}
                    >
                      {product.stock ? "Mark as Out of Stock" : "Mark as In Stock"}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="meta" className="space-y-4">
              <div className="space-y-2">
                {product.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Updated:</span>
                    <span>{formatRelativeDate(product.updatedAt.toString())}</span>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
