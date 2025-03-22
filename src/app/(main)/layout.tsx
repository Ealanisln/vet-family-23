import Footer from "../../components/Footer/index";
import { ReactNode } from "react";
import MainNav from "@/components/New-Navbar";

interface CustomLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: CustomLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <div className="flex-1 pt-24">
        {/* Banner placed here, after the nav but before main content */}
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}