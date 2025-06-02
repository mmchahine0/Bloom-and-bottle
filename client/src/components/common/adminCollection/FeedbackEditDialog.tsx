"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload } from "lucide-react"
import type { FeedbackPicture } from "../../../features/admin/adminCollection/adminCollection.types"

interface FeedbackEditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  feedback: FeedbackPicture | null
  onSave: (
    feedbackData: FormData | Omit<FeedbackPicture, "id" | "createdAt" | "updatedAt">,
    isNew: boolean,
    existingFeedback?: FeedbackPicture | null,
  ) => void
  isLoading: boolean
}

export const FeedbackEditDialog: React.FC<FeedbackEditDialogProps> = ({
  isOpen,
  onOpenChange,
  feedback,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    featured: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const isEditing = !!feedback

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (feedback) {
        setFormData({
          featured: feedback.featured || false,
        })
        setImagePreview(feedback.imageUrl || "")
      } else {
        setFormData({
          featured: false,
        })
        setImagePreview("")
      }
      setImageFile(null)
    }
  }, [isOpen, feedback])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // For new feedback, image is required
    if (!isEditing && !imageFile) {
      return
    }

    const feedbackData = {
      featured: formData.featured,
    }

    if (imageFile) {
      const formDataWithFile = new FormData()
      formDataWithFile.append("featured", feedbackData.featured.toString())
      formDataWithFile.append("image", imageFile)

      onSave(formDataWithFile, !isEditing, feedback)
    } else {
      onSave({
        ...feedbackData,
        imageUrl: feedback?.imageUrl || "",
        approved: feedback?.approved || false
      }, !isEditing, feedback)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Feedback Picture" : "Upload New Feedback Picture"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the feedback picture details." : "Upload a new customer feedback screenshot."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="feedback-image">Feedback Screenshot {!isEditing && "*"}</Label>
              <div className="space-y-4">
                <Input
                  id="feedback-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                  required={!isEditing}
                />

                {imagePreview && (
                  <div className="relative w-full max-w-sm mx-auto">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Feedback preview"
                      className="w-full h-auto object-cover rounded-md border"
                    />
                  </div>
                )}

                {!imagePreview && !isEditing && (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">Upload a customer feedback screenshot</p>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="space-y-2">
              <Label htmlFor="feedback-featured">Display Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="feedback-featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked as boolean }))}
                />
                <Label htmlFor="feedback-featured" className="text-sm">
                  Mark as featured feedback
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">Featured feedback will be highlighted on the homepage</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || (!isEditing && !imageFile)}>
              {isLoading ? "Saving..." : isEditing ? "Update Feedback" : "Upload Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
