import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@/assets/background.jpg";
import menPerfume from "@/assets/ManPerfume.jpg";
import femalePerfume from "@/assets/FemalePerfume.jpg";
import collectionsBackground from "@/assets/collections.jpg"
import { HomepageData, ApiResponse } from "./Home.types";
import { getHomepageData } from "./Home.services";
import { useCart } from "@/features/cart/useCart";
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";

// Skeleton data for error/loading states
const skeletonData: HomepageData = {
  featuredItems: [
    {
      _id: "skeleton-1",
      name: "Premium Fragrance",
      brand: "Luxury Brand",
      price: 120,
      sizes: [
        { label: "50ml", price: 120 },
        { label: "100ml", price: 200 },
      ],
      image: "https://via.placeholder.com/300x400/f3f4f6/9ca3af?text=Perfume",
      type: "perfume",
    },
    {
      _id: "skeleton-2",
      name: "Signature Scent",
      brand: "Designer House",
      price: 95,
      sizes: [
        { label: "30ml", price: 95 },
        { label: "50ml", price: 150 },
        { label: "100ml", price: 250 },
      ],
      image: "https://via.placeholder.com/300x400/f3f4f6/9ca3af?text=Perfume",
      type: "perfume",
    },
    {
      _id: "skeleton-3",
      name: "Sample Collection",
      brand: "Niche Perfumer",
      price: 25,
      sizes: [
        { label: "2ml", price: 25 },
        { label: "5ml", price: 45 },
      ],
      image: "https://via.placeholder.com/300x400/f3f4f6/9ca3af?text=Sample",
      type: "sample",
    },
    {
      _id: "skeleton-4",
      name: "Limited Edition",
      brand: "Exclusive Brand",
      price: 180,
      sizes: [
        { label: "75ml", price: 180 },
        { label: "100ml", price: 220 },
      ],
      image: "https://via.placeholder.com/300x400/f3f4f6/9ca3af?text=Perfume",
      type: "perfume",
    },
  ],
  collections: [
    {
      _id: "skeleton-collection-1",
      title: "Summer Essentials",
      description: "Fresh and light fragrances perfect for warm weather.",
      image: "https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Collection",
      price: 199.99,
      products: [
        {
          _id: "skeleton-perfume-1",
          name: "Ocean Breeze",
          brand: "Summer Scents",
          image: "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Perfume",
          sizes: [
            { size: "50ml", price: 89.99 },
            { size: "100ml", price: 149.99 }
          ]
        },
        {
          _id: "skeleton-perfume-2",
          name: "Citrus Fresh",
          brand: "Summer Scents",
          image: "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Perfume",
          sizes: [
            { size: "50ml", price: 79.99 },
            { size: "100ml", price: 129.99 }
          ]
        }
      ]
    },
    {
      _id: "skeleton-collection-2",
      title: "Evening Elegance",
      description: "Sophisticated scents for special occasions.",
      image: "https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Collection",
      price: 299.99,
      products: [
        {
          _id: "skeleton-perfume-3",
          name: "Midnight Rose",
          brand: "Evening Collection",
          image: "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Perfume",
          sizes: [
            { size: "50ml", price: 129.99 },
            { size: "100ml", price: 199.99 }
          ]
        },
        {
          _id: "skeleton-perfume-4",
          name: "Golden Hour",
          brand: "Evening Collection",
          image: "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Perfume",
          sizes: [
            { size: "50ml", price: 139.99 },
            { size: "100ml", price: 209.99 }
          ]
        }
      ]
    }
  ],
  feedbacks: [
    {
      _id: "skeleton-feedback-1",
      screenshot:
        "https://via.placeholder.com/300x600/f3f4f6/9ca3af?text=Customer+Review",
    },
    {
      _id: "skeleton-feedback-2",
      screenshot:
        "https://via.placeholder.com/300x600/f3f4f6/9ca3af?text=5+Star+Review",
    },
    {
      _id: "skeleton-feedback-3",
      screenshot:
        "https://via.placeholder.com/300x600/f3f4f6/9ca3af?text=Happy+Customer",
    },
  ],
};

export default function HomePageContent() {
  const navigate = useNavigate();
  const { addCollectionToCart, isAuthenticated } = useCart();
  const { data, isLoading, error } = useQuery<ApiResponse<HomepageData>>({
    queryKey: ["homepage"],
    queryFn: getHomepageData,
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
  });

  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [pauseFeedbackAutoSlide, setPauseFeedbackAutoSlide] = useState(false);
  const { toast } = useToast();

  // Use skeleton data if there's an error or no data, otherwise use real data
  const displayData = error || !data ? skeletonData : data.data;

  useEffect(() => {
    if (!pauseFeedbackAutoSlide && displayData?.feedbacks?.length) {
      const interval = setInterval(() => {
        setCurrentFeedbackIndex(
          (prevIndex) => (prevIndex + 1) % (displayData.feedbacks?.length || 1)
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [pauseFeedbackAutoSlide, displayData]);

  const handleNextFeedback = () => {
    if (!displayData?.feedbacks?.length) return;
    setCurrentFeedbackIndex(
      (prevIndex) => (prevIndex + 1) % displayData.feedbacks.length
    );
    setPauseFeedbackAutoSlide(true);
    setTimeout(() => setPauseFeedbackAutoSlide(false), 10000);
  };

  const handlePrevFeedback = () => {
    if (!displayData?.feedbacks?.length) return;
    setCurrentFeedbackIndex(
      (prevIndex) =>
        (prevIndex - 1 + displayData.feedbacks.length) %
        displayData.feedbacks.length
    );
    setPauseFeedbackAutoSlide(true);
    setTimeout(() => setPauseFeedbackAutoSlide(false), 10000);
  };

  const handleCheckItem = (itemId: string) => {
    if (!error) {
      navigate(`/product/${itemId}`);
    }
  };

  // FIXED: Handle add to cart with proper collection price
  const handleAddToCart = (collectionId: string) => {
    const collection = displayData?.collections.find(c => c._id === collectionId);
    if (!collection) {
      toast({
        title: 'Error',
        description: 'Collection not found',
        variant: 'destructive',
      });
      return;
    }

    // Validate collection price
    const collectionPrice = collection.price || 0;
    if (collectionPrice <= 0) {
      toast({
        title: 'Error',
        description: 'Invalid collection price',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isAuthenticated) {
        // For logged users - use the backend API structure
        const collectionData = {
          collectionId: collection._id,
          quantity: 1,
          items: collection.products.map(product => ({
            productId: product._id,
            size: "default", 
            quantity: 1
          })),
          // Additional data for display purposes
          collectionName: collection.title,
          collectionDescription: collection.description,
          collectionImage: collection.image,
          price: collectionPrice,
        };
        
        addCollectionToCart(collectionData);
      } else {
        // For guest users - pass the price and display information
        const guestCollectionData = {
          collectionId: collection._id,
          quantity: 1,
          items: collection.products.map(product => ({
            productId: product._id,
            size: "default",
            quantity: 1
          })),
          // FIXED: Include the actual collection price and display data
          collectionName: collection.title,
          collectionDescription: collection.description,
          collectionImage: collection.image,
          price: collectionPrice, // This is the key fix - pass the actual price
        };
        
        addCollectionToCart(guestCollectionData);
      }

    } catch (error) {
      console.error('Error adding collection to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add collection to cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  

  return (
    <div className="min-h-screen flex flex-col">
      {/* Full Screen Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center">
        {/* Hero Background Image */}
        <img
          src={heroImage}
          alt="Hero background"
          className="absolute inset-0 h-full w-full object-cover -z-10"
          loading="lazy"
        />
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-[#2c2c2c]/20 -z-10"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl mb-4 tracking-tight font-semibold">
            You Need To Smell Good
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
            Discover luxurious scents crafted to impress.
          </p>
          <Link
            to="/samples"
            className="inline-block bg-white text-[#2c2c2c] px-8 py-4 font-semibold text-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
          >
            Browse Samples
          </Link>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={() => {
          const el = document.getElementById('main');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}>
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            ></path>
          </svg>
        </div>
      </section>

      {/* For Him / For Her Sections */}
      <section id="main" className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 ">
  <div className="max-w-5xl mx-auto">
    <h2 className="text-4xl font-stretch-50% text-[#2c2c2c] text-center mb-6 border-x-4 border-[#2c2c2c]">
      Our Perfumes
    </h2>

    <div className="grid grid-cols-2 gap-8">
      <Link to="/perfumes/men" className="group block">
        <div className="bg-[#2c2c2c] rounded-lg overflow-hidden shadow-xl relative aspect-[3/4] sm:aspect-[4/5] flex flex-col justify-end cursor-pointer max-h-[690px] min-h-[180px] sm:min-h-0">
          <img
            src={menPerfume}
            alt="Men Fragrance"
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="relative z-10 p-4 bg-[#2c2c2c] bg-opacity-70 text-white flex items-center justify-between">
            <span className="text-xl font-semibold">Men Fragrances</span>
            <svg
              className="w-6 h-6 transform group-hover:translate-x-2 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </div>
        </div>
      </Link>

      <Link to="/perfumes/women" className="group block">
        <div className="bg-[#2c2c2c] rounded-lg overflow-hidden shadow-xl relative aspect-[3/4] sm:aspect-[4/5] flex flex-col justify-end cursor-pointer max-h-[690px] min-h-[180px] sm:min-h-0">
          <img
            src={femalePerfume}
            alt="Women Fragrance"
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="relative z-10 p-4 bg-[#2c2c2c] bg-opacity-70 text-white flex items-center justify-between">
            <span className="text-xl font-semibold">Women Fragrances</span>
            <svg
              className="w-6 h-6 transform group-hover:translate-x-2 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </div>
        </div>
      </Link>
    </div>
  </div>
</section>
      {/* Featured Items Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-y-2 border-[#2c2c2c]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-stretch-100% text-[#2c2c2c] mb-10 text-center">
            Featured Items
          </h2>
          {isLoading ? (
          // Featured skeleton here
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md"
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex-1 bg-gray-300 rounded-lg mb-4 h-60"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-300 rounded mt-4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayData?.featuredItems && displayData.featuredItems.map(
            (item: {
              _id: string;
              name: string;
              brand: string;
              price: number;
              sizes: Array<{ label: string; price: number }>;
              image: string;
              type: string;
            }) => (
              <div
                key={item._id}
                className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 transform hover:scale-[1.02] ${
                  error ? "opacity-75" : ""
                }`}
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 rounded-lg mb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full max-h-60 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.brand}</p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-lg font-bold">From ${item.price}</p>
                      <p className="text-sm text-gray-500 m-2">
                        Sizes:{" "}
                        {item.sizes
                          .map(
                            (size: { label: string; price: number }) =>
                              `${size.label} `
                          )
                          .join(", ")}
                      </p>
                    </div>
                    <button
                      className={`mt-4 w-full py-2 rounded-lg transition ${
                        error
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                          : "bg-[#2c2c2c] text-white hover:bg-gray-800 cursor-pointer"
                      }`}
                      disabled={!!error}
                      onClick={() => handleCheckItem(item._id)}
                    >
                      {error ? "Demo Item" : "Check item"}
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>)}
        </div>
      </section>

      {/* Collections Section */}
      {displayData?.collections && displayData.collections.length > 0 && (
  <section className="container mx-auto mb-10 px-2 py-6 relative" style={{background: `url(${collectionsBackground}) center/cover no-repeat`}}>
  <div className="absolute inset-0 bg-black/30 pointer-events-none" style={{zIndex: 0}}></div>
  <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 lg:mb-8 text-center text-white relative z-10">Collections</h2>
  <div
    className={
      displayData.collections.length === 1
        ? "flex justify-center"
        : displayData.collections.length === 2
        ? "flex justify-center gap-6 lg:gap-12"
        : "flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 lg:gap-8 md:overflow-x-visible"
    }
    style={{zIndex: 10, position: 'relative'}}
  >
      {displayData.collections.map((collection) => (
        <div
          key={collection._id}
          className={`min-w-[220px] max-w-xs md:max-w-sm lg:max-w-sm xl:max-w-md w-full flex-shrink-0 md:min-w-0 md:w-auto bg-white rounded-xl shadow-md border border-gray-200 p-3 md:p-4 lg:p-5 xl:p-6 flex flex-col transition hover:shadow-lg ${error ? "opacity-75" : ""}`}
        >
          <div className="h-24 md:h-32 lg:h-36 xl:h-40 w-full rounded-lg overflow-hidden mb-2 lg:mb-3 flex items-center justify-center bg-gray-100">
            <img
              src={collection.image}
              alt={collection.title}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </div>
          
          <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl italic font-bold mb-1 lg:mb-2 text-[#2c2c2c]">
            {collection.title}
          </h3>
          
          <p className="mb-2 lg:mb-3 text-[11px] md:text-xs lg:text-sm xl:text-sm text-[#6d4c41] leading-tight" style={{fontFamily: 'Georgia,serif'}}>
            {collection.description}
          </p>
          
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <span className="px-2 py-1 lg:px-2.5 lg:py-1 xl:px-3 xl:py-1.5 rounded-full bg-[#2c2c2c] text-white font-extrabold text-sm lg:text-sm xl:text-base tracking-wide shadow-sm font-mono" style={{fontFamily: 'Fira Mono,monospace'}}>
              ${collection.price?.toFixed(2)}
            </span>
            {error && <span className="text-xs lg:text-xs text-gray-400 ml-2">Demo</span>}
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-5 flex-1">
            {collection.products && collection.products.slice(0, window.innerWidth >= 1024 ? 6 : 4).map((product) => (
              <div key={product._id} className="bg-gray-50 rounded-lg p-2 lg:p-3 xl:p-4 flex flex-col items-center border border-gray-200 hover:bg-gray-100 transition-colors">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-contain w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 mb-2"
                  loading="lazy"
                />
                <span className="text-xs md:text-sm lg:text-base xl:text-lg text-[#2c2c2c] text-center font-semibold leading-tight w-full">
                  {product.name}
                </span>
              </div>
            ))}
          </div>
          
          <Button
            onClick={() => handleAddToCart(collection._id)}
            disabled={!!error}
            className={`mt-auto px-4 py-2 lg:px-5 lg:py-2.5 xl:px-6 xl:py-3 rounded-full text-sm lg:text-sm xl:text-base font-medium transition bg-[#2c2c2c] text-white hover:bg-gray-800 cursor-pointer ${error ? "bg-gray-400 text-gray-600 cursor-not-allowed" : ""}`}
          >
            {error ? "Demo" : "Add to Cart"}
          </Button>
        </div>
      ))}
    </div>
  </section>
)}

      {/* Customer Feedback Section */}
      {displayData?.feedbacks && displayData.feedbacks.length > 0 && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-stretch-50% mb-8 text-center">
              Customer Feedback
            </h2>

            {/* Carousel Container */}
            <div
              className="relative mx-auto"
              style={{ maxWidth: "min(90vw, 500px)" }}
            >
              {/* Feedback Display */}
              <div
                className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md ${
                  error ? "opacity-75" : ""
                }`}
              >
                {/* Fixed aspect ratio container */}
                <div className="relative pb-[180%] w-full">
                  {/* Image container with absolute positioning */}
                  <div className="absolute p-4 flex items-center justify-center">
                    <img
                      src={
                        displayData.feedbacks[currentFeedbackIndex]?.screenshot
                      }
                      alt="Customer feedback"
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <button
                onClick={handlePrevFeedback}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-[#2c2c2c] text-white p-2 rounded-full shadow-md z-10 hover:bg-gray-800"
                aria-label="Previous feedback"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
              </button>

              <button
                onClick={handleNextFeedback}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 bg-[#2c2c2c] text-white p-2 rounded-full shadow-md z-10 hover:bg-gray-800"
                aria-label="Next feedback"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center mt-4 space-x-2">
                {displayData.feedbacks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentFeedbackIndex(index);
                      setPauseFeedbackAutoSlide(true);
                      setTimeout(() => setPauseFeedbackAutoSlide(false), 10000);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      currentFeedbackIndex === index
                        ? "w-6 bg-[#2c2c2c]"
                        : "w-2 bg-gray-400"
                    }`}
                    aria-label={`Go to feedback ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}