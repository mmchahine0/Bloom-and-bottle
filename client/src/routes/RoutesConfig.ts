import SigninComponent from "../features/signin/Signin.component";
import SignupComponent from "../features/signup/Signup.component";
import Home from "../features/home/Home.component";
import UserProfile from "../features/userProfile/User.component";
import AdminDashboard from "@/features/admin/adminDashboard/AdminDashboard.component";
import MenPerfumesPage from "@/features/perfume/men/MenP.component";
import Cart from "@/features/cart/Cart.component";
import OrdersDashboard from "@/features/admin/adminOrders/adminOrders.component";

export interface RouteConfig {
  path: string;
  component: React.ComponentType<object>;
  layout?: "base" | "dashboard" | "auth";
  isProtected?: boolean;
  admin?: boolean;
}

// Routes that don't require authentication
export const publicRoutes: RouteConfig[] = [
  {
    path: "/auth/login",
    component: SigninComponent,
    layout: "auth",
  },
  {
    path: "/auth/signup",
    component: SignupComponent,
    layout: "auth",
  },
  {
    path: "/home",
    component: Home,
    layout: "base",
  },
  { path: "/about", component: MenPerfumesPage, layout: "base" },
  { path: "/perfumes", component: MenPerfumesPage, layout: "base" },
  { path: "/perfumes/men", component: MenPerfumesPage, layout: "base" },
  { path: "/perfumes/women", component: MenPerfumesPage, layout: "base" },
  { path: "/samples/men", component: MenPerfumesPage, layout: "base" },
  { path: "/samples/women", component: MenPerfumesPage, layout: "base" },
  { path: "/samples", component: MenPerfumesPage, layout: "base" },
];

// Routes that require user authentication
export const protectedRoutes: RouteConfig[] = [
  {
    path: "/dashboard/profile",
    component: UserProfile,
    layout: "dashboard",
    isProtected: true,
  },
  {
    path: "/dashboard/survey",
    component: MenPerfumesPage,
    layout: "base",
    isProtected: true,
  },
  {
    path: "/dashboard/cart",
    component: Cart,
    layout: "dashboard",
    isProtected: true,
  },
  {
    path: "/dashboard/orders",
    component: MenPerfumesPage,
    layout: "base",
    isProtected: true,
  },
  {
    path: "/dashboard/order/:id",
    component: MenPerfumesPage,
    layout: "base",
    isProtected: true,
  },
];

// Routes that require admin privileges
export const adminRoutes: RouteConfig[] = [
  {
    path: "/dashboard/admin/users",
    component: AdminDashboard,
    layout: "dashboard",
    admin: true,
  },
  {
    path: "/dashboard/admin/perfumes",
    component: MenPerfumesPage,
    layout: "dashboard",
  },
  {
    path: "/dashboard/admin/samples",
    component: MenPerfumesPage,
    layout: "dashboard",
  },
  {
    path: "/dashboard/admin/orders",
    component: OrdersDashboard,
    layout: "dashboard",
  },
];
