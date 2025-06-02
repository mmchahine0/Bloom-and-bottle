import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@/assets/background.png.jpg";
import menPerfume from "@/assets/ManPerfume.png.jpg";
import femalePerfume from "@/assets/FemalePerfume.png.jpg";
import { HomepageData, ApiResponse } from "./Home.types";
import { getHomepageData } from "./Home.services";

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
      products: [
        {
          _id: "skeleton-product-1",
          name: "Ocean Breeze",
          image:
            "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Product",
        },
        {
          _id: "skeleton-product-2",
          name: "Citrus Fresh",
          image:
            "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Product",
        },
        {
          _id: "skeleton-product-3",
          name: "Light & Airy",
          image:
            "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Product",
        },
        {
          _id: "skeleton-product-4",
          name: "Tropical Blend",
          image:
            "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Product",
        },
      ],
    },
    {
      _id: "skeleton-collection-2",
      title: "Evening Elegance",
      description: "Sophisticated scents for special occasions.",
      products: [
        {
          _id: "skeleton-product-5",
          name: "Midnight Rose",
          image:
            "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Product",
        },
        {
          _id: "skeleton-product-6",
          name: "Golden Hour",
          image:
            "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Product",
        },
        {
          _id: "skeleton-product-7",
          name: "Velvet Dreams",
          image:
            "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Product",
        },
        {
          _id: "skeleton-product-8",
          name: "Royal Mystery",
          image:
            "https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Product",
        },
      ],
    },
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
  const { data, isLoading, error } = useQuery<ApiResponse<HomepageData>>({
    queryKey: ["homepage"],
    queryFn: getHomepageData,
  });

  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [pauseFeedbackAutoSlide, setPauseFeedbackAutoSlide] = useState(false);

  // Use skeleton data if there's an error or no data, otherwise use real data
  const displayData = error || !data ? skeletonData : data.data;
  useEffect(() => {
    if (!pauseFeedbackAutoSlide && displayData?.feedbacks?.length) {
      const interval = setInterval(() => {
        setCurrentFeedbackIndex(
          (prevIndex) => (prevIndex + 1) % (displayData?.feedbacks?.length || 1)
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [pauseFeedbackAutoSlide, displayData]);

  const handleNextFeedback = () => {
    if (!displayData) return;
    setCurrentFeedbackIndex(
      (prevIndex) => (prevIndex + 1) % displayData.feedbacks.length
    );
    setPauseFeedbackAutoSlide(true);
    setTimeout(() => setPauseFeedbackAutoSlide(false), 10000);
  };

  const handlePrevFeedback = () => {
    if (!displayData) return;
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

  // Show loading skeleton with animation
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col animate-pulse">
        {/* Hero Section Skeleton */}
        <section className="relative h-screen w-full flex items-center justify-center bg-gray-300">
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
            <div className="h-16 bg-gray-400 rounded mb-4 mx-auto w-3/4"></div>
            <div className="h-8 bg-gray-400 rounded mb-8 mx-auto w-1/2"></div>
            <div className="h-12 bg-gray-400 rounded-full mx-auto w-48"></div>
          </div>
        </section>

        {/* Collections Skeleton */}
        <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="h-10 bg-gray-300 rounded mb-16 mx-auto w-64"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="bg-gray-300 rounded-lg aspect-[4/5] mb-4"></div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-300 rounded-lg aspect-[4/5] mb-4"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Items Skeleton */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="h-8 bg-gray-300 rounded mb-10 mx-auto w-48"></div>
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
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Full Screen Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center">
        {/* Hero Background Image */}
        <img
          src={heroImage}
          alt="Hero background"
          className="absolute inset-0 h-full w-full object-cover -z-10"
        />
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/30 -z-10"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 tracking-tight">
            You Need To Smell Good
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
            Discover luxurious scents crafted to impress.
          </p>
          <Link
            to="/samples"
            className="inline-block bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
          >
            Browse Samples
          </Link>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
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
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Our Collections
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            {/* For Him Section */}
            <div className="flex-1">
              <div className="bg-black rounded-lg overflow-hidden shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h3
                      className="text-white text-4xl md:text-5xl font-bold text-center drop-shadow-lg"
                      style={{
                        fontFamily: "serif",
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      }}
                    >
                      For him
                    </h3>
                  </div>
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-5 gap-2 p-6">
                    {/* Display perfume bottles in a grid */}
                    <img
                      src={menPerfume}
                      alt="Hero background"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-4 bg-black text-white">
                  <Link
                    to="/perfumes/men"
                    className="flex items-center justify-between group"
                  >
                    <span className="text-xl font-semibold">
                      Men Fragrances
                    </span>
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
                  </Link>
                </div>
              </div>
            </div>

            {/* For Her Section */}
            <div className="flex-1">
              <div className="bg-black rounded-lg overflow-hidden shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h3
                      className="text-white text-4xl md:text-5xl font-bold text-center drop-shadow-lg"
                      style={{
                        fontFamily: "serif",
                        color: "#ffb6c1",
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      }}
                    >
                      For her
                    </h3>
                  </div>
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-5 gap-2 p-6">
                    {/* Display perfume bottles in a grid */}
                    <img
                      src={femalePerfume}
                      alt="Hero background"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-4 bg-black text-white">
                  <Link
                    to="/perfumes/women"
                    className="flex items-center justify-between group"
                  >
                    <span className="text-xl font-semibold">
                      Women Fragrances
                    </span>
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
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Featured Items
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayData?.featuredItems?.map(
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
                            : "bg-black text-white hover:bg-gray-800"
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
          </div>
        </div>
      </section>

      {/* Collections Section */}
      {displayData?.collections?.length > 0 && (
        <section className="container mx-auto mb-16 px-4 bg-gray-50 py-8">
          <div className="mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Collections</h2>
            <div className="space-y-12">
              {displayData.collections.map((collection) => (
                <div
                  key={collection._id}
                  className={`bg-white p-4 md:p-6 rounded-xl shadow-sm ${
                    error ? "opacity-75" : ""
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">{collection.title}</h3>
                  <p className="text-gray-600 mb-4">{collection.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {collection.products.map((product) => (
                      <div
                        key={product._id}
                        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow transition"
                      >
                        <div className="aspect-square bg-gray-50 flex items-center justify-center p-2">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <p className="text-sm font-medium truncate">
                            {product.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Feedback Section */}
      {displayData?.feedbacks?.length > 0 && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
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
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <button
                onClick={handlePrevFeedback}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-black text-white p-2 rounded-full shadow-md z-10 hover:bg-gray-800"
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
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 bg-black text-white p-2 rounded-full shadow-md z-10 hover:bg-gray-800"
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
                        ? "w-6 bg-black"
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
