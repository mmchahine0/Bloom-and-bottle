import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Search } from "lucide-react"
import type { Collection, ProductWithCreator, CollectionWithPerfumes } from "../../../features/admin/adminCollection/adminCollection.types"

interface CollectionEditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  collection: CollectionWithPerfumes | null
  products: ProductWithCreator[]
  onSave: (
    collectionData: FormData | Omit<Collection, "id" | "createdAt" | "updatedAt">,
    isNew: boolean,
    existingCollection?: CollectionWithPerfumes | null,
  ) => void
  isLoading: boolean
}

export const CollectionEditDialog: React.FC<CollectionEditDialogProps> = ({
  isOpen,
  onOpenChange,
  collection,
  products,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    featured: false,
    price: 0,
  })
  const [selectedPerfumes, setSelectedPerfumes] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [productSearch, setProductSearch] = useState("")

  const isEditing = !!collection

  // Initialize form data when dialog opens
  useEffect(() => {
    if (!isOpen) return
    
    if (collection) {
      setFormData({
        name: collection.name || "",
        description: collection.description || "",
        featured: collection.featured || false,
        price: collection.price || 0,
      })
      setSelectedPerfumes(collection.perfumes?.map(p => p.id) || [])
      setImagePreview(collection.image || "")
    } else {
      // Reset form
      setFormData({ name: "", description: "", featured: false, price: 0 })
      setSelectedPerfumes([])
      setImagePreview("")
    }
    
    setImageFile(null)
    setProductSearch("")
  }, [isOpen, collection?.id])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePerfumeToggle = useCallback((perfumeId: string) => {
    setSelectedPerfumes((prev) =>
      prev.includes(perfumeId) 
        ? prev.filter((id) => id !== perfumeId) 
        : [...prev, perfumeId]
    )
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!formData.name.trim()) {
      return
    }
  
    const collectionData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      perfumes: selectedPerfumes, 
      featured: formData.featured,
      price: Number(formData.price),
    }
  
    if (imageFile) {
      const formDataWithFile = new FormData()
      formDataWithFile.append("name", collectionData.name)
      formDataWithFile.append("description", collectionData.description)
      formDataWithFile.append("featured", collectionData.featured.toString())
      formDataWithFile.append("perfumes", JSON.stringify(collectionData.perfumes)) // ✅ Changed from perfumeIds
      formDataWithFile.append("image", imageFile)
  
      onSave(formDataWithFile, !isEditing, collection)
    } else {
      const collectionDataWithProducts = {
        ...collectionData,
        perfumes: selectedProducts
      }
      onSave(collectionDataWithProducts, !isEditing, collection)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.brand.toLowerCase().includes(productSearch.toLowerCase()),
  )

  const selectedProducts = products.filter((product) => selectedPerfumes.includes(product.id || product._id || ""))

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] ">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Collection" : "Create New Collection"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the collection details and product selection."
              : "Create a new collection by adding products and setting details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
            <ScrollArea className="h-[calc(90vh-110px)] sm:h-auto">
          <div className="min-h-[120vh] pr-4">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collection-name">Collection Name *</Label>
                  <Input
                    id="collection-name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter collection name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collection-price">Collection Price *</Label>
                  <Input
                    id="collection-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter collection price"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collection-featured">Featured Collection</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="collection-featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked as boolean }))}
                    />
                    <Label htmlFor="collection-featured" className="text-sm">
                      Mark as featured collection
                    </Label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="collection-description">Description</Label>
                <Textarea
                  id="collection-description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter collection description"
                  rows={3}
                  className="max-h-[5vh]"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="collection-image">Collection Banner Image</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id="collection-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {imagePreview && (
                    <div className="relative w-20 h-20">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Collection preview"
                        className="w-full h-full object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Select Products for Collection</Label>
                  <Badge variant="outline">{selectedPerfumes.length} selected</Badge>
                </div>

                {/* Selected Products */}
                {selectedProducts.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Selected Products:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProducts.map((product) => (
                        <Badge key={product.id || product._id} variant="secondary" className="flex items-center gap-1">
                          {product.name}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handlePerfumeToggle(product.id || product._id || "")}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Product List */}
                <ScrollArea className="h-48 border rounded-md p-2">
                  <div className="space-y-2">
                    {filteredProducts.map((product) => {
                      const productId = product.id || product._id || ""
                      const isSelected = selectedPerfumes.includes(productId)

                      return (
                        <div
                          key={productId}
                          className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                            isSelected ? "bg-primary/10" : "hover:bg-muted"
                          }`}
                        >
<Checkbox 
  checked={isSelected} 
  onCheckedChange={() => handlePerfumeToggle(productId)} 
/>                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{product.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {product.type}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {product.brand} • ${product.price}
                            </div>
                          </div>
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                        </div>
                      )
                    })}
                    {filteredProducts.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">No products found</div>
                    )}
                  </div>
                  
                </ScrollArea>
                <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? "Saving..." : isEditing ? "Update Collection" : "Create Collection"}
            </Button>
            </div>
              </div>
            </div>
          </div>
          </ScrollArea>
        </form>
      </DialogContent>
    </Dialog>
  )
}