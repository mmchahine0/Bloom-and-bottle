import { Outlet } from "react-router-dom";
import Navbar from "../common/navbar/Navbar.component";
import Footer from "../common/footer/Footer.component";

interface BaseLayoutProps {
  children?: React.ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar customLinks={[]} />
      <main className="flex-1">{children || <Outlet />}</main>
      <Footer content={{ links: [] }} />
    </div>
  );
}
