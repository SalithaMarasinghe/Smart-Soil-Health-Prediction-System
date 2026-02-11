import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Sprout, Droplets, BarChart3, LogOut, Droplet, Beaker } from "lucide-react";

export const Layout = ({ onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/npk", icon: Sprout, label: "NPK" },
    { path: "/irrigation", icon: Droplet, label: "Irrigation" },
    { path: "/ph-management", icon: Beaker, label: "pH" },
    { path: "/waterlogging", icon: Droplets, label: "Water" },
    { path: "/history", icon: BarChart3, label: "History" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="font-manrope font-bold text-xl md:text-2xl text-foreground tracking-tight">
                  Smart Soil Monitor
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Agricultural Intelligence System</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
                  }`}
              >
                <Icon className="w-5 h-5 mb-1" strokeWidth={2} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
