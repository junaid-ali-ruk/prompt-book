import type { ReactNode } from "react";

import Navbar from "@/components/Navbar";

interface PageLayoutProps {
  children: ReactNode;
  hero?: ReactNode;
}

export default function PageLayout({ children, hero }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="grid-texture fixed inset-0 pointer-events-none" />
      <Navbar />
      {hero}
      <main className="relative mx-auto max-w-7xl px-6 pb-20 pt-24">{children}</main>
    </div>
  );
}

