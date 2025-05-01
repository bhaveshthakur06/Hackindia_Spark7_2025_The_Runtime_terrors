import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { SidebarProvider } from './ui/sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  
  // If no user is logged in, don't render the sidebar
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }
  
  // Otherwise, render the complete layout with sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
