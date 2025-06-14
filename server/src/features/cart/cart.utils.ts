import type { IProduct, ICollectionCartItemWithProduct } from './cart.types';

export const getProductPrice = (product: IProduct, size: string): number => {
  if (!product.sizes) return product.price;
  
  const sizeOption = product.sizes.find(s => s.label === size);
  return sizeOption ? sizeOption.price : product.price;
};

export const getProductOriginalPrice = (product: IProduct, size: string): number => {
  if (!product.sizes) return product.originalPrice || product.price;
  
  const sizeOption = product.sizes.find(s => s.label === size);
  return sizeOption?.originalPrice || product.originalPrice || product.price;
};

export const calculateCartTotals = (items: Array<{
  product: IProduct;
  quantity: number;
  size: string;
}>): { totalItems: number; totalPrice: number; discount: number } => {
  let totalItems = 0;
  let totalPrice = 0;
  let totalDiscount = 0;

  items.forEach(item => {
    const itemPrice = getProductPrice(item.product, item.size);
    const originalPrice = getProductOriginalPrice(item.product, item.size);
    const itemDiscount = originalPrice - itemPrice;
    
    totalItems += item.quantity;
    totalPrice += itemPrice * item.quantity;
    totalDiscount += itemDiscount * item.quantity;
  });

  return {
    totalItems,
    totalPrice,
    discount: totalDiscount
  };
};

// NEW: Calculate collection cart totals
export const calculateCollectionCartTotals = (collectionItems: ICollectionCartItemWithProduct[]): {
  totalItems: number;
  totalPrice: number;
  discount: number;
} => {
  let totalItems = 0;
  let totalPrice = 0;
  let totalDiscount = 0;

  collectionItems.forEach(collectionItem => {
    // Each collection item has a quantity (how many bundles)
    const bundleQuantity = collectionItem.quantity;
    totalItems += bundleQuantity;

    // Calculate price for one bundle (all products in the collection)
    let bundlePrice = 0;
    let bundleDiscount = 0;

    collectionItem.products.forEach(productItem => {
      const product = productItem.product;
      const itemPrice = getProductPrice(product, productItem.size);
      const originalPrice = getProductOriginalPrice(product, productItem.size);
      const itemDiscount = originalPrice - itemPrice;

      // Multiply by the quantity of this specific product in the bundle
      bundlePrice += itemPrice * productItem.quantity;
      bundleDiscount += itemDiscount * productItem.quantity;
    });

    // Multiply bundle totals by how many bundles we have
    totalPrice += bundlePrice * bundleQuantity;
    totalDiscount += bundleDiscount * bundleQuantity;
  });

  return {
    totalItems,
    totalPrice,
    discount: totalDiscount
  };
};

// NEW: Calculate combined totals (individual items + collections)
export const calculateCombinedCartTotals = (
  individualItems: Array<{ product: IProduct; quantity: number; size: string; }>,
  collectionItems: ICollectionCartItemWithProduct[]
): { totalItems: number; totalPrice: number; discount: number } => {
  const individualTotals = calculateCartTotals(individualItems);
  const collectionTotals = calculateCollectionCartTotals(collectionItems);

  return {
    totalItems: individualTotals.totalItems + collectionTotals.totalItems,
    totalPrice: individualTotals.totalPrice + collectionTotals.totalPrice,
    discount: individualTotals.discount + collectionTotals.discount
  };
};