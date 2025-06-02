import { Product } from './Product.types';
import { apiClient } from '../../api/base'; 
import { ENDPOINTS } from '../../api/endpoints';

export const getProductById = async (
  productId: string,
): Promise<Product> => {
  const response = await apiClient({
    method: "GET",
    endpoint: ENDPOINTS.Products.GetByIdUser(productId), 
  });
  return response as Product;
};