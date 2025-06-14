import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/loading spinner/LoadingSpinner.component';
import type { 
  LocalStorageCart, 
  CartItem, 
  LocalStorageOrder,
  AddToCartData,
  WhatsAppOrderMessage 
} from './unloggedUsersCart.types';
import { Link } from 'react-router-dom';

const WHATSAPP_NUMBER = '+96176913342';
const STORAGE_KEYS = {
  GUEST_CART: 'guest_cart',
  GUEST_ORDERS: 'guest_orders',
  GUEST_SESSION: 'guest_session',
} as const;

const UnloggedUsersCart: React.FC = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<LocalStorageCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Initialize cart from localStorage
  useEffect(() => {
    const initializeCart = () => {
      try {
        const savedCart = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } else {
          // Create new empty cart
          const newCart: LocalStorageCart = {
            items: [],
            totalItems: 0,
            totalPrice: 0,
            discount: 0,
            sessionId: generateSessionId(),
            lastUpdated: new Date(),
          };
          setCart(newCart);
          saveCartToLocalStorage(newCart);
        }
      } catch (error) {
        console.error('Error initializing cart:', error);
        toast({
          title: 'Error',
          description: 'Failed to load cart data',
          variant: 'destructive',
        });
        // Create fallback cart
        const fallbackCart: LocalStorageCart = {
          items: [],
          totalItems: 0,
          totalPrice: 0,
          discount: 0,
          sessionId: generateSessionId(),
          lastUpdated: new Date(),
        };
        setCart(fallbackCart);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCart();
  }, [toast]);

  // Generate unique session ID
  const generateSessionId = (): string => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Generate unique order ID
  const generateOrderId = (): string => {
    return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Save cart to localStorage
  const saveCartToLocalStorage = (cartData: LocalStorageCart) => {
    try {
      const cartToSave = {
        ...cartData,
        lastUpdated: new Date(),
      };
      localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cartToSave));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      toast({
        title: 'Warning',
        description: 'Failed to save cart changes',
        variant: 'destructive',
      });
    }
  };

  // Calculate cart totals
  const calculateCartTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
      const itemPrice = item.discount && item.discount > 0 
        ? item.originalPrice - (item.originalPrice * (item.discount / 100))
        : item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
    
    return { totalItems, totalPrice };
  };

  // Add item to cart
  const addToCartUnlogged = (productData: AddToCartData) => {
    if (!cart) return;

    try {
      const existingItemIndex = cart.items.findIndex(
        item => item.productId === productData.productId && item.size === productData.size
      );

      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item
        updatedItems = cart.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + productData.quantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${productData.productId}_${productData.size}_${Date.now()}`,
          ...productData,
        };
        updatedItems = [...cart.items, newItem];
      }

      const { totalItems, totalPrice } = calculateCartTotals(updatedItems);

      const updatedCart: LocalStorageCart = {
        ...cart,
        items: updatedItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date(),
      };

      setCart(updatedCart);
      saveCartToLocalStorage(updatedCart);

      toast({
        title: 'Success',
        description: 'Item added to cart successfully',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    }
  };

  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (!cart) return;

    try {
      if (newQuantity <= 0) {
        removeItem(itemId);
        return;
      }

      const updatedItems = cart.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );

      const { totalItems, totalPrice } = calculateCartTotals(updatedItems);

      const updatedCart: LocalStorageCart = {
        ...cart,
        items: updatedItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date(),
      };

      setCart(updatedCart);
      saveCartToLocalStorage(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item quantity',
        variant: 'destructive',
      });
    }
  };

  // Remove item from cart
  const removeItem = (itemId: string) => {
    if (!cart) return;

    try {
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      const { totalItems, totalPrice } = calculateCartTotals(updatedItems);

      const updatedCart: LocalStorageCart = {
        ...cart,
        items: updatedItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date(),
      };

      setCart(updatedCart);
      saveCartToLocalStorage(updatedCart);

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
  };

  // Clear entire cart
  const clearCart = () => {
    if (!cart) return;

    try {
      const clearedCart: LocalStorageCart = {
        ...cart,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: new Date(),
      };

      setCart(clearedCart);
      saveCartToLocalStorage(clearedCart);

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
  };

  // Format WhatsApp message
  const formatWhatsAppMessage = (orderData: LocalStorageOrder): string => {
    const orderMessage: WhatsAppOrderMessage = {
      orderId: orderData.orderId,
      items: orderData.items.map(item => ({
        name: item.name,
        brand: item.brand,
        size: item.size,
        quantity: item.quantity,
        price: item.discount && item.discount > 0 
          ? item.originalPrice - (item.originalPrice * (item.discount / 100))
          : item.price,
      })),
      totalPrice: orderData.totalPrice,
      totalItems: orderData.totalItems,
      timestamp: orderData.timestamp.toLocaleString(),
    };

    let message = `🛍️ *New Order* 🛍️\n\n`;
    message += `📋 *Order ID:* ${orderMessage.orderId}\n`;
    message += `📅 *Date:* ${orderMessage.timestamp}\n\n`;
    message += `🎁 *Items Ordered:*\n`;
    
    orderMessage.items.forEach((item, index) => {
      message += `${index + 1}. *${item.brand} - ${item.name}*\n`;
      message += `   Size: ${item.size}\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: $${item.price.toFixed(2)} USD\n\n`;
    });

    message += `📊 *Order Summary:*\n`;
    message += `Total Items: ${orderMessage.totalItems}\n`;
    message += `*Total Price: $${orderMessage.totalPrice.toFixed(2)} USD*\n\n`;
    message += `📞 Please confirm this order and provide delivery details.`;

    return message;
  };

  // Save order to localStorage
  const saveOrderToLocalStorage = (orderData: LocalStorageOrder) => {
    try {
      const existingOrders = localStorage.getItem(STORAGE_KEYS.GUEST_ORDERS);
      const orders: LocalStorageOrder[] = existingOrders ? JSON.parse(existingOrders) : [];
      orders.unshift(orderData); // Add to beginning of array
      
      // Keep only last 50 orders to prevent localStorage bloat
      const limitedOrders = orders.slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.GUEST_ORDERS, JSON.stringify(limitedOrders));
    } catch (error) {
      console.error('Error saving order to localStorage:', error);
      toast({
        title: 'Warning',
        description: 'Order placed but failed to save to history',
        variant: 'destructive',
      });
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      toast({
        title: 'Error',
        description: 'Your cart is empty',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingCheckout(true);

    try {
      const orderId = generateOrderId();
      const orderData: LocalStorageOrder = {
        orderId,
        items: cart.items,
        totalPrice: cart.totalPrice,
        totalItems: cart.totalItems,
        timestamp: new Date(),
        status: 'pending',
      };

      // Save order to localStorage
      saveOrderToLocalStorage(orderData);

      // Generate WhatsApp message
      const whatsappMessage = formatWhatsAppMessage(orderData);
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}?text=${encodedMessage}`;

      // Open WhatsApp
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Clear cart after successful order
      clearCart();

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
  };

  // Get item display price (considering discount)
  const getItemDisplayPrice = (item: CartItem): number => {
    if (item.discount && item.discount > 0) {
      return item.originalPrice - (item.originalPrice * (item.discount / 100));
    }
    return item.price;
  };

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
  if (!cart || cart.items.length === 0) {
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
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  Clear All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          {item.discount && item.discount > 0 ? (
                            <div>
                              <p className="text-lg font-semibold text-red-600">
                                ${getItemDisplayPrice(item).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500 line-through">
                                ${item.originalPrice.toFixed(2)}
                              </p>
                              <Badge variant="destructive" className="text-xs">
                                {item.discount}% OFF
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-lg font-semibold">
                              ${item.price.toFixed(2)}
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
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
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
                                updateQuantity(item.id, newQuantity);
                              }
                            }}
                            className="w-16 text-center border-0 focus-visible:ring-0"
                            min="1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Subtotal: ${(getItemDisplayPrice(item) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
                  disabled={isProcessingCheckout || cart.items.length === 0}
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
                    <span>Satisfaction Guaranteed</span>
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