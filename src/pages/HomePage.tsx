import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Target,
  Calculator,
  Trophy,
  Menu,
  X,
  Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
const queryClient = new QueryClient();
const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/shooters", label: "Shooters", icon: Users },
  { to: "/stages", label: "Stages", icon: Target },
  { to: "/scoring", label: "Scoring", icon: Calculator, disabled: false },
  { to: "/results", label: "Results", icon: Trophy, disabled: false },
];
function SidebarContent() {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-6">
        <Crosshair className="h-8 w-8 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Apex Scorer
        </h1>
      </div>
      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-400 transition-all hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                isActive && "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold",
                item.disabled && "opacity-50 cursor-not-allowed"
              )
            }
            onClick={(e) => item.disabled && e.preventDefault()}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <footer className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Built with ❤��� at Cloudflare</p>
      </footer>
    </>
  );
}
export function HomePage() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
            <SidebarContent />
          </aside>
        )}
        {/* Mobile Menu */}
        {isMobile && (
          <>
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/60 z-40"
                  onClick={() => setMobileMenuOpen(false)}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-950 z-50 flex flex-col"
                >
                  <SidebarContent />
                </motion.aside>
              )}
            </AnimatePresence>
          </>
        )}
        <div className="flex flex-1 flex-col">
          {isMobile && (
            <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-950 px-4 lg:h-[60px] lg:px-6">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
              <div className="flex items-center gap-2 font-semibold">
                <Crosshair className="h-6 w-6 text-blue-500" />
                <span>Apex Scorer</span>
              </div>
            </header>
          )}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
      <Toaster richColors closeButton />
    </QueryClientProvider>
  );
}