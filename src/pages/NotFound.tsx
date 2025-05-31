
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Layout from '@/components/Layout';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center section">
        <div className="text-center max-w-md">
          <h1 className="text-6xl md:text-8xl font-bold mb-4">404</h1>
          <p className="text-xl text-light/70 mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link to="/" className="px-6 py-3 bg-highlight text-dark font-medium rounded hover:opacity-90 transition-opacity inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
