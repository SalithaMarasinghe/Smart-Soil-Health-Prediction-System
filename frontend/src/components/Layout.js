import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Sprout, Droplets, BarChart3, LogOut, Droplet, Beaker, Activity, Menu, X, MessageSquare } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import AIChatPanel from "./AIChatPanel";

export const Layout = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/npk", icon: Sprout, label: "NPK" },
    { path: "/irrigation", icon: Droplet, label: "Irrigation" },
    { path: "/ph-management", icon: Beaker, label: "pH" },
    { path: "/waterlogging", icon: Droplets, label: "Water" },
    { path: "/history", icon: BarChart3, label: "History" },
    { path: "/analytics", icon: Activity, label: "Analytics" },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Sidebar Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Toggle navigation"
              >
                <Menu className="w-6 h-6 text-foreground" />
              </button>

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
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {/* AI Assistant Toggle Button */}
                <button
                  onClick={toggleChat}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${isChatOpen
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  aria-label="Toggle AI Assistant"
                >
                  <MessageSquare className="w-4 h-4" strokeWidth={2} />
                  <span className="text-xs font-bold tracking-wider">ASK AI</span>
                </button>

                <ThemeToggle />
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Slide-in Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-[70] shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="font-manrope font-bold text-lg text-foreground">Navigation</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              v1.0.0 &bull; Sri Lanka Agricultural Tech
            </p>
          </div>
        </div>
      </aside>

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (Optional: Keep or Remove?) */}
      {/* Keeping it for mobile convenience as requested "everything should work accordingly" 
          but usually sidebars replace this. I'll leave it for now or hide it if it overlaps. */}
    </div>
  );
};

export default Layout;
