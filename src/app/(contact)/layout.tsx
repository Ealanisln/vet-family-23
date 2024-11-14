import React, { ReactNode } from "react";
import BlogNavbar from "../../components/BlogNavbar";

interface CustomLayoutProps {
  children: ReactNode;
}

export default function CustomLayout({ children }: CustomLayoutProps) {
  return (
    <>
      <BlogNavbar />
      <div className="flex-grow">
        <main className="my-2 py-2">{children}</main>
      </div>
    </>
  );
}
