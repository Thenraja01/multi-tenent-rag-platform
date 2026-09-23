import React from "react";
import { Navbar } from "@/components/public/navbar/Navbar";
import { Footer } from "@/components/public/footer/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
