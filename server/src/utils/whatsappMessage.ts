import { Document } from "mongoose";
import { Order } from "../database/model/orderModel";

interface OrderItem {
  product: {
    name: string;
  };
  size: string;
  quantity: number;
  price: number;
  discount: number;
}

interface CollectionProduct {
  name: string;
  size: string;
  quantity: number;
  price: number;
  discount: number;
}

interface CollectionItem {
  collectionName: string;
  quantity: number;
  products: CollectionProduct[];
  totalPrice: number;
  discount: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface OrderDocument extends Document {
  items: OrderItem[];
  collectionItems: CollectionItem[];
  totalPrice: number;
  originalTotalPrice: number;
  discount: number;
  totalItems: number;
  shippingAddress: ShippingAddress;
  _id: string;
  createdAt: Date;
}

export const formatOrderForWhatsApp = (order: OrderDocument): string => {
  const { items, collectionItems, totalPrice, discount, shippingAddress } = order;

  // Format individual items
  const itemsText = items.map(item => {
    const itemTotal = item.price * item.quantity;
    const discountText = item.discount > 0 ? ` (${item.discount}% off)` : '';
    return `- ${item.product.name} (${item.size}) x${item.quantity} - $${itemTotal}${discountText}`;
  }).join('\n');

  // Format collection items
  const collectionsText = collectionItems.map(collection => {
    const productsText = collection.products.map(product => {
      const productTotal = product.price * product.quantity;
      const discountText = product.discount > 0 ? ` (${product.discount}% off)` : '';
      return `  * ${product.name} (${product.size}) x${product.quantity} - $${productTotal}${discountText}`;
    }).join('\n');

    const collectionDiscountText = collection.discount > 0 ? ` (${collection.discount}% off)` : '';
    return `
Collection: ${collection.collectionName}
Quantity: ${collection.quantity}
Products:
${productsText}
Collection Total: $${collection.totalPrice}${collectionDiscountText}`;
  }).join('\n');

  // Format shipping address
  const addressText = `
Shipping Address:
Name: ${shippingAddress.name}
Phone: ${shippingAddress.phone}
Address: ${shippingAddress.address}
City: ${shippingAddress.city}
Country: ${shippingAddress.country}`;

  // Combine all parts
  const message = `
New Order Received! 🎉

Order Items:
${itemsText}

Collection Items:
${collectionsText}

${addressText}

Order Summary:
Total Items: ${order.totalItems}
Subtotal: $${order.originalTotalPrice}
Discount: $${discount}
Total: $${totalPrice}

Order ID: ${order._id}
Date: ${new Date(order.createdAt).toLocaleString()}`;

  return message;
};

export const sendWhatsAppMessage = async (message: string): Promise<void> => {
  try {
    const whatsappNumber = process.env.WHATSAPP_NUMBER;
    if (!whatsappNumber) {
      throw new Error('WhatsApp number not configured');
    }

    // Here you would integrate with your WhatsApp API provider
    // For example, using Twilio:
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   to: `whatsapp:${whatsappNumber}`,
    //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
    // });

    
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}; 