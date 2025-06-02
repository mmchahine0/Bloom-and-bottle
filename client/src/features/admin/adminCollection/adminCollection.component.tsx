import type React from "react";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/persist/persist";
import {
  getAllCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getAllProductsForSelection,
  getAllFeedbackPictures,
  uploadFeedbackPicture,
  updateFeedbackPicture,
  deleteFeedbackPicture,
} from "./adminCollection.services";
import type {
  Collection,
  FeedbackPicture,
  CollectionParams,
  FeedbackParams,
  CollectionWithPerfumes,
} from "./adminCollection.types";
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
import { LoadingSpinner } from "@/components/common/loading spinner/LoadingSpinner.component";
import { ConfirmActionDialog } from "@/components/common/alert dialog form/ConfirmActionDialog.component";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CollectionEditDialog } from "@/components/common/adminCollection/CollectionEditDialog";
import { FeedbackEditDialog } from "@/components/common/adminCollection/FeedbackEditDialog";

interface ConfirmDialogState {
  isOpen: boolean;
  itemId: string;
  action: "delete" | null;
  type: "collection" | "feedback";
}

interface StatusMessage {
  type: "success" | "error";
  message: string;
}

interface CollectionEditDialog {
  isOpen: boolean;
  collection: CollectionWithPerfumes | null;
}

interface FeedbackEditDialog {
  isOpen: boolean;
  feedback: FeedbackPicture | null;
}

const CollectionsDashboard = () => {
  const { toast } = useToast();
  
  // Collections state
  const [collectionsPage, setCollectionsPage] = useState(1);
  const [collectionsPageSize, setCollectionsPageSize] = useState(5);
  const [collectionsSearchTerm, setCollectionsSearchTerm] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<boolean | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<string>("createdAt");

  // Feedback state
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackPageSize, setFeedbackPageSize] = useState(5);
  
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    itemId: "",
    action: null,
    type: "collection",
  });
  
  const [collectionEditDialog, setCollectionEditDialog] = useState<CollectionEditDialog>({
    isOpen: false,
    collection: null,
  });
  
  const [feedbackEditDialog, setFeedbackEditDialog] = useState<FeedbackEditDialog>({
    isOpen: false,
    feedback: null,
  });

  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );

  // Collections query parameters
  const collectionsQueryParams: CollectionParams = {
    page: collectionsPage,
    limit: collectionsPageSize,
    search: collectionsSearchTerm,
    featured: featuredFilter,
    dateFrom: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    dateTo: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    sortDirection,
    sortBy,
  };

  // Feedback query parameters
  const feedbackQueryParams: FeedbackParams = {
    page: feedbackPage,
    limit: feedbackPageSize,
  };

  // Queries
  const { data: collectionsData, isLoading: collectionsLoading, refetch: refetchCollections } = useQuery({
    queryKey: ["collections", collectionsQueryParams],
    queryFn: () => getAllCollections(accessToken, collectionsQueryParams),
    enabled: !!accessToken,
  });

  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ["feedback", feedbackQueryParams],
    queryFn: () => getAllFeedbackPictures(accessToken, feedbackQueryParams),
    enabled: !!accessToken,
  });

  const { data: productsData } = useQuery({
    queryKey: ["products-selection"],
    queryFn: () => getAllProductsForSelection(accessToken, { page: 1, limit: 1000 }),
    enabled: !!accessToken && collectionEditDialog.isOpen,
  });

  // Clear status message after announcement
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Collection Mutations
  const createCollectionMutation = useMutation({
    mutationFn: (collectionData: FormData | Omit<Collection, "id" | "createdAt" | "updatedAt">) =>
      createCollection(collectionData, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({
        title: "Success",
        description: "Collection created successfully",
      });
      setCollectionEditDialog({ isOpen: false, collection: null });
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "Collection creation failed",
        variant: "destructive",
      });
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: ({
      collectionId,
      collectionData,
    }: {
      collectionId: string;
      collectionData: FormData | Partial<Omit<Collection, "id" | "createdAt" | "updatedAt">>;
    }) => updateCollection(collectionId, collectionData, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({
        title: "Success",
        description: "Collection updated successfully",
      });
      setCollectionEditDialog({ isOpen: false, collection: null });
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "Collection update failed",
        variant: "destructive",
      });
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: (collectionId: string) => deleteCollection(collectionId, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "Collection deletion failed",
        variant: "destructive",
      });
    },
  });

  // Feedback Mutations
  const uploadFeedbackMutation = useMutation({
    mutationFn: (feedbackData: FormData | Omit<FeedbackPicture, "id" | "createdAt" | "updatedAt">) =>
      uploadFeedbackPicture(feedbackData, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast({
        title: "Success",
        description: "Feedback picture uploaded successfully",
      });
      setFeedbackEditDialog({ isOpen: false, feedback: null });
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "Feedback picture upload failed",
        variant: "destructive",
      });
    },
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: ({
      feedbackId,
      feedbackData,
    }: {
      feedbackId: string;
      feedbackData: FormData | Partial<Omit<FeedbackPicture, "id" | "createdAt" | "updatedAt">>;
    }) => updateFeedbackPicture(feedbackId, feedbackData, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast({
        title: "Success",
        description: "Feedback picture updated successfully",
      });
      setFeedbackEditDialog({ isOpen: false, feedback: null });
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "Feedback picture update failed",
        variant: "destructive",
      });
    },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: (feedbackId: string) => deleteFeedbackPicture(feedbackId, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast({
        title: "Success",
        description: "Feedback picture deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "Feedback picture deletion failed",
        variant: "destructive",
      });
    },
  });

  // Event Handlers
  const handleDeleteConfirm = (itemId: string, type: "collection" | "feedback") => {
    setConfirmDialog({
      isOpen: true,
      itemId: itemId || "",
      action: "delete",
      type,
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.itemId && confirmDialog.action === "delete") {
      if (confirmDialog.type === "collection") {
        deleteCollectionMutation.mutate(confirmDialog.itemId);
      } else {
        deleteFeedbackMutation.mutate(confirmDialog.itemId);
      }
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const handleEditCollection = (collection: CollectionWithPerfumes | null) => {
    setCollectionEditDialog({
      isOpen: true,
      collection,
    });
  };

  const handleEditFeedback = (feedback: FeedbackPicture | null) => {
    setFeedbackEditDialog({
      isOpen: true,
      feedback,
    });
  };

  const handleCollectionsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCollectionsPage(1);
    refetchCollections();
  };

  const handleClearCollectionFilters = () => {
    setCollectionsSearchTerm("");
    setFeaturedFilter(undefined);
    setDateRange({ from: undefined, to: undefined });
    setSortDirection("desc");
    setSortBy("createdAt");
    setCollectionsPage(1);
    refetchCollections();
  };

  const toggleSortField = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const collectionsTotalPages = collectionsLoading ? 1 : Math.ceil((collectionsData?.pagination?.totalItems || 0) / collectionsPageSize);
  const feedbackTotalPages = feedbackLoading ? 1 : Math.ceil((feedbackData?.pagination?.totalItems || 0) / feedbackPageSize);

  return (
    <>
      <Helmet>
        <title>Collections & Feedback Management | Admin Panel</title>
        <meta name="description" content="Manage collections and feedback pictures" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {statusMessage?.message}
      </div>

      <main className="w-full max-w-full overflow-hidden" aria-labelledby="dashboard-title">
        {/* Collections Section */}
        <section className="mb-12">
          <header className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 id="dashboard-title" className="text-2xl font-bold" tabIndex={-1}>
                Collections Management
              </h1>
              <Button onClick={() => handleEditCollection(null)}>
                Add New Collection
              </Button>
            </div>

            {/* Collections Search and filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleCollectionsSearch} className="flex flex-1 gap-2" role="search">
                <Input
                  type="text"
                  placeholder="Search collections..."
                  value={collectionsSearchTerm}
                  onChange={(e) => setCollectionsSearchTerm(e.target.value)}
                  className="flex-1"
                  aria-label="Search collections"
                />
                <Button type="submit">Search</Button>
              </form>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <Select
                  value={collectionsPageSize.toString()}
                  onValueChange={(value) => {
                    setCollectionsPageSize(Number(value));
                    setCollectionsPage(1);
                  }}
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
              <div className="flex items-center gap-2">
                <Checkbox
                  id="collections-featured-filter"
                  checked={featuredFilter === true}
                  onCheckedChange={(checked) =>
                    setFeaturedFilter(checked === "indeterminate" ? undefined : checked)
                  }
                />
                <label htmlFor="collections-featured-filter" className="text-sm cursor-pointer">
                  Featured
                </label>
              </div>

              <Button variant="outline" onClick={handleClearCollectionFilters} className="whitespace-nowrap">
                Clear Filters
              </Button>
            </div>
          </header>

          {/* Collections Table */}
          <div className="overflow-x-auto" role="region" aria-label="Collections table">
            <div className="min-w-full border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]" scope="col">Image</TableHead>
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
                    <TableHead className="w-[300px]" scope="col">Description</TableHead>
                    <TableHead className="w-[100px]" scope="col">Products</TableHead>
                    <TableHead className="w-[100px]" scope="col">Featured</TableHead>
                    <TableHead className="w-[150px]" scope="col">
                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => toggleSortField("createdAt")}
                      >
                        Created
                        {sortBy === "createdAt" && (
                          <span className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="w-[200px]" scope="col">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center" role="status" aria-busy="true">
                        <div className="flex items-center justify-center">
                          <LoadingSpinner size="md" />
                          <span className="sr-only">Loading collections...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : collectionsData?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No collections found
                      </TableCell>
                    </TableRow>
                  ) : (
                    collectionsData?.data.map((collection: CollectionWithPerfumes, index: number) => (
                      <TableRow key={`${collection.id}-${index}`}>
                        <TableCell>
                          <div className="relative w-16 h-16">
                            <img
                              src={collection.image || '/placeholder-image.png'}
                              alt={`${collection.name} thumbnail`}
                              className="object-cover w-full h-full rounded-md"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.png';
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{collection.name}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={collection.description}>
                            {collection.description || "No description"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {collection.perfumes?.length || 0} items
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={collection.featured ? "default" : "secondary"}>
                            {collection.featured ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {collection.createdAt ? format(new Date(collection.createdAt), "MMM dd, yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCollection(collection)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteConfirm(collection._id || collection.id, "collection")}
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

          {/* Collections Pagination */}
          <nav className="mt-4 flex flex-col items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCollectionsPage((p) => Math.max(1, p - 1))}
                disabled={collectionsPage === 1 || collectionsLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                {collectionsLoading ? "Loading..." : `Page ${collectionsPage} of ${collectionsTotalPages}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCollectionsPage((p) => p + 1)}
                disabled={collectionsLoading || !collectionsData?.pagination?.nextPage}
              >
                Next
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              {collectionsLoading ? "Loading total count..." : `Total collections: ${collectionsData?.pagination?.totalItems || 0}`}
            </div>
          </nav>
        </section>

        {/* Feedback Pictures Section */}
        <section>
          <header className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold">Feedback Pictures Management</h2>
              <Button onClick={() => handleEditFeedback(null)}>
                Upload New Feedback
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select
                value={feedbackPageSize.toString()}
                onValueChange={(value) => {
                  setFeedbackPageSize(Number(value));
                  setFeedbackPage(1);
                }}
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
          </header>

          {/* Feedback Table */}
          <div className="overflow-x-auto" role="region" aria-label="Feedback pictures table">
            <div className="min-w-full border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]" scope="col">Image</TableHead>
                    <TableHead className="w-[100px]" scope="col">Featured</TableHead>
                    <TableHead className="w-[150px]" scope="col">Created At</TableHead>
                    <TableHead className="w-[200px]" scope="col">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center" role="status" aria-busy="true">
                        <div className="flex items-center justify-center">
                          <LoadingSpinner size="md" />
                          <span className="sr-only">Loading feedback pictures...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : feedbackData?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No feedback pictures found
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedbackData?.data.map((feedback: FeedbackPicture, index: number) => (
                      <TableRow key={`${feedback.id}-${index}`}>
                        <TableCell>
                          <div className="relative w-16 h-16">
                            <img
                              src={feedback.imageUrl}
                              alt="Feedback screenshot"
                              className="object-cover w-full h-full rounded-md"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.png';
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={feedback.featured ? "default" : "secondary"}>
                            {feedback.featured ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {feedback.createdAt ? format(new Date(feedback.createdAt), "MMM dd, yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditFeedback(feedback)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteConfirm(feedback._id || feedback.id, "feedback")}
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

          {/* Feedback Pagination */}
          <nav className="mt-4 flex flex-col items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFeedbackPage((p) => Math.max(1, p - 1))}
                disabled={feedbackPage === 1 || feedbackLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                {feedbackLoading ? "Loading..." : `Page ${feedbackPage} of ${feedbackTotalPages}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFeedbackPage((p) => p + 1)}
                disabled={feedbackLoading || !feedbackData?.pagination?.nextPage}
              >
                Next
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              {feedbackLoading ? "Loading total count..." : `Total feedback pictures: ${feedbackData?.pagination?.totalItems || 0}`}
            </div>
          </nav>
        </section>

        {/* Confirmation Dialog */}
        <ConfirmActionDialog
          isOpen={confirmDialog.isOpen}
          onOpenChange={(isOpen) =>
            setConfirmDialog((prev) => ({ ...prev, isOpen }))
          }
          onConfirm={handleConfirmAction}
          title={`Delete ${confirmDialog.type === "collection" ? "Collection" : "Feedback Picture"}`}
          description={`Are you sure you want to delete this ${confirmDialog.type}? This action cannot be undone.`}
          itemDetails={{
            name: `${confirmDialog.type === "collection" ? "Collection" : "Feedback"} ${
              confirmDialog.itemId ? confirmDialog.itemId.substring(0, 8) + "..." : ""
            }`,
            action: "delete",
          }}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />

        {/* Collection Edit Dialog */}
        <CollectionEditDialog
          isOpen={collectionEditDialog.isOpen}
          onOpenChange={(isOpen) =>
            setCollectionEditDialog((prev) => ({ ...prev, isOpen }))
          }
          collection={collectionEditDialog.collection}
          products={productsData?.data || []}
          onSave={(collectionData, isNew, existingCollection) => {
            if (isNew) {
              createCollectionMutation.mutate(collectionData);
            } else if (existingCollection) {
              updateCollectionMutation.mutate({
                collectionId: existingCollection._id || "",
                collectionData,
              });
            }
          }}
          isLoading={createCollectionMutation.isPending || updateCollectionMutation.isPending}
        />

        {/* Feedback Edit Dialog */}
        <FeedbackEditDialog
          isOpen={feedbackEditDialog.isOpen}
          onOpenChange={(isOpen) =>
            setFeedbackEditDialog((prev) => ({ ...prev, isOpen }))
          }
          feedback={feedbackEditDialog.feedback}
          onSave={(feedbackData, isNew, existingFeedback) => {
            if (isNew) {
              uploadFeedbackMutation.mutate(feedbackData);
            } else if (existingFeedback) {
              updateFeedbackMutation.mutate({
                feedbackId: existingFeedback._id || "",
                feedbackData,
              });
            }
          }}
          isLoading={uploadFeedbackMutation.isPending || updateFeedbackMutation.isPending}
        />
      </main>
    </>
  );
};

export default CollectionsDashboard