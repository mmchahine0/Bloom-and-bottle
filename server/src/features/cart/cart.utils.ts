import { 
  IProduct, 
  ICartItemWithProduct, 
  ICollectionCartItemWithPopulated,
  CartSummary,
  CartItemResponse,
  CollectionCartItemResponse,
  OrderItem
} from './cart.types';

/**
 * Get the price for a product based on size
 */
export const getProductPrice = (product: IProduct, size: string): number => {
  if (!product.sizes || product.sizes.length === 0) {
    return product.price;
  }
  
  const sizeOption = product.sizes.find(s => s.label === size);
  return sizeOption?.price || product.price;
};

/**
 * Get the original price (before discount) for a product
 */
export const getProductOriginalPrice = (product: IProduct, size: string): number => {
  const currentPrice = getProductPrice(product, size);
  
  if (!product.discount || product.discount === 0) {
    return currentPrice;
  }
  
  // Calculate original price from discounted price
  // discounted_price = original_price * (1 - discount/100)
  // original_price = discounted_price / (1 - discount/100)
  return Math.round(currentPrice / (1 - product.discount / 100));
};

/**
 * Calculate totals for individual cart items
 */
export const calculateProductTotals = (items: ICartItemWithProduct[]): {
  totalItems: number;
  totalPrice: number;
  totalDiscount: number;
} => {
  let totalItems = 0;
  let totalPrice = 0;
  let totalDiscount = 0;

  items.forEach(item => {
    const currentPrice = typeof item.price === 'number' ? item.price : getProductPrice(item.product, item.size);
    const originalPrice = getProductOriginalPrice(item.product, item.size);
    const itemDiscount = originalPrice - currentPrice;
    
    totalItems += item.quantity;
    totalPrice += currentPrice * item.quantity;
    totalDiscount += itemDiscount * item.quantity;
  });

  return {
    totalItems,
    totalPrice,
    totalDiscount
  };
};

/**
 * Calculate totals for collection cart items
 */
export const calculateCollectionTotals = (items: ICollectionCartItemWithPopulated[]): {
  totalItems: number;
  totalPrice: number;
} => {
  let totalItems = 0;
  let totalPrice = 0;

  items.forEach(item => {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;
  });

  return {
    totalItems,
    totalPrice
  };
};

/**
 * Calculate combined cart summary
 */
export const calculateCartSummary = (
  productItems: ICartItemWithProduct[],
  collectionItems: ICollectionCartItemWithPopulated[]
): CartSummary => {
  const productTotals = calculateProductTotals(productItems);
  const collectionTotals = calculateCollectionTotals(collectionItems);

  return {
    totalItems: productTotals.totalItems + collectionTotals.totalItems,
    totalPrice: productTotals.totalPrice + collectionTotals.totalPrice,
    totalDiscount: productTotals.totalDiscount,
    subtotalProducts: productTotals.totalPrice,
    subtotalCollections: collectionTotals.totalPrice
  };
};

/**
 * Transform cart item to response format
 */
export const transformCartItemToResponse = (item: ICartItemWithProduct): CartItemResponse => {
  // Use stored price, fallback to util if missing (legacy)
  const currentPrice = typeof item.price === 'number' ? item.price : getProductPrice(item.product, item.size);
  const originalPrice = getProductOriginalPrice(item.product, item.size);

  return {
    id: item._id.toString(),
    productId: item.product._id.toString(),
    name: item.product.name,
    brand: item.product.brand,
    imageUrl: item.product.imageUrl,
    size: item.size,
    quantity: item.quantity,
    price: currentPrice,
    originalPrice: originalPrice,
    discount: item.product.discount || 0,
    type: item.product.type || 'perfume'
  };
};

/**
 * Transform collection cart item to response format
 */
export const transformCollectionItemToResponse = (item: ICollectionCartItemWithPopulated): CollectionCartItemResponse => {
  return {
    id: item._id.toString(),
    collectionId: item.collectionId._id.toString(),
    collectionName: item.collectionId.name,
    collectionDescription: item.collectionId.description,
    collectionImage: item.collectionId.image,
    quantity: item.quantity,
    price: item.price
  };
};

/**
 * Type guards for populated cart items
 */
export const isPopulatedCartItem = (item: any): item is ICartItemWithProduct => {
  return item && 
         item.product && 
         typeof item.product === 'object' && 
         '_id' in item.product &&
         'name' in item.product &&
         'brand' in item.product &&
         'price' in item.product;
};

export const isPopulatedCollectionItem = (item: any): item is ICollectionCartItemWithPopulated => {
  return item && 
         item.collectionId && 
         typeof item.collectionId === 'object' && 
         '_id' in item.collectionId &&
         'name' in item.collectionId &&
         'price' in item.collectionId;
};

/**
 * Filter and assert populated items
 */
export const getPopulatedCartItems = (items: any[]): ICartItemWithProduct[] => {
  return items.filter(isPopulatedCartItem);
};

export const getPopulatedCollectionItems = (items: any[]): ICollectionCartItemWithPopulated[] => {
  return items.filter(isPopulatedCollectionItem);
};

/**
 * Convert cart to order format
 */
export const convertCartToOrderItems = (
  productItems: ICartItemWithProduct[],
  collectionItems: ICollectionCartItemWithPopulated[]
): OrderItem[] => {
  const orderItems: OrderItem[] = [];

  // Add individual products
  productItems.forEach(item => {
    orderItems.push({
      productId: item.product._id.toString(),
      size: item.size,
      quantity: item.quantity,
      price: getProductPrice(item.product, item.size)
    });
  });

  // Add products from collections
  collectionItems.forEach(collectionItem => {
    collectionItem.products.forEach(product => {
      orderItems.push({
        productId: product.productId.toString(),
        size: product.size,
        quantity: product.quantity * collectionItem.quantity, // Multiply by collection quantity
        price: collectionItem.price / collectionItem.products.length // Distribute collection price
      });
    });
  });

  return orderItems;
};

/**
 * Validate cart item data
 */
export const validateCartItemData = (productId: string, size: string, quantity: number = 1): string | null => {
  if (!productId) return "Product ID is required";
  if (!size) return "Size is required";
  if (quantity <= 0 || quantity > 10) return "Quantity must be between 1 and 10";
  return null;
};

/**
 * Validate collection data
 */
export const validateCollectionData = (collectionId: string, quantity: number = 1): string | null => {
  if (!collectionId) return "Collection ID is required";
  if (quantity <= 0 || quantity > 10) return "Quantity must be between 1 and 10";
  return null;
};