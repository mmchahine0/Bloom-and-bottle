"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { productFormSchema } from "../../../features/admin/adminProducts/adminProducts.validation";
import type { Product, ProductWithCreator } from "../../../features/admin/adminProducts/adminProducts.types";

interface ProductSize {
  label: string;
  price: number;
}

interface ProductEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithCreator | null;
  onSave: (productData: FormData | Omit<Product, "createdBy" | "id" | "createdAt" | "updatedAt">, isNew: boolean, existingProduct?: ProductWithCreator | null) => void;
  isLoading: boolean;
}

export function ProductEditDialog({
  isOpen,
  onOpenChange,
  product,
  onSave,
  isLoading,
}: ProductEditDialogProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [sizes, setSizes] = useState<ProductSize[]>([{ label: "", price: 0 }]);
  const [topNotes, setTopNotes] = useState<string[]>([]);
  const [middleNotes, setMiddleNotes] = useState<string[]>([]);
  const [baseNotes, setBaseNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState({ top: "", middle: "", base: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isNewProduct = !product;

  // Initialize form with react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      type: "perfume",
      description: "",
      price: 0,
      category: "un",
      brand: "",
      stock: 0,
      featured: false,
      limitedEdition: false,
      comingSoon: false,
      discount: 0,
      imageUrl: "",
    },
  });
  // Reset form when product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        form.reset({
          name: product.name || "",
          type: product.type || "perfume",
          description: product.description || "",
          price: product.price || 0,
          category: product.category || "un",
          brand: product.brand || "",
          stock: product.stock || 0,
          featured: product.featured || false,
          limitedEdition: product.limitedEdition || false,
          comingSoon: product.comingSoon || false,
          discount: product.discount || 0,
          imageUrl: product.imageUrl || "",
        });

        // Set sizes
        setSizes(
          product.sizes?.length ? product.sizes : [{ label: "", price: 0 }]
        );

        // Set notes
        setTopNotes(product.notes?.top || []);
        setMiddleNotes(product.notes?.middle || []);
        setBaseNotes(product.notes?.base || []);

        // Set image preview
        setImagePreview(product.imageUrl || null);
      } else {
        // Reset form for new product
        form.reset({
          name: "",
          type: "perfume",
          description: "",
          price: 0,
          category: "un",
          brand: "",
          stock: 0,
          featured: false,
          limitedEdition: false,
          comingSoon: false,
          discount: 0,
          imageUrl: "",
        });
        setSizes([{ label: "", price: 0 }]);
        setTopNotes([]);
        setMiddleNotes([]);
        setBaseNotes([]);
        setImagePreview(null);
      }

      // Reset new note inputs
      setNewNote({ top: "", middle: "", base: "" });

      // Set active tab to general
      setActiveTab("general");
    }
  }, [isOpen, product, form]);

  // Handle form submission
const onSubmit = (data: {
  name: string;
  type: "perfume" | "sample";
  description?: string;
  price: number;
  category: "un" | "men" | "women";
  brand: string;
  stock: number;
  featured: boolean;
  limitedEdition: boolean;
  comingSoon: boolean;
  discount: number;
  imageUrl?: string;
}) => {
  const formattedData = {
    ...data,
    sizes: sizes.filter((size) => size.label.trim() !== ""),
    notes: {
      top: topNotes,
      middle: middleNotes,
      base: baseNotes,
    },
  };

  // If imageFile exists, use FormData
  if (imageFile) {
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.entries(formattedData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Handle nested objects (like notes)
          formData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          // Handle arrays (like sizes)
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          // Handle booleans
          formData.append(key, value.toString());
        } else if (typeof value === 'number') {
          // Handle numbers
          formData.append(key, value.toString());
        } else {
          // Handle strings
          formData.append(key, value as string);
        }
      }
    });
    
    // Add image file
    formData.append("image", imageFile);

    onSave(formData, isNewProduct, product);
  } else {
    onSave(formattedData, isNewProduct, product);
  }
};
  // Handle adding a new size
  const addSize = () => {
    setSizes([...sizes, { label: "", price: 0 }]);
  };

  // Handle removing a size
  const removeSize = (index: number) => {
    const newSizes = [...sizes];
    newSizes.splice(index, 1);
    setSizes(newSizes);
  };

  // Handle updating a size
  const updateSize = (
    index: number,
    field: keyof ProductSize,
    value: string | number
  ) => {
    const newSizes = [...sizes];
    newSizes[index] = {
      ...newSizes[index],
      [field]: field === "price" ? Number(value) : value,
    };
    setSizes(newSizes);
  };

  // Handle adding notes
  const addNote = (type: "top" | "middle" | "base") => {
    if (newNote[type].trim() === "") return;

    if (type === "top") {
      setTopNotes([...topNotes, newNote.top]);
      setNewNote({ ...newNote, top: "" });
    } else if (type === "middle") {
      setMiddleNotes([...middleNotes, newNote.middle]);
      setNewNote({ ...newNote, middle: "" });
    } else {
      setBaseNotes([...baseNotes, newNote.base]);
      setNewNote({ ...newNote, base: "" });
    }
  };

  // Handle removing notes
  const removeNote = (type: "top" | "middle" | "base", index: number) => {
    if (type === "top") {
      const newNotes = [...topNotes];
      newNotes.splice(index, 1);
      setTopNotes(newNotes);
    } else if (type === "middle") {
      const newNotes = [...middleNotes];
      newNotes.splice(index, 1);
      setMiddleNotes(newNotes);
    } else {
      const newNotes = [...baseNotes];
      newNotes.splice(index, 1);
      setBaseNotes(newNotes);
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto min-h-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isNewProduct ? "Add New Product" : "Edit Product"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter brand name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="perfume">Perfume</SelectItem>
                            <SelectItem value="sample">Sample</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="men">Men</SelectItem>
                            <SelectItem value="women">Women</SelectItem>
                            <SelectItem value="un">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured</FormLabel>
                          <FormDescription>
                            Show in featured section
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="limitedEdition"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Limited Edition</FormLabel>
                          <FormDescription>
                            Mark as limited edition
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comingSoon"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Coming Soon</FormLabel>
                          <FormDescription>Mark as coming soon</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Pricing & Stock Tab */}
              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price ($)*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                Number.parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Size Variants</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSize}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Size
                    </Button>
                  </div>

                  {sizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Size (e.g., 50ml)"
                        value={size.label}
                        onChange={(e) =>
                          updateSize(index, "label", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={size.price}
                        onChange={(e) =>
                          updateSize(index, "price", e.target.value)
                        }
                        className="w-24"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSize(index)}
                        disabled={sizes.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">
                          Top Notes
                        </Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            placeholder="Add top note"
                            value={newNote.top}
                            onChange={(e) =>
                              setNewNote({ ...newNote, top: e.target.value })
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addNote("top")}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {topNotes.map((note, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-2 py-1"
                            >
                              {note}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 p-0"
                                onClick={() => removeNote("top", index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-base font-medium">
                          Middle Notes
                        </Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            placeholder="Add middle note"
                            value={newNote.middle}
                            onChange={(e) =>
                              setNewNote({ ...newNote, middle: e.target.value })
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addNote("middle")}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {middleNotes.map((note, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-2 py-1"
                            >
                              {note}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 p-0"
                                onClick={() => removeNote("middle", index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-base font-medium">
                          Base Notes
                        </Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            placeholder="Add base note"
                            value={newNote.base}
                            onChange={(e) =>
                              setNewNote({ ...newNote, base: e.target.value })
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addNote("base")}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {baseNotes.map((note, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-2 py-1"
                            >
                              {note}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 p-0"
                                onClick={() => removeNote("base", index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={() => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="cursor-pointer"
                            />
                          </FormControl>
                          <FormDescription>
                            Upload a product image (JPEG, PNG, WebP)
                          </FormDescription>
                          <FormMessage />
                        </div>
                        <div className="border rounded-md flex items-center justify-center p-2 h-[150px]">
                          {imagePreview ? (
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Product preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="text-gray-400 text-sm">
                              No image uploaded
                            </div>
                          )}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isNewProduct
                  ? "Create Product"
                  : "Update Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
