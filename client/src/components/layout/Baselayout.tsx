import { Outlet } from "react-router-dom";
import Navbar from "../common/navbar/Navbar.component";
import Footer from "../common/footer/Footer.component";
import wts from "../../assets/whatsapp.png"
interface BaseLayoutProps {
  children?: React.ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar customLinks={[]} />
      <main className="flex-1">{children || <Outlet />}</main>
      <Footer content={{ links: [] }} />

      <a
        href="https://wa.me/96176913342"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50"
      >
        <img
          src={wts} 
          alt="WhatsApp Chat"
          className="w-16 h-16 rounded-full shadow-lg hover:scale-105 transition-transform"
        />
      </a>
    </div>
  );
}
