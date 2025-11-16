import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Home,
  DollarSign,
  FileText,
  Receipt,
  Bell,
  Megaphone,
  LayoutDashboard,
  LogOut,
  UserCircle,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '../components/ui/sidebar';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { useAuthStore } from '../store/auth-store';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { table } from '@devvai/devv-code-backend';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const response = await table.getItems('f26wla7m4wld', { limit: 100 });
      const notifications = (response.items || []) as any[];
      const unread = notifications.filter(
        n => n.user_id === user.uid && n.is_read === 'false'
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
        roles: ['admin', 'manager', 'resident'],
      },
    ];

    const adminManagerItems = [
      {
        title: 'Buildings',
        icon: Building2,
        path: '/buildings',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Building Managers',
        icon: Users,
        path: '/managers',
        roles: ['admin'],
      },
      {
        title: 'Units',
        icon: Home,
        path: '/units',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Unit Residents',
        icon: UserCircle,
        path: '/residents',
        roles: ['admin', 'manager'],
      },
    ];

    const financialItems = [
      {
        title: 'Building Costs',
        icon: DollarSign,
        path: '/costs',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Bills',
        icon: FileText,
        path: '/bills',
        roles: ['admin', 'manager', 'resident'],
      },
      {
        title: 'Building Charges',
        icon: Receipt,
        path: '/charges',
        roles: ['admin', 'manager'],
      },
    ];

    const communicationItems = [
      {
        title: 'Announcements',
        icon: Megaphone,
        path: '/announcements',
        roles: ['admin', 'manager', 'resident'],
      },
      {
        title: 'Notifications',
        icon: Bell,
        path: '/notifications',
        roles: ['admin', 'manager', 'resident'],
      },
    ];

    return [
      { label: 'Overview', items: baseItems },
      { label: 'Property Management', items: adminManagerItems },
      { label: 'Financial', items: financialItems },
      { label: 'Communication', items: communicationItems },
    ];
  };

  const menuSections = getMenuItems();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resident':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return '';
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-sm">BuildingHub</h2>
              <p className="text-xs text-muted-foreground">Property Management</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {menuSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => user && item.roles.includes(user.role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <SidebarGroup key={section.label}>
                <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild>
                          <a href={item.path}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <UserCircle className="w-5 h-5" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
                <Badge variant="secondary" className={getRoleBadgeColor(user?.role || '')}>
                  {user?.role}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
    
  );
}
