"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { TopNavigation } from "./top-navigation";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { MobileNavigation } from "./mobile-navigation";
import type { ViewType, BonkData } from "../dashboard/page";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  bonkData: BonkData;
  onStartTour?: () => void;
}

export function ResponsiveLayout({
  children,
  currentView,
  setCurrentView,
  isDarkMode,
  setIsDarkMode,
  bonkData,
  onStartTour,
}: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Safe fallback for optional onStartTour
  const handleStartTour: () => void = onStartTour ?? (() => {});

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mql.matches);
    update();

    // Support old Safari
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener?.(update);

    window.addEventListener("resize", update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener?.(update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // MOBILE LAYOUT
  if (isMobile) {
    return (
      <div className="min-h-[100svh] flex flex-col bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <TopNavigation
          currentView={currentView}
          setCurrentView={setCurrentView}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          bonkData={bonkData}
          onStartTour={handleStartTour}
        />

        {/* Keep space for the fixed MobileNavigation bar */}
        <main
          className="flex-1 pt-2"
          style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
        >
          {children}
        </main>

        <MobileNavigation currentView={currentView} setCurrentView={setCurrentView} />
      </div>
    );
  }

  // DESKTOP / LARGE LAYOUT
  return (
    <SidebarProvider>
      <div className="min-h-[100svh] flex w-full bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <AppSidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          bonkData={bonkData}
          onStartTour={handleStartTour}
        />
        <SidebarInset className="flex min-h-[100svh] flex-1 flex-col">
          <TopNavigation
            currentView={currentView}
            setCurrentView={setCurrentView}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            bonkData={bonkData}
            onStartTour={handleStartTour}
          />
          <main className="flex-1 p-4 sm:p-6 overflow-x-hidden" id="dashboard-content">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default ResponsiveLayout;
