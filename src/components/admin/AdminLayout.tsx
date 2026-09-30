import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { SealLoader } from '../ui/SealLoader';
import { RouteTransition } from '../ui/RouteTransition';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-surface">
        <SealLoader size="lg" label="Authenticating Magallanes Admin…" />
      </div>
    );
  }

  // Protect Admin route: Redirect to login if unauthenticated
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <RouteTransition />
      <a
        href="#admin-main"
        className="sr-only rounded-md focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:bg-brand-800 focus:px-4 focus:py-2.5 focus:font-display focus:text-sm focus:font-semibold focus:text-white focus:shadow-raised"
      >
        Skip to main content
      </a>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
        <AdminTopbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main id="admin-main" className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
