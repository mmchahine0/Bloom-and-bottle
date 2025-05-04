import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/background.png.jpg";
import menPerfume from "@/assets/ManPerfume.png.jpg";
import femalePerfume from "@/assets/FemalePerfume.png.jpg";

type FeaturedItem = {
  _id: string;
  name: string;
  brand: string;
  price: number;
  sizes: number[];
  image: string;
  type: string;
};

type CollectionProduct = {
  _id: string;
  name: string;
  image: string;
};

type Collection = {
  _id: string;
  title: string;
  description: string;
  products: CollectionProduct[];
};

type Feedback = {
  _id: string;
  user: string;
  screenshot: string;
};

type HomepageData = {
  featuredItems: FeaturedItem[];
  collections: Collection[];
  feedbacks: Feedback[];
};

const dataArray = {
  success: true,
  data: {
    featuredItems: [
      {
        _id: "6638a1...",
        name: "Dior Sauvage",
        brand: "Dior",
        price: 150,
        sizes: [2, 5, 10],
        image: "https://cdn.mysite.com/perfumes/sauvage.png",
        type: "perfume",
      },
      {
        _id: "6638b2...",
        name: "Sample: Baccarat Rouge 540",
        brand: "Maison Francis Kurkdjian",
        price: 20,
        sizes: [1, 2],
        image: "https://cdn.mysite.com/samples/baccarat-sample.png",
        type: "sample",
      },
    ],
    collections: [
      {
        _id: "summer-2024",
        title: "Summer Vibes Collection",
        description: "Light, fresh scents perfect for sunny days.",
        products: [
          {
            _id: "p1",
            name: "Versace Dylan Blue",
            image: "https://cdn.mysite.com/perfumes/dylan.png",
          },
          {
            _id: "p2",
            name: "Chanel Chance Eau Fraîche",
            image: "https://cdn.mysite.com/perfumes/chance.png",
          },
        ],
      },
      {
        _id: "date-night",
        title: "Date Night Favorites",
        description: "Sophisticated and seductive scents.",
        products: [
          {
            _id: "p3",
            name: "Tom Ford Noir",
            image: "https://cdn.mysite.com/perfumes/noir.png",
          },
          {
            _id: "p4",
            name: "Yves Saint Laurent La Nuit",
            image: "https://cdn.mysite.com/perfumes/lanuit.png",
          },
        ],
      },
    ],
    feedbacks: [
      {
        _id: "fb1",
        screenshot: "https://nventmarketing.com/images/mobile-1.png",
      },
      {
        _id: "fb2",
        screenshot: "https://nventmarketing.com/images/mobile-1.png",
      },
      {
        _id: "fb3",
        screenshot:
          "https://leadferno.com/wp-content/uploads/review-request-ask-photos-DB.png",
      },
      {
        _id: "fb4",
        screenshot:
          "https://leadferno.com/wp-content/uploads/review-request-ask-photos-DB.png",
      },
      {
        _id: "fb4",
        screenshot:
          "      https://cdn.discordapp.com/attachments/912627262443114526/1368653347502162092/Screenshot_20250504-211841.jpg?ex=68190142&is=6817afc2&hm=b2c59968ad73ef02cdca69bbd5ef4ca2392d7c80adda91677242b76068c4bd1d&",
      },
    ],
  },
};

// Example images for the "For Him" and "For Her" sections
const menCollection = [
  "/images/men/perfume1.png",
  "/images/men/perfume2.png",
  "/images/men/perfume3.png",
  "/images/men/perfume4.png",
  "/images/men/perfume5.png",
];

const womenCollection = [
  "/images/women/perfume1.png",
  "/images/women/perfume2.png",
  "/images/women/perfume3.png",
  "/images/women/perfume4.png",
  "/images/women/perfume5.png",
];

export default function HomePageContent() {
  const [data, setData] = useState<HomepageData | null>(dataArray.data);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [pauseFeedbackAutoSlide, setPauseFeedbackAutoSlide] = useState(false);

  useEffect(() => {
    // Only set up interval if auto-cycling is not paused
    if (!pauseFeedbackAutoSlide && dataArray?.data.feedbacks.length > 0) {
      const interval = setInterval(() => {
        setCurrentFeedbackIndex(
          (prevIndex) => (prevIndex + 1) % dataArray.data.feedbacks.length
        );
      }, 5000); // Change feedback every 5 seconds

      return () => clearInterval(interval);
    }
  }, [pauseFeedbackAutoSlide, data]);

  const handleNextFeedback = () => {
    if (!data) return;
    setCurrentFeedbackIndex(
      (prevIndex) => (prevIndex + 1) % data.feedbacks.length
    );
    // Pause auto-cycling temporarily
    setPauseFeedbackAutoSlide(true);
    // Resume after 10 seconds of inactivity
    setTimeout(() => setPauseFeedbackAutoSlide(false), 10000);
  };

  const handlePrevFeedback = () => {
    if (!data) return;
    setCurrentFeedbackIndex(
      (prevIndex) =>
        (prevIndex - 1 + data.feedbacks.length) % data.feedbacks.length
    );
    // Pause auto-cycling temporarily
    setPauseFeedbackAutoSlide(true);
    // Resume after 10 seconds of inactivity
    setTimeout(() => setPauseFeedbackAutoSlide(false), 10000);
  };
  if (!data) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Full Screen Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center">
        {/* Hero Background Image */}
        <img
          src={heroImage}
          alt="Hero background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/30"></div>

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
                    to="/men-fragrances"
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
                    to="/women-fragrances"
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
            {data.featuredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 transform hover:scale-[1.02]"
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
                      <p className="text-lg font-bold">${item.price}</p>
                      <p className="text-sm text-gray-500">
                        Sizes: {item.sizes.join(", ")}ml
                      </p>
                    </div>
                    <button className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="container mx-auto mb-16 px-4 bg-gray-50 py-8">
        <div className="mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Collections</h2>
          <div className="space-y-12">
            {data.collections.map((collection) => (
              <div
                key={collection._id}
                className="bg-white p-4 md:p-6 rounded-xl shadow-sm"
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

      {/* Customer Feedback Section */}
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
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
              {/* Fixed aspect ratio container */}
              <div className="relative pb-[180%] w-full">
                {/* Image container with absolute positioning */}
                <div className="absolute p-4 flex items-center justify-center">
                  <img
                    src={data.feedbacks[currentFeedbackIndex].screenshot}
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
              {data.feedbacks.map((_, index) => (
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
    </div>
  );
}
