import { Document } from "mongoose";
import { Order } from "../database/model/orderModel";
import { User } from "../database/model/userModel";

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

interface OrderDocument extends Document {
  items: OrderItem[];
  collectionItems: CollectionItem[];
  totalPrice: number;
  originalTotalPrice: number;
  discount: number;
  totalItems: number;
  user: {
    name: string;
    email: string;
  };
  _id: string;
  createdAt: Date;
}

export const formatOrderForWhatsApp = (order: OrderDocument): string => {
  const { items, collectionItems, totalPrice, discount, user } = order;

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

  // Format user information
  const userInfo = `
Customer Information:
Name: ${user.name}
Email: ${user.email}`;

  // Combine all parts
  const message = `
New Order Received! 🎉

${userInfo}

Order Items:
${itemsText}

Collection Items:
${collectionsText}

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