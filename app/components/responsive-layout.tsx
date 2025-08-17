// app/components/responsive-layout.tsx
"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { TopNavigation } from "./top-navigation";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { MobileNavigation } from "./mobile-navigation";

// ✅ Keep ViewType from page…
import type { ViewType } from "../dashboard/page";
// ✅ …but import BonkData from the context (not from page)
import type { BonkData } from "../context/bonk-context";

export interface ResponsiveLayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>> | ((v: ViewType) => void);
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  bonkData: BonkData;
  onStartTour?: () => void;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  currentView,
  setCurrentView,
  isDarkMode,
  setIsDarkMode,
  bonkData,
  onStartTour,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Normalize setCurrentView to a simple (ViewType) => void for child props
  const forwardSetCurrentView = useCallback(
    (v: ViewType) => {
      // both React.Dispatch<SetStateAction<ViewType>> and (v: ViewType) => void
      // are callable with a ViewType argument
      (setCurrentView as (v: ViewType) => void)(v);
    },
    [setCurrentView]
  );

  // Safe callable wrapper for optional onStartTour
  const handleStartTour = useCallback(() => {
    onStartTour?.();
  }, [onStartTour]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mql.matches);
    update();

    // Safari fallback for older versions
    if ("addEventListener" in mql) {
      mql.addEventListener("change", update);
    } else {
      // @ts-expect-error legacy Safari
      mql.addListener(update);
    }

    return () => {
      if ("removeEventListener" in mql) {
        mql.removeEventListener("change", update);
      } else {
        // @ts-expect-error legacy Safari
        mql.removeListener(update);
      }
    };
  }, []);

  // MOBILE LAYOUT
  if (isMobile) {
    return (
      <div className="min-h-[100svh] flex flex-col bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <TopNavigation
          currentView={currentView}
          setCurrentView={forwardSetCurrentView}
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

        <MobileNavigation currentView={currentView} setCurrentView={forwardSetCurrentView} />
      </div>
    );
  }

  // DESKTOP / LARGE LAYOUT
  return (
    <SidebarProvider>
      <div className="min-h-[100svh] flex w-full bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <AppSidebar
          currentView={currentView}
          setCurrentView={forwardSetCurrentView}
          bonkData={bonkData}
          onStartTour={handleStartTour}
        />
        <SidebarInset className="flex min-h-[100svh] flex-1 flex-col">
          <TopNavigation
            currentView={currentView}
            setCurrentView={forwardSetCurrentView}
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
};

export default ResponsiveLayout;
