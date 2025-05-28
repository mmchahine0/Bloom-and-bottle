import { clearCredentials } from "../../../redux/slices/authSlices";
import { clearUserData } from "../../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { Link } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
  ShoppingCart,
  LogIn,
  LogOut,
  Search,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import logo from "@/assets/logoSlim.png";

interface NavbarProps {
  customLinks?: {
    label: string;
    path: string;
    visibility: "logged-in" | "logged-out" | "all" | "admin";
  }[];
}
interface Product {
  slug: string;
  name: string;
  imageUrl?: string;
}
const array = [
  "All Perfumes are 100% Authentic",
  "Pay Cash on Delivery",
  "No need to login!",
];

const Navbar: React.FC<NavbarProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentIndexMessage, setCurrentIndexMessage] = useState(0);
  const [pauseAutoSlide, setPauseAutoSlide] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [perfumesMenuOpen, setPerfumesMenuOpen] = useState(false);
  const [samplesMenuOpen, setSamplesMenuOpen] = useState(false);

  const [searchResults, setSearchResults] = useState<{
    suggestions: string[];
    pages: { url: string; title: string }[];
    products: Product[];
  }>({
    suggestions: [],
    pages: [],
    products: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const perfumesMenuRef = useRef<HTMLDivElement>(null);
  const samplesMenuRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  // Handle closing menu with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isMenuOpen) {
          setIsMenuOpen(false);
          buttonRef.current?.focus();
        }
        if (perfumesMenuOpen) {
          setPerfumesMenuOpen(false);
        }
        if (samplesMenuOpen) {
          setSamplesMenuOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen, perfumesMenuOpen, samplesMenuOpen]);

  // Handle clicking outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }

      if (
        isSearchOpen &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }

      if (
        perfumesMenuOpen &&
        perfumesMenuRef.current &&
        !perfumesMenuRef.current.contains(e.target as Node)
      ) {
        setPerfumesMenuOpen(false);
      }

      if (
        samplesMenuOpen &&
        samplesMenuRef.current &&
        !samplesMenuRef.current.contains(e.target as Node)
      ) {
        setSamplesMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, isSearchOpen, perfumesMenuOpen, samplesMenuOpen]);

  // Focus trap within mobile menu
  useEffect(() => {
    if (!isMenuOpen) return;

    const menuElement = menuRef.current;
    if (!menuElement) return;

    const focusableElements = menuElement.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex="0"]'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    menuElement.addEventListener("keydown", handleTabKey);
    return () => menuElement.removeEventListener("keydown", handleTabKey);
  }, [isMenuOpen]);

  // Auto-slide for messages
  useEffect(() => {
    // Only set up interval if auto-cycling is not paused
    if (!pauseAutoSlide) {
      const interval = setInterval(() => {
        setCurrentIndexMessage((prevIndex) => (prevIndex + 1) % array.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [pauseAutoSlide]);

  const handleNextMessage = () => {
    setCurrentIndexMessage((prevIndex) => (prevIndex + 1) % array.length);
    // Pause auto-cycling temporarily
    setPauseAutoSlide(true);
    // Resume after 8 seconds of inactivity
    setTimeout(() => setPauseAutoSlide(false), 8000);
  };

  const handlePrevMessage = () => {
    setCurrentIndexMessage(
      (prevIndex) => (prevIndex - 1 + array.length) % array.length
    );
    // Pause auto-cycling temporarily
    setPauseAutoSlide(true);
    // Resume after 8 seconds of inactivity
    setTimeout(() => setPauseAutoSlide(false), 8000);
  };

  const handleSignOut = () => {
    queryClient.clear();
    dispatch(clearCredentials());
    dispatch(clearUserData());
    navigate("/auth/login");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const togglePerfumesMenu = () => {
    setPerfumesMenuOpen(!perfumesMenuOpen);
    if (samplesMenuOpen) setSamplesMenuOpen(false);
  };

  const toggleSamplesMenu = () => {
    setSamplesMenuOpen(!samplesMenuOpen);
    if (perfumesMenuOpen) setPerfumesMenuOpen(false);
  };

  // Function to handle the search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({
        suggestions: [],
        pages: [],
        products: [],
      });
      return;
    }

    setIsLoading(true);
    try {
      // Replace these endpoints with your actual API endpoints
      const suggestionsPromise = axios.get(
        `/api/search/suggestions?q=${encodeURIComponent(query)}`
      );
      const pagesPromise = axios.get(
        `/api/search/pages?q=${encodeURIComponent(query)}`
      );
      const productsPromise = axios.get(
        `/api/search/products?q=${encodeURIComponent(query)}`
      );

      const [suggestionsResponse, pagesResponse, productsResponse] =
        await Promise.all([suggestionsPromise, pagesPromise, productsPromise]);

      setSearchResults({
        suggestions: suggestionsResponse.data || [],
        pages: pagesResponse.data || [],
        products: productsResponse.data || [],
      });
    } catch (error) {
      console.error("Error fetching search results:", error);
      // Handle error - could set an error state here
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSearchOpen && searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen]);

  // Focus search input when search popup opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults({
      suggestions: [],
      pages: [],
      products: [],
    });
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Reset search when opening
      clearSearch();
    }
  };

  return (
    <header>
      {/* Sliding announcement banner */}
      <div className=" overflow-hidden py-2 text-white border-b-1 cursor-default bg-black">
        <div className="flex items-center justify-center relative">
          <button
            onClick={handlePrevMessage}
            className="relative left-2 text-[#ecbdc6] hover:text-white z-10"
            aria-label="Previous message"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="w-full overflow-hidden h-6 relative">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndexMessage * 100}%)`,
              }}
            >
              {array.map((item, index) => (
                <span
                  key={index}
                  className="w-full flex-shrink-0 text-center font-bold text-[#ecbdc6] font-mono"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleNextMessage}
            className="relative right-2 text-[#ecbdc6] hover:text-white z-10"
            aria-label="Next message"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <nav
        className="bg-black border-b border-[#f6d9d2] px-4 py-2.5 relative z-50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto relative">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Search */}
            <div className="flex items-center space-x-4">
              <Link
                to="/home"
                className="text-xl font-bold text-[#f6d9d2] hover:text-[#f6d9d2]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F] rounded-md"
                aria-label="MyApp Home"
              >
                <img
                  src={logo}
                  alt="Bloom and bottle"
                  className="max-h-24 max-w-40"
                />
              </Link>
              <div
                className="flex items-center space-x-2 border- "
                onClick={toggleSearch}
              >
                <button
                  className="text-[#ecbdc6] hover:text-white p-2 transition-colors "
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
                <p className="py-1.5 text-[#ecbdc6] rounded-md pr-4 pointer-events-none hidden  lg:block">
                  Search Items Here
                </p>
              </div>
            </div>

            {/* Center - Main Navigation Links */}
            <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-6">
                <Link
                  to="/home"
                  className="text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md text-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                >
                  Home
                </Link>

                {/* Samples dropdown menu */}
                <div className="relative">
                  <button
                    onClick={toggleSamplesMenu}
                    className="text-[#ecbdc6] hover:text-white flex items-center px-3 py-2 rounded-md text-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    aria-expanded={samplesMenuOpen}
                    aria-haspopup="true"
                  >
                    Samples
                    <ChevronDown size={16} className="ml-1" />
                  </button>

                  {/* Samples dropdown content */}
                  {samplesMenuOpen && (
                    <div
                      ref={samplesMenuRef}
                      className="absolute mt-1 w-48 rounded-md shadow-lg bg-black border border-[#f6d9d2] py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <Link
                        to="/samples/men"
                        className="block px-4 py-2 text-sm text-[#ecbdc6] hover:bg-gray-900 hover:text-white"
                        role="menuitem"
                        onClick={() => setSamplesMenuOpen(false)}
                      >
                        Men
                      </Link>
                      <Link
                        to="/samples/women"
                        className="block px-4 py-2 text-sm text-[#ecbdc6] hover:bg-gray-900 hover:text-white"
                        role="menuitem"
                        onClick={() => setSamplesMenuOpen(false)}
                      >
                        Women
                      </Link>
                      <Link
                        to="/samples"
                        className="block px-4 py-2 text-sm text-[#ecbdc6] hover:bg-gray-900 hover:text-white"
                        role="menuitem"
                        onClick={() => setSamplesMenuOpen(false)}
                      >
                        View All
                      </Link>
                    </div>
                  )}
                </div>

                {/* Perfumes dropdown menu */}
                <div className="relative">
                  <button
                    onClick={togglePerfumesMenu}
                    className="text-[#ecbdc6] hover:text-white flex items-center px-3 py-2 rounded-md text-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    aria-expanded={perfumesMenuOpen}
                    aria-haspopup="true"
                  >
                    Perfumes
                    <ChevronDown size={16} className="ml-1" />
                  </button>

                  {/* Perfumes dropdown content */}
                  {perfumesMenuOpen && (
                    <div
                      ref={perfumesMenuRef}
                      className="absolute mt-1 w-48 rounded-md shadow-lg bg-black border border-[#f6d9d2] py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <Link
                        to="/perfumes/men"
                        className="block px-4 py-2 text-sm text-[#ecbdc6] hover:bg-gray-900 hover:text-white"
                        role="menuitem"
                        onClick={() => setPerfumesMenuOpen(false)}
                      >
                        Men
                      </Link>
                      <Link
                        to="/perfumes/women"
                        className="block px-4 py-2 text-sm text-[#ecbdc6] hover:bg-gray-900 hover:text-white"
                        role="menuitem"
                        onClick={() => setPerfumesMenuOpen(false)}
                      >
                        Women
                      </Link>
                      <Link
                        to="/perfumes"
                        className="block px-4 py-2 text-sm text-[#ecbdc6] hover:bg-gray-900 hover:text-white"
                        role="menuitem"
                        onClick={() => setPerfumesMenuOpen(false)}
                      >
                        View All
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - User icons */}
            <div
              className="hidden md:flex items-center space-x-4"
              role="menubar"
              aria-label="Desktop navigation menu"
            >
              {accessToken ? (
                <>
                  {/* Logged in: Show User, Cart, and Logout icons */}
                  <Link
                    to="/dashboard/profile"
                    className="text-[#ecbdc6] hover:text-white p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    aria-label="User profile"
                    role="menuitem"
                  >
                    <User size={24} />
                  </Link>
                  <Link
                    to="/cart"
                    className="text-[#ecbdc6] hover:text-white p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    aria-label="Shopping cart"
                    role="menuitem"
                  >
                    <ShoppingCart size={24} />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-[#F93827] hover:text-white p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F93827]"
                    role="menuitem"
                    aria-label="Sign out"
                  >
                    <LogOut size={24} />
                  </button>
                </>
              ) : (
                <>
                  {/* Logged out: Show Login and Cart icons */}
                  <Link
                    to="/auth/login"
                    className="text-[#ecbdc6] hover:text-white p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    aria-label="Log in"
                    role="menuitem"
                  >
                    <LogIn size={24} />
                  </Link>
                  <Link
                    to="/cart"
                    className="text-[#ecbdc6] hover:text-white p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    aria-label="Shopping cart"
                    role="menuitem"
                  >
                    <ShoppingCart size={24} />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-[#ecbdc6] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
            >
              {isMenuOpen ? (
                <X size={24} aria-hidden="true" />
              ) : (
                <Menu size={24} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Menu Panel */}
          <div
            ref={menuRef}
            id="mobile-menu"
            className={`md:hidden py-4 ${isMenuOpen ? "" : "hidden"}`}
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col space-y-4">
              {/* Navigation Links */}
              <Link
                to="/home"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                role="menuitem"
              >
                <span className="text-sm font-medium">Home</span>
              </Link>

              {/* Mobile Samples with submenu */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    const submenu = document.getElementById("samples-submenu");
                    if (submenu) {
                      submenu.classList.toggle("hidden");
                    }
                  }}
                  className="flex items-center justify-between w-full text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                  role="menuitem"
                >
                  <span className="text-sm font-medium">Samples</span>
                  <ChevronDown size={16} />
                </button>
                <div id="samples-submenu" className="hidden pl-4 space-y-1">
                  <Link
                    to="/samples/men"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    role="menuitem"
                  >
                    <span className="text-sm font-medium">Men</span>
                  </Link>
                  <Link
                    to="/samples/women"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    role="menuitem"
                  >
                    <span className="text-sm font-medium">Women</span>
                  </Link>
                  <Link
                    to="/samples"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    role="menuitem"
                  >
                    <span className="text-sm font-medium">View All</span>
                  </Link>
                </div>
              </div>

              {/* Mobile Perfumes with submenu */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    const submenu = document.getElementById("perfumes-submenu");
                    if (submenu) {
                      submenu.classList.toggle("hidden");
                    }
                  }}
                  className="flex items-center justify-between w-full text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                  role="menuitem"
                >
                  <span className="text-sm font-medium">Perfumes</span>
                  <ChevronDown size={16} />
                </button>
                <div id="perfumes-submenu" className="hidden pl-4 space-y-1">
                  <Link
                    to="/perfumes/men"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    role="menuitem"
                  >
                    <span className="text-sm font-medium">Men</span>
                  </Link>
                  <Link
                    to="/perfumes/women"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    role="menuitem"
                  >
                    <span className="text-sm font-medium">Women</span>
                  </Link>
                  <Link
                    to="/perfumes"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    role="menuitem"
                  >
                    <span className="text-sm font-medium">View All</span>
                  </Link>
                </div>
              </div>

              <div className="border-t border-gray-700 my-2"></div>

              {accessToken ? (
                <>
                  {/* Logged in: Show User, Cart, and Logout icons with labels */}
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    aria-label="User profile"
                    role="menuitem"
                  >
                    <User size={20} />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    aria-label="Shopping cart"
                    role="menuitem"
                  >
                    <ShoppingCart size={20} />
                    <span className="text-sm font-medium">Cart</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-[#F93827] hover:text-white px-3 py-2 rounded-md transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F93827]"
                    role="menuitem"
                    aria-label="Sign out"
                  >
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Logged out: Show Login and Cart icons with labels */}
                  <Link
                    to="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    aria-label="Log in"
                    role="menuitem"
                  >
                    <LogIn size={20} />
                    <span className="text-sm font-medium">Log In</span>
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-[#ecbdc6] hover:text-white px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C47F]"
                    aria-label="Shopping cart"
                    role="menuitem"
                  >
                    <ShoppingCart size={20} />
                    <span className="text-sm font-medium">Cart</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Search Popup */}
          {isSearchOpen && (
            <div
              ref={searchRef}
              className="absolute top-full left-0 right-0 w-full bg-black border border-[#f6d9d2] shadow-lg"
              style={{ position: "absolute", top: "100%" }}
            >
              <div className="p-4 pt-2">
                {/* Search input with close button */}
                <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                  <div className="flex items-center flex-1 bg-[#110000] rounded-md px-2 border border-gray-800">
                    <Search size={16} className="text-gray-400 mr-2" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      className="flex-1 bg-transparent border-none p-2 text-white focus:outline-none"
                      aria-label="Search input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className="text-gray-400 hover:text-white"
                        onClick={clearSearch}
                        aria-label="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={toggleSearch}
                    className="text-[#ecbdc6] hover:text-white p-2"
                    aria-label="Close search"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-6 h-6 border-2 border-t-[#ecbdc6] border-r-[#ecbdc6] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Search content with two columns - only show if we have results */}
                {!isLoading &&
                  (searchResults.suggestions.length > 0 ||
                    searchResults.pages.length > 0 ||
                    searchResults.products.length > 0) && (
                    <div className="flex mt-2">
                      {/* Left column - Suggestions */}
                      <div className="w-1/2 pr-6 border-r border-gray-800">
                        {searchResults.suggestions.length > 0 && (
                          <>
                            <h3 className="uppercase text-xs font-semibold text-gray-400 mb-3">
                              SUGGESTIONS
                            </h3>
                            <ul className="space-y-3">
                              {searchResults.suggestions.map(
                                (suggestion, index) => (
                                  <li key={`suggestion-${index}`}>
                                    <button
                                      className="w-full text-left text-[#ecbdc6] hover:text-white text-sm"
                                      onClick={() => setSearchQuery(suggestion)}
                                    >
                                      {suggestion}
                                    </button>
                                  </li>
                                )
                              )}
                            </ul>
                          </>
                        )}

                        {searchResults.pages.length > 0 && (
                          <>
                            <h3 className="uppercase text-xs font-semibold text-gray-400 mt-6 mb-3">
                              PAGES
                            </h3>
                            <ul className="space-y-3">
                              {searchResults.pages.map((page, index) => (
                                <li key={`page-${index}`}>
                                  <Link
                                    to={page.url}
                                    className="w-full text-left text-[#ecbdc6] hover:text-white text-sm block"
                                    onClick={() => setIsSearchOpen(false)}
                                  >
                                    {page.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}

                        {searchQuery && (
                          <div className="mt-6">
                            <Link
                              to={`/search?q=${encodeURIComponent(
                                searchQuery
                              )}`}
                              className="flex items-center text-[#ecbdc6] hover:text-white text-sm"
                              onClick={() => setIsSearchOpen(false)}
                            >
                              Search for "{searchQuery}"
                              <ChevronRight size={16} className="ml-2" />
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Right column - Products */}
                      {searchResults.products.length > 0 && (
                        <div className="w-1/2 pl-6">
                          <h3 className="uppercase text-xs font-semibold text-gray-400 mb-3">
                            PRODUCTS
                          </h3>
                          <ul className="space-y-4">
                            {searchResults.products.map((product, index) => (
                              <li key={`product-${index}`}>
                                <Link
                                  to={`/product/${product.slug}`}
                                  className="flex items-center group"
                                  onClick={() => setIsSearchOpen(false)}
                                >
                                  <div className="w-12 h-12 bg-[#110000] flex items-center justify-center mr-3 rounded overflow-hidden">
                                    {product.imageUrl ? (
                                      <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="max-h-10 max-w-10 object-contain"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-800 rounded"></div>
                                    )}
                                  </div>
                                  <span className="text-[#ecbdc6] group-hover:text-white text-sm">
                                    {product.name}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                {/* No results state */}
                {!isLoading &&
                  searchQuery &&
                  !searchResults.suggestions.length &&
                  !searchResults.pages.length &&
                  !searchResults.products.length && (
                    <div className="py-8 text-center text-gray-400">
                      No results found for "{searchQuery}"
                    </div>
                  )}

                {/* Initial state - when search is opened but no query yet */}
                {!isLoading && !searchQuery && (
                  <div className="py-8 text-center text-gray-400">
                    Type to search for products, collections, and pages
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
