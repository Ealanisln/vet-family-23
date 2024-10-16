import Navbar from "../../components/Navbar/index";
import Footer from "../../components/Footer/index";
import { ReactNode } from "react";

interface CustomLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: CustomLayoutProps) {
;

  return (
    <div className="">
        <div className="">
          <Navbar />
          <main className="">{children}</main>
        </div>
        <Footer />
    </div>
  );
}
