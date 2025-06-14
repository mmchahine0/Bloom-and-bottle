import SigninComponent from "../features/signin/Signin.component";
import SignupComponent from "../features/signup/Signup.component";
import Home from "../features/home/Home.component";
import UserProfile from "../features/userProfile/User.component";
import AdminDashboard from "@/features/admin/adminDashboard/AdminDashboard.component";
import MenPerfumesPage from "@/features/perfume/men/MenP.component";
import MenSamplesPage from "@/features/sample/men/MenS.component"
import WomenPerfumesPage from "@/features/perfume/women/WomenP.component";
import WomenSamplesPage from "@/features/sample/women/WomenS.component"
import Perfumes from "@/features/perfume/Perfumes.component"
import Samples from "@/features/sample/Samples.component"
import Cart from "@/features/cart/Cart.component";
import OrdersDashboard from "@/features/admin/adminOrders/adminOrders.component";
import AdminProducts from "@/features/admin/adminProducts/adminProducts.component";
import CollectionsDashboard from "@/features/admin/adminCollection/adminCollection.component"
import Aboutus from "@/features/about/About.component"
import ProductDetail from "@/features/product/Product.component";
import Orders from "@/features/orders/Orders.component";

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
  { path: "/about", component: Aboutus, layout: "base" },
  { path: "/perfumes", component: Perfumes, layout: "base" },
  { path: "/perfumes/men", component: MenPerfumesPage, layout: "base" },
  { path: "/perfumes/women", component: WomenPerfumesPage, layout: "base" },
  { path: "/samples/men", component: MenSamplesPage, layout: "base" },
  { path: "/samples/women", component: WomenSamplesPage, layout: "base" },
  { path: "/samples", component: Samples, layout: "base" },
  { path: "/product/:id", component: ProductDetail, layout: "base" },
  { path: "/cart", component: Cart, layout: "base" },

  // {
  //   path: "/orders",
  //   component: GuestOrders, 
  //   layout: "base",
  // },

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
    component: Orders,
    layout: "dashboard",
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
    path: "/dashboard/admin/orders",
    component: OrdersDashboard,
    layout: "dashboard",
  },
  {
    path: "/dashboard/admin/products",
    component: AdminProducts,
    layout: "dashboard",
  },
  {
    path: "/dashboard/admin/homepage",
    component: CollectionsDashboard,
    layout: "dashboard",
  },
];
