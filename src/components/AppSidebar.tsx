
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from './ui/sidebar';
import { cn } from '@/lib/utils';
import { 
  Home, Users, Package, Calendar, BarChart2, 
  ShoppingCart, FileText, Settings, LogOut,
  PlusSquare, Truck, FileSearch, User
} from 'lucide-react';

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Define menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      { title: 'Dashboard', path: '/dashboard', icon: Home },
    ];

    const adminItems = [
      { title: 'Beneficiaries', path: '/beneficiaries', icon: Users },
      { title: 'Distributors', path: '/distributors', icon: Truck },
      { title: 'Inventory', path: '/inventory', icon: Package },
      { title: 'Distributions', path: '/distributions', icon: ShoppingCart },
      { title: 'Reports', path: '/reports', icon: FileText },
      { title: 'Settings', path: '/settings', icon: Settings },
    ];

    const distributorItems = [
      { title: 'My Inventory', path: '/inventory', icon: Package },
      { title: 'Schedule Distribution', path: '/schedule', icon: Calendar },
      { title: 'My Distributions', path: '/distributions', icon: ShoppingCart },
      { title: 'Reports', path: '/reports', icon: FileText },
    ];

    const beneficiaryItems = [
      { title: 'My Profile', path: '/profile', icon: User },
      { title: 'My Allocations', path: '/allocations', icon: PlusSquare },
      { title: 'Distribution History', path: '/history', icon: FileSearch },
    ];

    if (!user) return commonItems;

    switch (user.role) {
      case 'admin':
        return [...commonItems, ...adminItems];
      case 'distributor':
        return [...commonItems, ...distributorItems];
      case 'beneficiary':
        return [...commonItems, ...beneficiaryItems];
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className={cn(
      "border-r border-sidebar-border transition-all duration-300 ease-in-out",
      isMobile ? "w-[70px]" : "w-[240px]"
    )}>
      <div className={cn(
        "flex items-center p-4 h-16", 
        isMobile ? "justify-center" : "justify-start"
      )}>
        {isMobile ? (
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            G
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="ml-2 text-xl font-bold">GrainLink</span>
          </div>
        )}
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(isMobile && "sr-only")}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1 px-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    asChild
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                      isMobile && "justify-center px-0"
                    )}
                  >
                    <Link to={item.path}>
                      <item.icon className={cn(
                        "h-5 w-5",
                        isMobile ? "mr-0" : "mr-2"
                      )} />
                      {!isMobile && <span>{item.title}</span>}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
