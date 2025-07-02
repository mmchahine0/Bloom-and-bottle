import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const NotFound: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Blooms and bottle</title>
        <meta
          name="description"
          content="The page you're looking for cannot be found."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <main className="min-h-screen bg-[#2c2c2c] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <p className="text-xl text-white mb-8">Page not found</p>
          <div className="space-y-4">
            <p className="text-white">Here are some helpful links:</p>
            <nav className="space-x-4">
              <Link to="/home" className="text-white hover:underline">
                Home
              </Link>
              <Link to="/about" className="text-white hover:underline">
                About Us
              </Link>
            </nav>
          </div>
        </div>
      </main>
    </>
  );
};

export default NotFound;
