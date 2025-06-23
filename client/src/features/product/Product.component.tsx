import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getProductById } from './Product.services';
import { useCart } from '../cart/useCart';

interface ProductNotes {
  top: string[];
  middle: string[];
  base: string[];
}

const ProductDetail: React.FC = () => {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const { addToCart } = useCart(); //handles if logged or unlogged
  const navigate = useNavigate();
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
  });

  const parseNotes = (notesString: string): ProductNotes => {
    try {
      return JSON.parse(notesString);
    } catch (error) {
      console.error('Error parsing notes:', error);
      return { top: [], middle: [], base: [] };
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const getSelectedPrice = () => {
    if (!product) return 0;
    const selectedSizeObj = product.sizes.find(size => size.label === selectedSize);
    return selectedSizeObj ? selectedSizeObj.price : product.price;
  };

  const getDiscountedPrice = (originalPrice: number) => {
    if (!product || !product.discount) return originalPrice;
    return originalPrice - (originalPrice * (product.discount / 100));
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize) {
      toast({
        title: 'Error',
        description: 'Please select a size',
        variant: 'destructive',
      });
      return;
    }

    const selectedSizeObj = product.sizes.find(size => size.label === selectedSize);
    if (!selectedSizeObj) return;

    const cartItem = {
      productId: product._id,
      name: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
      size: selectedSize,
      quantity: quantity,
      price: selectedSizeObj.price,
      originalPrice: selectedSizeObj.price,
      discount: product.discount,
      type: product.type,
    };

    addToCart(cartItem);
  };

  const handleBuyItNow = () => {
    if (!product || !selectedSize) {
      toast({
        title: 'Error',
        description: 'Please select a size',
        variant: 'destructive',
      });
      return;
    }

    const selectedSizeObj = product.sizes.find(size => size.label === selectedSize);
    if (!selectedSizeObj) return;

    const cartItem = {
      productId: product._id,
      name: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
      size: selectedSize,
      quantity: quantity,
      price: selectedSizeObj.price,
      originalPrice: selectedSizeObj.price,
      discount: product.discount,
      type: product.type,
    };

    addToCart(cartItem);
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">{error instanceof Error ? error.message : 'Product not found'}</div>
      </div>
    );
  }

  // Set default size selection when product data is loaded
  if (product.sizes && product.sizes.length > 0 && !selectedSize) {
    setSelectedSize(product.sizes[0].label);
  }

  const parsedNotes = product.notes ? parseNotes(product.notes) : { top: [], middle: [], base: [] };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Brand and Product Name */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.brand}
            </h1>
            <h2 className="text-2xl font-medium text-gray-800">
              {product.name}
            </h2>
            <div className="flex gap-2 mt-2">
              {product.featured && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  Featured
                </span>
              )}
              {product.limitedEdition && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  Limited Edition
                </span>
              )}
              {product.comingSoon && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-2xl font-semibold text-gray-900">
            {product.discount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-red-600">
                  ${getDiscountedPrice(getSelectedPrice()).toFixed(2)} USD
                </span>
                <span className="text-gray-500 line-through text-lg">
                  ${getSelectedPrice().toFixed(2)} USD
                </span>
                <span className="text-sm text-red-600 font-medium">
                  {product.discount}% OFF
                </span>
              </div>
            ) : (
              <span>${getSelectedPrice().toFixed(2)} USD</span>
            )}
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Size</h3>
              <div className="flex space-x-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(size.label)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      selectedSize === size.label
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quantity</h3>
            <div className="flex items-center border border-gray-300 rounded-md w-32">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="flex-1 text-center py-2 border-l border-r border-gray-300">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>
          </div>

          {/* Stock Warning */}
          {!product.stock && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <span className="font-medium pr-2">●</span> This product is currently out of stock
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleAddToCart}
              className={`w-full py-3 px-6 rounded-full font-medium transition-colors ${
                product.stock 
                  ? 'bg-white border-2 border-black text-black hover:bg-gray-50' 
                  : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!product.stock}
              title={!product.stock ? "This product is currently out of stock" : ""}
            >
              Add to cart
            </button>
            <button 
              onClick={handleBuyItNow}
              className={`w-full py-3 px-6 rounded-full font-medium transition-colors ${
                product.stock 
                  ? 'bg-black text-white hover:bg-gray-800' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!product.stock}
              title={!product.stock ? "This product is currently out of stock" : ""}
            >
              Buy it now
            </button>
          </div>

          {/* Features */}
          <div className="space-y-3 border-t pt-6">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-gray-700">Delivery all over Lebanon</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">100% Authentic</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">Satisfaction Guaranteed</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Notes Section */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-medium text-gray-900 mb-4">Fragrance Notes</h3>
            
            {/* Top Notes */}
            {parsedNotes.top.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Top Notes</h4>
                <p className="text-gray-600">{parsedNotes.top.join(', ')}</p>
              </div>
            )}

            {/* Middle Notes */}
            {parsedNotes.middle.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Middle Notes</h4>
                <p className="text-gray-600">{parsedNotes.middle.join(', ')}</p>
              </div>
            )}

            {/* Base Notes */}
            {parsedNotes.base.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Base Notes</h4>
                <p className="text-gray-600">{parsedNotes.base.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Product Type and Category */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Type</h4>
                <p className="text-gray-600 capitalize">{product.type}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Category</h4>
                <p className="text-gray-600 capitalize">{product.category}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;