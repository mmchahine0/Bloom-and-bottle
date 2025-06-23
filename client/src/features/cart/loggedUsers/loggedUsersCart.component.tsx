import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Plus, Minus, Trash2, ShoppingCart, MessageCircle, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/loading spinner/LoadingSpinner.component';
import { queryClient } from '@/lib/queryClient';
import type { RootState } from '@/redux/persist/persist';
import type { LoggedUserWhatsAppOrder, WhatsAppCollectionItem } from './loggedUsersCart.types';
import {
  getCartFromAPI,
  incrementCartAPI,
  decrementCartAPI,
  removeFromCartAPI,
  clearCartAPI,
  placeOrderAPI,
  removeCollectionFromCartAPI,
  incrementCollectionQuantityAPI,
  decrementCollectionQuantityAPI,
} from './loggedUsersCart.services';
import { Link } from 'react-router-dom';
import type { CollectionCartItem } from '../Cart.types';

const WHATSAPP_NUMBER = '+96176913342';

const LoggedUsersCart: React.FC = () => {
  const { toast } = useToast();
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  const userId = useSelector((state: RootState) => state.auth?.id);
  const username = useSelector((state: RootState) => state.userdata?.username);
  const email = useSelector((state: RootState) => state.userdata?.email);
  
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Query for cart data
  const { 
    data: cart, 
    isLoading: isLoadingCart, 
    error: cartError,
    refetch: refetchCart 
  } = useQuery({
    queryKey: ['cart', userId],
    queryFn: () => getCartFromAPI(accessToken!),
    enabled: !!accessToken && !!userId,
  });


  // Increment quantity mutation
  const incrementQuantityMutation = useMutation({
    mutationFn: (itemId: string) => incrementCartAPI(itemId, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
    onError: (error) => {
      console.error('Error incrementing quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item quantity',
        variant: 'destructive',
      });
    },
  });

  // Decrement quantity mutation
  const decrementQuantityMutation = useMutation({
    mutationFn: (itemId: string) => decrementCartAPI(itemId, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
    onError: (error) => {
      console.error('Error decrementing quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item quantity',
        variant: 'destructive',
      });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeFromCartAPI(itemId, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast({
        title: 'Success',
        description: 'Item removed from cart',
      });
    },
    onError: (error) => {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'destructive',
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: () => clearCartAPI(accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast({
        title: 'Success',
        description: 'Cart cleared successfully',
      });
    },
    onError: (error) => {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive',
      });
    },
  });

  // Collection mutations
  const removeCollectionMutation = useMutation({
    mutationFn: (itemId: string) => removeCollectionFromCartAPI(itemId, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast({
        title: 'Success',
        description: 'Collection removed from cart',
      });
    },
    onError: (error) => {
      console.error('Error removing collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove collection from cart',
        variant: 'destructive',
      });
    },
  });

  const incrementCollectionMutation = useMutation({
    mutationFn: (itemId: string) => incrementCollectionQuantityAPI(itemId, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
    onError: (error) => {
      console.error('Error incrementing collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to update collection quantity',
        variant: 'destructive',
      });
    },
  });

  const decrementCollectionMutation = useMutation({
    mutationFn: (itemId: string) => decrementCollectionQuantityAPI(itemId, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
    onError: (error) => {
      console.error('Error decrementing collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to update collection quantity',
        variant: 'destructive',
      });
    },
  });

  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number, currentQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemMutation.mutate(itemId);
      return;
    }

    if (newQuantity > currentQuantity) {
      incrementQuantityMutation.mutate(itemId);
    } else {
      decrementQuantityMutation.mutate(itemId);
    }
  };

  // Remove item from cart
  const removeItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  // Clear entire cart
  const clearCart = () => {
    clearCartMutation.mutate();
  };

  // Update collection quantity
  const updateCollectionQuantity = (itemId: string, newQuantity: number, currentQuantity: number) => {
    if (newQuantity <= 0) {
      removeCollectionMutation.mutate(itemId);
      return;
    }

    if (newQuantity > currentQuantity) {
      incrementCollectionMutation.mutate(itemId);
    } else {
      decrementCollectionMutation.mutate(itemId);
    }
  };

  // Remove collection from cart
  const removeCollection = (itemId: string) => {
    removeCollectionMutation.mutate(itemId);
  };

  // FIXED: Helper to get collection unit price and total
  const getCollectionPricing = (collection: CollectionCartItem) => {
    return {
      unitPrice: collection.totalPrice, // This is per-unit price from backend
      totalPrice: collection.totalPrice * collection.quantity // Calculate total
    };
  };

  // UPDATED: Format WhatsApp message for simplified collections
  const formatWhatsAppMessage = (orderData: LoggedUserWhatsAppOrder): string => {
    let message = `*New Order*\n\n`;
    message += `*Order ID:* ${orderData.orderId}\n`;
    message += `*Customer:* ${username || 'N/A'}\n`;
    message += `*Email:* ${email || 'N/A'}\n`;
    message += `*User ID:* ${orderData.customerInfo.userId}\n`;
    message += `*Date:* ${orderData.timestamp}\n\n`;
    
    // Add individual items
    if (orderData.items.length > 0) {
      message += `*Individual Items:*\n`;
      orderData.items.forEach((item, index) => {
        message += `${index + 1}. *${item.brand} - ${item.name}*\n`;
        message += `   Size: ${item.size}\n`;
        message += `   Quantity: ${item.quantity}\n`;
        message += `   Price: ${item.price.toFixed(2)} USD\n\n`;
      });
    }

    // Add collections (simplified)
    if (orderData.collections && orderData.collections.length > 0) {
      message += `*Collections:*\n`;
      orderData.collections.forEach((collection: WhatsAppCollectionItem, index: number) => {
        message += `${index + 1}. *${collection.name}*\n`;
        if (collection.description) {
          message += `   Description: ${collection.description}\n`;
        }
        message += `   Quantity: ${collection.quantity}\n`;
        message += `   Total Price: ${collection.totalPrice.toFixed(2)} USD\n\n`;
      });
    }

    message += `*Order Summary:*\n`;
    message += `Total Items: ${orderData.totalItems}\n`;
    message += `*Total Price: ${orderData.totalPrice.toFixed(2)} USD*\n\n`;
    message += `Please confirm this order and provide delivery details.`;

    return message;
  };

  // UPDATED: Handle checkout process to include collections
  const handleCheckout = async () => {
    if (!cart || (cart.items.length === 0 && (!cart.collectionItems || cart.collectionItems.length === 0))) {
      toast({
        title: 'Error',
        description: 'Your cart is empty',
        variant: 'destructive',
      });
      return;
    }

    if (!accessToken || !userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to checkout',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingCheckout(true);

    try {
      // Create the order using the new endpoint
      const orderResponse = await placeOrderAPI({
        items: cart.items.map(item => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.price
        })),
        collectionItems: cart.collectionItems?.map(collection => ({
          collectionId: collection.collectionId,
          quantity: collection.quantity,
          totalPrice: getCollectionPricing(collection).totalPrice // Use calculated total
        })) || [],
        totalPrice: cart.totalPrice
      }, accessToken);

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      if (!orderResponse.data) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }
      
      // Prepare WhatsApp message with the order ID from the database
      const whatsappOrderData: LoggedUserWhatsAppOrder = {
        orderId: orderResponse.data.orderId,
        items: cart.items.map(item => ({
          name: item.name,
          brand: item.brand,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        collections: cart.collectionItems?.map(collection => ({
          name: collection.collectionName,
          description: collection.collectionDescription,
          quantity: collection.quantity,
          totalPrice: getCollectionPricing(collection).totalPrice, // Use calculated total
        })) || [],
        totalPrice: cart.totalPrice,
        totalItems: cart.totalItems,
        timestamp: new Date().toLocaleString(),
        customerInfo: {
          userId: userId,
          // Add user info if available from Redux store
        },
        databaseOrderId: orderResponse.data.orderId
      };

      // Generate WhatsApp message
      const whatsappMessage = formatWhatsAppMessage(whatsappOrderData);
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}?text=${encodedMessage}`;

      // Open WhatsApp
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Clear cart after successful order
      clearCartMutation.mutate();

      toast({
        title: 'Order Placed!',
        description: 'Your order has been created and sent via WhatsApp. Please check the chat to confirm.',
      });

    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: 'Checkout Failed',
        description: error instanceof Error ? error.message : 'Failed to process your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Loading state
  if (isLoadingCart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" label="Loading your cart..." />
        </div>
      </div>
    );
  }

  // Error state
  if (cartError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <AlertTriangle size={64} className="mx-auto text-red-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Failed to Load Cart</h2>
            <p className="text-gray-500 mb-6">
              {cartError instanceof Error ? cartError.message : 'Something went wrong'}
            </p>
            <Button onClick={() => refetchCart()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty cart state
  if (!cart || (cart.items.length === 0 && (!cart.collectionItems || cart.collectionItems.length === 0))) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to get started!</p>
            <Link to={"/home"}>
              <Button 
                onClick={() => window.history.back()}
                className="bg-black text-white hover:bg-gray-800"
              >
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  Shopping Cart ({cart.totalItems} items)
                </CardTitle>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  disabled={clearCartMutation.isPending}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  {clearCartMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Clear All'
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Individual Items */}
                {cart.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                    {/* Product Image */}
                    <div className="w-full sm:w-24 h-48 sm:h-24 flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={`${item.brand} ${item.name}`}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{item.brand}</h3>
                          <p className="text-gray-600">{item.name}</p>
                          <Badge variant="outline" className="mt-1">
                            {item.type} - {item.size}
                          </Badge>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right mt-2 sm:mt-0">
                          {(item.discount ?? 0) > 0 ? (
                            <div>
                              <p className="text-lg font-semibold text-red-600">
                                ${item.price.toFixed(2)} USD
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  ${item.originalPrice.toFixed(2)} USD
                                </span>
                                <span className="ml-2 text-xs text-red-600 font-semibold">{item.discount}% OFF</span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-lg font-semibold">
                              ${item.price.toFixed(2)} USD
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => decrementQuantityMutation.mutate(item.id)}
                            disabled={item.quantity <= 1 || decrementQuantityMutation.isPending}
                            className="px-3 py-1"
                          >
                            <Minus size={16} />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              if (newQuantity > 0) {
                                updateQuantity(item.id, newQuantity, item.quantity);
                              }
                            }}
                            className="w-16 text-center border-0 focus-visible:ring-0"
                            min="1"
                            disabled={incrementQuantityMutation.isPending || decrementQuantityMutation.isPending}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => incrementQuantityMutation.mutate(item.id)}
                            disabled={incrementQuantityMutation.isPending || decrementQuantityMutation.isPending}
                            className="px-3 py-1"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={removeItemMutation.isPending}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          {removeItemMutation.isPending ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Collections - FIXED for proper pricing */}
                {cart.collectionItems?.map((collection: CollectionCartItem) => {
                  const { unitPrice, totalPrice } = getCollectionPricing(collection);
                  
                  return (
                    <div key={collection.id} className="flex flex-col gap-4 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Package className="w-6 h-6 text-purple-600" />
                          <div>
                            <h3 className="font-semibold text-lg">{collection.collectionName}</h3>
                            {collection.collectionDescription && (
                              <p className="text-sm text-gray-600 mt-1">{collection.collectionDescription}</p>
                            )}
                            <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-800">
                              Collection Bundle
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Collection Price - FIXED */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-purple-700">
                            ${unitPrice.toFixed(2)} each
                          </p>
                          <p className="text-sm text-gray-600">
                            Total: ${totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Collection Image - OPTIONAL */}
                      {collection.collectionImage && (
                        <div className="w-full h-48 rounded-md overflow-hidden">
                          <img
                            src={collection.collectionImage}
                            alt={collection.collectionName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-collection.png';
                            }}
                          />
                        </div>
                      )}

                      {/* Collection Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => decrementCollectionMutation.mutate(collection.id)}
                            disabled={collection.quantity <= 1 || decrementCollectionMutation.isPending}
                            className="px-3 py-1"
                          >
                            <Minus size={16} />
                          </Button>
                          <Input
                            type="number"
                            value={collection.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              if (newQuantity > 0) {
                                updateCollectionQuantity(collection.id, newQuantity, collection.quantity);
                              }
                            }}
                            className="w-16 text-center border-0 focus-visible:ring-0"
                            min="1"
                            disabled={incrementCollectionMutation.isPending || decrementCollectionMutation.isPending}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => incrementCollectionMutation.mutate(collection.id)}
                            disabled={incrementCollectionMutation.isPending || decrementCollectionMutation.isPending}
                            className="px-3 py-1"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCollection(collection.id)}
                          disabled={removeCollectionMutation.isPending}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          {removeCollectionMutation.isPending ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </Button>
                      </div>

                      {/* Collection Subtotal - FIXED */}
                      <div className="text-right pt-2 border-t">
                        <p className="text-sm text-gray-600">
                          Collection Subtotal: ${totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Items ({cart.totalItems})</span>
                    <span>${cart.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${cart.totalPrice.toFixed(2)} USD</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isProcessingCheckout || (cart.items.length === 0 && (!cart.collectionItems || cart.collectionItems.length === 0))}
                  className="w-full bg-black text-white hover:bg-gray-800 h-12"
                >
                  {isProcessingCheckout ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageCircle size={18} />
                      Checkout via WhatsApp
                    </div>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  Your order will be sent via WhatsApp for confirmation
                </div>

                {/* Features */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Saved to your account</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Delivery all over Lebanon</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>100% Authentic Products</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Order tracking available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoggedUsersCart;