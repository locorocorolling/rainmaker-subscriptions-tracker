import { type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DesktopNavigation, MobileNavigation } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
  onAddSubscription?: () => void;
}

export function Layout({ children, onAddSubscription }: LayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <DesktopNavigation onAddSubscription={onAddSubscription} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation onAddSubscription={onAddSubscription} />
    </div>
  );
}