// import Navbar from "../../components/Navbar/index";
import Footer from "../../components/Footer/index";
import { ReactNode } from "react";
import  MainNav  from "@/components/New-Navbar";

interface CustomLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: CustomLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <MainNav />
      <main className="flex-1 pt-24">{children}</main>
      <Footer />
    </div>
  );
}
