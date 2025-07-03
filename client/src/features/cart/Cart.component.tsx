import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { LoadingSpinner } from '@/components/common/loading spinner/LoadingSpinner.component';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { RootState } from '@/redux/persist/persist';

// Import cart components
import LoggedUsersCart from './loggedUsers/loggedUsersCart.component';
import UnloggedUsersCart from './unloggedUsers/unloggedUsersCart.components';

// Import cart types for potential error handling
import type { CartError } from './Cart.types';

interface CartComponentProps {
  // Optional props for customization
  redirectToLogin?: boolean;
  className?: string;
}

const Cart: React.FC<CartComponentProps> = ({
  className = '',
}) => {
  // Redux state for authentication
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  const isInitialized = useSelector((state: RootState) => state.auth?._initialized);
  const userId = useSelector((state: RootState) => state.auth?.id);

  // Local state for cart routing
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<CartError | null>(null);
  const [userType, setUserType] = useState<'logged' | 'unlogged' | 'loading'>('loading');

  // Determine user authentication status
  useEffect(() => {
    const determineUserType = () => {
      try {
        // Wait for Redux to be initialized
        if (!isInitialized) {
          setUserType('loading');
          return;
        }

        // Check if user is authenticated
        const isAuthenticated = !!(accessToken && userId);
        
        if (isAuthenticated) {
          setUserType('logged');
        } else {
          setUserType('unlogged');
        }

        setError(null);
      } catch (err) {
        console.error('Error determining user type:', err);
        setError({
          code: 'AUTH_ERROR',
          message: 'Failed to determine authentication status',
          timestamp: new Date(),
          operation: 'auth_check',
          recoverable: true,
        });
        // Default to unlogged on error
        setUserType('unlogged');
      } finally {
        setIsLoading(false);
      }
    };

    determineUserType();
  }, [accessToken, userId, isInitialized]);

  // Handle retry for authentication errors
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    
    // Force re-check after a brief delay
    setTimeout(() => {
      const isAuthenticated = !!(accessToken && userId);
      setUserType(isAuthenticated ? 'logged' : 'unlogged');
      setIsLoading(false);
    }, 500);
  };

  // Handle navigation to login
  const handleNavigateToHome = () => {
    window.location.href = '/home';
  };

  // Loading state while determining user type
  if (isLoading || userType === 'loading') {
    return (
      <>
        <Helmet>
          <title>Loading Cart... | Your Store</title>
          <meta name="description" content="Loading your shopping cart" />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        
        <div className={`container mx-auto px-4 py-8 ${className}`}>
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center space-y-4">
              <LoadingSpinner size="lg" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-700">
                  Loading Cart
                </h2>
                <p className="text-gray-500">
                  Preparing your shopping experience...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Helmet>
          <title>Cart Error | Your Store</title>
          <meta name="description" content="Cart loading error" />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        
        <div className={`container mx-auto px-4 py-8 ${className}`}>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <AlertTriangle size={64} className="mx-auto text-red-300 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Cart Error
              </h2>
              <p className="text-gray-500 mb-6">
                {error.message}
              </p>
              
              <div className="space-y-2">
                <Button onClick={handleRetry} className="mr-2">
                  Try Again
                </Button>
                
                {error.recoverable && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                )}
              </div>
              
              {error.code === 'AUTH_ERROR' && (
                <div className="mt-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-800">
                      If you're having trouble accessing your account, try logging out and back in.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Render appropriate cart component based on user type
  const renderCartComponent = () => {
    switch (userType) {
      case 'logged':
        return <LoggedUsersCart />;
      
      case 'unlogged':
        return (
          <>
            
            <UnloggedUsersCart />
          </>
        );
      
      default:
        // Fallback to unlogged cart
        return <UnloggedUsersCart />;
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {userType === 'logged' ? 'My Cart' : 'Shopping Cart'} | Your Store
        </title>
        <meta 
          name="description" 
          content={
            userType === 'logged' 
              ? 'Your personal shopping cart with saved items and order history'
              : 'Your shopping cart - sign in to save items and track orders'
          } 
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className={`bg-gray-50 ${className}`}>
        {/* Main Cart Content */}
        <main className="">
          {renderCartComponent()}
        </main>

        
      </div>
      {/* Cart Footer*/}
        <div className="bg-white border-t">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>🚚 3$ Delivery all over Lebanon</span>
                <span>💯 100% Authentic products</span>
                <span>🔒 Secure checkout</span>
              </div>
              
              {userType === 'unlogged' && (
                <div className="text-center">
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={handleNavigateToHome}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Sign in for a better experience →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
    </>
  );
};

export default Cart;