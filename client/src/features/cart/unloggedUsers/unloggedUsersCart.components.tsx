import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, MessageCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/loading spinner/LoadingSpinner.component';
import { Link } from 'react-router-dom';
import type { 
  LocalStorageCart, 
  CartItem, 
  LocalStorageOrder,
  CollectionCartItem,
} from './unloggedUsersCart.types';
import {
  getCartFromLocalStorage,
  updateItemQuantity,
  updateCollectionQuantity,
  removeItemFromCart,
  removeCollectionFromCart,
  clearCart,
  calculateItemPrice,
  generateOrderId,
  generateWhatsAppURL,
  saveOrderToLocalStorage,
  updateAndSaveCart,
} from './unloggedUsersCart.services';

const UnloggedUsersCart: React.FC = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<LocalStorageCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // FIXED: Initialize cart with proper error handling and recalculation
  const initializeCart = useCallback(() => {
    try {
      const savedCart = getCartFromLocalStorage();
      
      // FIXED: Force recalculation of totals in case of data inconsistency
      const correctedCart = updateAndSaveCart(savedCart);
      setCart(correctedCart);
      
    } catch (error) {
      console.error('Error initializing cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart data',
        variant: 'destructive',
      });
      
      // Create fallback cart
      const fallbackCart = {
        items: [],
        collectionItems: [],
        totalItems: 0,
        totalPrice: 0,
        discount: 0,
        sessionId: `guest_${Date.now()}`,
        lastUpdated: new Date(),
      };
      setCart(fallbackCart);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initialize cart from localStorage
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  // FIXED: Listen for cart updates from other tabs/windows with better event handling
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'guest_cart') {
        const updatedCart = getCartFromLocalStorage();
        const correctedCart = updateAndSaveCart(updatedCart);
        setCart(correctedCart);
      }
    };

    const handleCustomCartUpdate = () => {
      const updatedCart = getCartFromLocalStorage();
      const correctedCart = updateAndSaveCart(updatedCart);
      setCart(correctedCart);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('guestCartUpdated', handleCustomCartUpdate as EventListener);
    window.addEventListener('refreshGuestCart', handleCustomCartUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('guestCartUpdated', handleCustomCartUpdate as EventListener);
      window.removeEventListener('refreshGuestCart', handleCustomCartUpdate as EventListener);
    };
  }, []);

  // FIXED: Update item quantity with better error handling
  const handleUpdateItemQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (!cart || !itemId) {
      console.error('Invalid cart or item ID');
      return;
    }

    try {
      const updatedCart = updateItemQuantity(cart, itemId, newQuantity);
      setCart(updatedCart);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: updatedCart }));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item quantity',
        variant: 'destructive',
      });
    }
  }, [cart, toast]);

  // FIXED: Update collection quantity with better error handling
  const handleUpdateCollectionQuantity = useCallback((collectionId: string, newQuantity: number) => {
    if (!cart || !collectionId) {
      console.error('Invalid cart or collection ID');
      return;
    }

    try {
      const updatedCart = updateCollectionQuantity(cart, collectionId, newQuantity);
      setCart(updatedCart);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: updatedCart }));
    } catch (error) {
      console.error('Error updating collection quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update collection quantity',
        variant: 'destructive',
      });
    }
  }, [cart, toast]);

  // FIXED: Remove item from cart with better validation
  const handleRemoveItem = useCallback((itemId: string) => {
    if (!cart || !itemId) {
      console.error('Invalid cart or item ID');
      return;
    }

    try {
      const updatedCart = removeItemFromCart(cart, itemId);
      setCart(updatedCart);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: updatedCart }));

      toast({
        title: 'Success',
        description: 'Item removed from cart',
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    }
  }, [cart, toast]);

  // FIXED: Remove collection from cart with better validation
  const handleRemoveCollection = useCallback((collectionId: string) => {
    if (!cart || !collectionId) {
      console.error('Invalid cart or collection ID');
      return;
    }

    try {
      const updatedCart = removeCollectionFromCart(cart, collectionId);
      setCart(updatedCart);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: updatedCart }));

      toast({
        title: 'Success',
        description: 'Collection removed from cart',
      });
    } catch (error) {
      console.error('Error removing collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove collection',
        variant: 'destructive',
      });
    }
  }, [cart, toast]);

  // FIXED: Clear entire cart with better error handling
  const handleClearCart = useCallback(() => {
    try {
      const clearedCart = clearCart();
      setCart(clearedCart);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: clearedCart }));

      toast({
        title: 'Success',
        description: 'Cart cleared successfully',
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // FIXED: Handle checkout process with better validation
  const handleCheckout = useCallback(async () => {
    if (!cart || (cart.items.length === 0 && cart.collectionItems.length === 0)) {
      toast({
        title: 'Error',
        description: 'Your cart is empty',
        variant: 'destructive',
      });
      return;
    }

    if (cart.totalPrice <= 0) {
      toast({
        title: 'Error',
        description: 'Invalid cart total. Please refresh and try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingCheckout(true);

    try {
      const orderId = generateOrderId();
      const orderData: LocalStorageOrder = {
        orderId,
        items: cart.items || [],
        collectionItems: cart.collectionItems || [],
        totalPrice: cart.totalPrice,
        totalItems: cart.totalItems,
        timestamp: new Date(),
        status: 'pending',
      };


      // Save order to localStorage
      const orderSaved = saveOrderToLocalStorage(orderData);
      
      if (!orderSaved) {
        throw new Error('Failed to save order');
      }

      // Generate WhatsApp URL and open
      const whatsappUrl = generateWhatsAppURL(orderData);
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Clear cart after successful order
      handleClearCart();

      toast({
        title: 'Order Placed!',
        description: 'Your order has been sent via WhatsApp. Please check the chat to confirm.',
      });

    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: 'Error',
        description: 'Failed to process checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingCheckout(false);
    }
  }, [cart, toast, handleClearCart]);

  // FIXED: Get item display price with better validation
  const getItemDisplayPrice = useCallback((item: CartItem): number => {
    if (!item) return 0;
    return calculateItemPrice(item);
  }, []);

  // FIXED: Get collection display price with validation
  const getCollectionDisplayPrice = useCallback((collection: CollectionCartItem): number => {
    if (!collection) return 0;
    return collection.totalPrice || 0;
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" label="Loading cart..." />
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || (cart.items.length === 0 && cart.collectionItems.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to get started!</p>
            <Link to={"/home"}>
              <Button 
                className="bg-[#2c2c2c] text-white hover:bg-gray-800"
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
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  Clear All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Individual Items */}
                {cart.items.map((item) => {
                  if (!item) return null;
                  
                  return (
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
                          
                          {/* FIXED: Price display with proper validation */}
                          <div className="text-right mt-2 sm:mt-0">
                            {item.discount && item.discount > 0 ? (
                              <div>
                                <p className="text-lg font-semibold text-red-600">
                                  ${getItemDisplayPrice(item).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500 line-through">
                                  ${(item.originalPrice || item.price || 0).toFixed(2)}
                                </p>
                                <Badge variant="destructive" className="text-xs">
                                  {item.discount}% OFF
                                </Badge>
                              </div>
                            ) : (
                              <p className="text-lg font-semibold">
                                ${(item.price || 0).toFixed(2)}
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
                              onClick={() => handleUpdateItemQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                              disabled={(item.quantity || 1) <= 1}
                              className="px-3 py-1"
                            >
                              <Minus size={16} />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity || 1}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1;
                                if (newQuantity > 0) {
                                  handleUpdateItemQuantity(item.id, newQuantity);
                                }
                              }}
                              className="w-16 text-center border-0 focus-visible:ring-0"
                              min="1"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateItemQuantity(item.id, (item.quantity || 1) + 1)}
                              className="px-3 py-1"
                            >
                              <Plus size={16} />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>

                        {/* FIXED: Item Total with proper calculation */}
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Subtotal: ${(getItemDisplayPrice(item) * (item.quantity || 1)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Collections */}
                {cart.collectionItems.map((collection) => {
                  if (!collection) return null;
                  
                  return (
                    <div key={collection.id} className="flex flex-col gap-4 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-white">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Package className="w-6 h-6 text-purple-600" />
                          <div>
                            <h3 className="font-semibold text-lg">{collection.collectionName || 'Collection'}</h3>
                            {collection.collectionDescription && (
                              <p className="text-sm text-gray-600 mt-1">{collection.collectionDescription}</p>
                            )}
                            <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-800">
                              Collection Bundle
                            </Badge>
                          </div>
                        </div>
                        
                        {/* FIXED: Collection Price display with validation */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-purple-700">
                            ${getCollectionDisplayPrice(collection).toFixed(2)}
                          </p>
                          {getCollectionDisplayPrice(collection) <= 0 && (
                            <p className="text-xs text-red-500">
                              Price not set
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Collection Image */}
                      {collection.collectionImage && (
                        <div className="w-full h-48 rounded-md overflow-hidden">
                          <img
                            src={collection.collectionImage}
                            alt={collection.collectionName || 'Collection'}
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
                            onClick={() => handleUpdateCollectionQuantity(collection.id, Math.max(1, (collection.quantity || 1) - 1))}
                            disabled={(collection.quantity || 1) <= 1}
                            className="px-3 py-1"
                          >
                            <Minus size={16} />
                          </Button>
                          <Input
                            type="number"
                            value={collection.quantity || 1}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              if (newQuantity > 0) {
                                handleUpdateCollectionQuantity(collection.id, newQuantity);
                              }
                            }}
                            className="w-16 text-center border-0 focus-visible:ring-0"
                            min="1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateCollectionQuantity(collection.id, (collection.quantity || 1) + 1)}
                            className="px-3 py-1"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCollection(collection.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      {/* FIXED: Collection Subtotal with proper calculation */}
                      <div className="text-right pt-2 border-t">
                        <p className="text-sm text-gray-600">
                          Collection Subtotal: ${(getCollectionDisplayPrice(collection) * (collection.quantity || 1)).toFixed(2)}
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
      <span>${((cart.totalPrice || 0)- 3.00).toFixed(2)}</span>
    </div>
    {cart.discount > 0 && (
      <div className="flex justify-between text-sm text-green-600">
        <span>Discount</span>
        <span>-${(cart.discount || 0).toFixed(2)}</span>
      </div>
    )}
    <div className="flex justify-between text-sm">
      <span>With Shipping</span>
      <span>$3.00</span>
    </div>
    <hr />
    <div className="flex justify-between font-semibold text-lg">
      <span>Total</span>
      <span>${(cart.totalPrice || 0).toFixed(2)} USD</span>
    </div>
  </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isProcessingCheckout || (cart.items.length === 0 && cart.collectionItems.length === 0) || cart.totalPrice <= 0}
                  className="w-full bg-[#2c2c2c] text-white hover:bg-gray-800 h-12"
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
                  You'll be redirected to WhatsApp to complete your order
                </div>

                {/* Features */}
                <div className="space-y-2 pt-4 border-t">
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
                    <span>Sign in to save your cart</span>
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

export default UnloggedUsersCart;