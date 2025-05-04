import SigninComponent from "../features/signin/Signin.component";
import SignupComponent from "../features/signup/Signup.component";
import Home from "../features/home/Home.component";
import UserProfile from "../features/userProfile/User.component";
import AdminDashboard from "@/features/admin/adminDashboard/AdminDashboard.component";

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
];

// Routes that require user authentication
export const protectedRoutes: RouteConfig[] = [
  {
    path: "/dashboard/profile",
    component: UserProfile,
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
];
