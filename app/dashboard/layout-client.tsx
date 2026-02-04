"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F5F5F4' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area - Account for floating sidebar */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all duration-300",
          isCollapsed ? "pl-24" : "pl-64"
        )}
      >
        {/* Page Content */}
        <main className="relative flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
