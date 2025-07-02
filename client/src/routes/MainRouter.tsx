import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NotFound from "@/features/notFound/notFound";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminProtectedRoutes";
import {
  publicRoutes,
  protectedRoutes,
  adminRoutes,
  RouteConfig,
} from "./RoutesConfig";
import { DashboardLayout } from "../components/layout/Dashboardlayout";
import { BaseLayout } from "../components/layout/Baselayout";
import { AuthLayout } from "../components/layout/Authlayout";

// Layout mapping object
const layoutComponents = {
  base: BaseLayout,
  dashboard: DashboardLayout,
  auth: AuthLayout,
};

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

const MainRouter: React.FC = () => {
  // For static routes
  const renderRoute = (route: RouteConfig) => {
    const Component = route.component;
    let element = <Component />;
    // Apply protection
    if (route.admin == true) {
      element = <AdminRoute>{element}</AdminRoute>;
    } else if (route.isProtected == true) {
      element = <ProtectedRoute>{element}</ProtectedRoute>;
    }
    // Apply layout if specified
    if (route.layout) {
      const LayoutComponent = layoutComponents[route.layout];
      if (LayoutComponent) {
        element = <LayoutComponent>{element}</LayoutComponent>;
      }
    }

    return <Route key={route.path} path={route.path} element={element} />;
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map(renderRoute)}

        {/* Protected Routes */}
        {protectedRoutes.map(renderRoute)}

        {/* Admin Routes */}
        {adminRoutes.map(renderRoute)}

        {/* Redirect root to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainRouter;
