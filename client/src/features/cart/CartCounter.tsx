import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import type { RootState } from '@/redux/persist/persist';
import { getCartFromAPI } from '@/features/cart/loggedUsers/loggedUsersCart.services';

// UNIFIED: Cart count hook that works for both logged and guest users
export function useCartCount() {
  const [guestCartCount, setGuestCartCount] = useState(0);
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  const userId = useSelector((state: RootState) => state.auth?.id);
  const isAuthenticated = !!(accessToken && userId);

  // For logged users: Get cart count from React Query
  const { data: loggedUserCart } = useQuery({
    queryKey: ['cart', userId],
    queryFn: () => getCartFromAPI(accessToken!),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // For guest users: Get cart count from localStorage
  const updateGuestCartCount = () => {
    try {
      const cart = localStorage.getItem('guest_cart');
      if (cart) {
        const parsed = JSON.parse(cart);
        const totalItems = parsed.totalItems || 0;
        setGuestCartCount(totalItems);
      } else {
        setGuestCartCount(0);
      }
    } catch (error) {
      console.error('Error parsing guest cart:', error);
      setGuestCartCount(0);
    }
  };

  // Setup guest cart listeners only when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Initial count update for guest users
      updateGuestCartCount();

      // Event listeners for guest cart updates
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'guest_cart') {
          updateGuestCartCount();
        }
      };

      const handleCartUpdate = () => {
        updateGuestCartCount();
      };

      const handleCartUpdateWithDetail = (e: CustomEvent) => {
        if (e.detail && typeof e.detail.totalItems === 'number') {
          setGuestCartCount(e.detail.totalItems);
        } else {
          updateGuestCartCount();
        }
      };

      // Add event listeners
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('guestCartUpdated', handleCartUpdateWithDetail as EventListener);
      window.addEventListener('refreshGuestCart', handleCartUpdate);
      
      // Fallback interval check
      const interval = setInterval(updateGuestCartCount, 2000);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('guestCartUpdated', handleCartUpdateWithDetail as EventListener);
        window.removeEventListener('refreshGuestCart', handleCartUpdate);
        clearInterval(interval);
      };
    } else {
      // Reset guest cart count when user is logged in
      setGuestCartCount(0);
    }
  }, [isAuthenticated]);

  // Return the appropriate cart count based on authentication status
  if (isAuthenticated) {
    return loggedUserCart?.totalItems || 0;
  } else {
    return guestCartCount;
  }
}