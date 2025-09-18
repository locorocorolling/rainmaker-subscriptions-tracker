import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Bell,
  Settings,
  Plus,
  User,
  LogOut
} from "lucide-react";
import { useState } from "react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    exact: true
  },
  {
    name: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
    exact: false
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
    exact: false,
    placeholder: true
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    exact: false,
    placeholder: true
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    exact: false,
    placeholder: true
  }
];

const mobileNavigationItems = [
  {
    name: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard
  },
  {
    name: "Add",
    href: "#",
    icon: Plus,
    isAction: true
  },
  {
    name: "Profile",
    href: "#",
    icon: User,
    isMenu: true
  }
];

interface NavigationProps {
  onAddSubscription?: () => void;
}

export function DesktopNavigation({ onAddSubscription }: NavigationProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (item: typeof navigationItems[0]) => {
    if (item.exact) {
      return location.pathname === item.href;
    }
    return location.pathname.startsWith(item.href);
  };

  return (
    <div className="hidden md:flex w-64 h-screen bg-background flex-col sticky top-0">
      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          if (item.placeholder) {
            return (
              <div
                key={item.name}
                className="flex items-center justify-between px-3 py-2 text-muted-foreground cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Button
              key={item.name}
              variant={active ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start gap-3 h-auto py-2 px-3",
                active && "bg-secondary"
              )}
              asChild
            >
              <Link to={item.href}>
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.name}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* User Section */}
      {user && (
        <div className="mt-auto border-t border-border/10 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}

export function MobileNavigation({ onAddSubscription }: NavigationProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleAddClick = () => {
    if (onAddSubscription) {
      onAddSubscription();
    }
  };

  return (
    <>
      {/* Profile Menu Overlay */}
      {showProfileMenu && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowProfileMenu(false)}
        >
          <Card className="absolute bottom-20 right-4 min-w-48 shadow-lg">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border/10">
                <p className="font-medium">{user?.name || "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-3"
                  asChild
                >
                  <Link to="/" onClick={() => setShowProfileMenu(false)}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
                <div className="flex items-center justify-between px-3 py-2 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    Soon
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm">Analytics</span>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    Soon
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    <span className="text-sm">Notifications</span>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    Soon
                  </span>
                </div>
              </div>
              <div className="p-2 border-t border-border/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border/10 z-30">
        <div className="flex items-center justify-around py-2">
          {mobileNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href ||
              (item.href === "/subscriptions" && location.pathname.startsWith("/subscriptions"));

            if (item.isAction) {
              return (
                <button
                  key={item.name}
                  onClick={handleAddClick}
                  className="flex flex-col items-center gap-1 px-3 py-2"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-xs text-primary font-medium">{item.name}</span>
                </button>
              );
            }

            if (item.isMenu) {
              return (
                <button
                  key={item.name}
                  onClick={handleProfileClick}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2",
                    showProfileMenu ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}