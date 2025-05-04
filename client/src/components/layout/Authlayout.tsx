import { Outlet } from "react-router-dom";
import Navbar from "../common/navbar/Navbar.component";
import Footer from "../common/footer/Footer.component";

interface AuthlayoutProps {
  children?: React.ReactNode;
}

export function AuthLayout({ children }: AuthlayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar customLinks={[]} />
      <main className="flex-1 flex">{children || <Outlet />}</main>
      <Footer content={{ links: [] }} />
    </div>
  );
}
