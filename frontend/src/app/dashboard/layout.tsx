"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Building2, LayoutDashboard, DoorOpen, Users, FileText,
  CreditCard, Calendar, Receipt, TrendingUp, BookOpen,
  PenLine, Scale, BarChart3, Target, ArrowDownToLine,
  ArrowUpToLine, RefreshCw, Percent, CalendarRange, UserCog,
  PanelLeftClose, Search, Bell, Moon, Sun, ChevronDown, 
  Menu, X, LogOut, User, Settings as SettingsIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useTheme } from "@/context/theme-context";
import { useLanguage } from "@/context/language-context";

const NAVIGATION = [
  {
    label: "MAIN",
    items: [
      { id: "dashboard", href: "/dashboard", icon: LayoutDashboard },
      { id: "properties", href: "/dashboard/properties", icon: Building2 },
      { id: "units", href: "/dashboard/units", icon: DoorOpen },
      { id: "tenants", href: "/dashboard/tenants", icon: Users },
    ]
  },
  {
    label: "OPERATIONS",
    items: [
      { id: "leases", href: "/dashboard/contracts", icon: FileText },
      { id: "payments", href: "/dashboard/payments", icon: CreditCard },
      { id: "installments", href: "/dashboard/installments", icon: Calendar },
      { id: "receipts", href: "/dashboard/receipts", icon: Receipt },
    ]
  },
  {
    label: "FINANCE",
    items: [
      { id: "finance", href: "/dashboard/finance", icon: TrendingUp },
      { id: "chart_of_accounts", href: "/dashboard/finance/chart-of-accounts", icon: BookOpen },
      { id: "journal_entries", href: "/dashboard/finance/journal-entries", icon: PenLine },
      { id: "trial_balance", href: "/dashboard/finance/trial-balance", icon: Scale },
      { 
        id: "reports", 
        href: "#", 
        icon: BarChart3,
        submenu: [
          { id: "income_statement", href: "/dashboard/finance/reports/income-statement" },
          { id: "balance_sheet", href: "/dashboard/finance/reports/balance-sheet" },
          { id: "cash_flow", href: "/dashboard/finance/reports/cash-flow" },
          { id: "ar_aging", href: "/dashboard/finance/reports/ar-aging" },
        ]
      },
      { id: "budgets", href: "/dashboard/finance/budgets", icon: Target },
      { id: "ar", href: "/dashboard/finance/ar", icon: ArrowDownToLine },
      { id: "ap", href: "/dashboard/finance/ap", icon: ArrowUpToLine },
      { id: "reconciliation", href: "/dashboard/finance/reconciliation", icon: RefreshCw },
    ]
  },
  {
    label: "SETTINGS",
    items: [
      { id: "tax_rates", href: "/dashboard/finance/tax/rates", icon: Percent },
      { id: "fiscal_periods", href: "/dashboard/settings/fiscal-periods", icon: CalendarRange },
      { id: "users", href: "/dashboard/users", icon: UserCog },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, dir, t } = useLanguage();
  const isFinanceSubApp = pathname.includes("/finance");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [reportsOpen, setReportsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const handleKeyDown = (e: KeyboardEvent) => {
       if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          alert("Command Palette coming soon!");
       }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className={cn(
      "flex flex-col h-full border-r border-neutral-200 dark:border-neutral-800 transition-colors duration-500 bg-white dark:bg-neutral-900"
    )}>
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-50 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <Building2 className="w-5 h-5 text-primary-500" />
          </div>
          {!isCollapsed && (
            <h4 className="text-lg font-black tracking-tighter text-neutral-900 dark:text-neutral-50">
              RentFlow
            </h4>
          )}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors hidden lg:block"
        >
          <PanelLeftClose className={cn("w-5 h-5 transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>

      {/* Search area */}
      {!isCollapsed && (
        <div className="px-4 py-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              readOnly
              placeholder="Search..." 
              className="w-full h-9 pl-10 pr-12 bg-neutral-100 dark:bg-neutral-800 border-none rounded-md text-sm cursor-pointer outline-none focus:ring-1 focus:ring-primary-500 transition-all"
              onClick={() => alert("Command Palette coming soon!")}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[10px] text-neutral-400">
               <span>⌘</span><span>K</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {NAVIGATION.map((section) => (
          <div key={section.label} className="space-y-1">
            {!isCollapsed && (
              <h5 className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                {section.label}
              </h5>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const isReports = item.id === "reports";
              const label = t(item.id);
              
              return (
                <div key={item.id} className="space-y-1">
                  <Link
                    href={isReports ? "#" : item.href}
                    onClick={(e) => {
                      if (isReports) {
                        e.preventDefault();
                        setReportsOpen(!reportsOpen);
                      } else {
                        setIsMobileOpen(false);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group relative",
                      isActive
                        ? "bg-primary-50 text-primary-600 border-r-2 border-primary-500 rounded-r-none"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-primary-500" : "text-neutral-400 group-hover:text-neutral-600")} />
                    {!isCollapsed && (
                      <span className="flex-1 flex items-center justify-between">
                        {label}
                        {isReports && <ChevronDown className={cn("w-4 h-4 transition-transform", reportsOpen && "rotate-180")} />}
                      </span>
                    )}
                    {isCollapsed && isActive && (
                       <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary-500" />
                    )}
                  </Link>

                  {isReports && reportsOpen && !isCollapsed && (
                    <div className="ml-9 space-y-1">
                      {item.submenu?.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className={cn(
                            "block px-3 py-2 text-xs rounded-md transition-all",
                            isFinanceSubApp ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-neutral-500 hover:text-primary-600 hover:bg-primary-50/50"
                          )}
                        >
                          {t(sub.id)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Area */}
      <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-800 cursor-pointer transition-all">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-neutral-900 dark:text-neutral-50">{user?.firstName} {user?.lastName}</p>
                  <Badge variant="neutral" size="sm" className="mt-0.5 pointer-events-none">
                    {user?.role === 'ADMIN' ? 'Owner' : 'Manager'}
                  </Badge>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 ml-4">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" /> <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              <SettingsIcon className="mr-2 h-4 w-4" /> <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-danger focus:text-danger">
              <LogOut className="mr-2 h-4 w-4" /> <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen flex transition-all duration-500 bg-neutral-50 dark:bg-dark-bg" dir={dir}>
      <MobileNav />
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "hidden lg:block h-screen sticky top-0 transition-all duration-300 ease-in-out z-50",
        isCollapsed ? "w-20" : "w-[240px]"
      )}>
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-[240px]">
          <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
          <SheetDescription className="sr-only">Access all dashboard sections from here.</SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-neutral-600" 
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="hover:text-primary-500 cursor-pointer">Home</span>
              <span>/</span>
              <span className="hover:text-primary-500 cursor-pointer capitalize">
                 {pathname.split('/')[2] || "Dashboard"}
              </span>
              {pathname.split('/').length > 3 && (
                <>
                  <span>/</span>
                  <span className="text-neutral-900 dark:text-neutral-50 font-medium">Unit 4B</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Fiscal Period Indicator */}
            <div className="hidden sm:flex items-center px-3 py-1.5 bg-accent-50 dark:bg-accent-900/20 border border-accent-400/20 rounded-full">
               <CalendarRange className="w-3.5 h-3.5 text-accent-500 mr-2" />
               <span className="text-[10px] font-bold text-accent-600 uppercase tracking-wider">Jan 2025 — OPEN</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className="p-2 text-neutral-400 hover:text-primary-500 transition-colors"
                onClick={toggleTheme}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </button>
              <button 
                className="px-2 py-1 text-[10px] font-black border border-neutral-200 dark:border-neutral-800 rounded uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              >
                {language === 'ar' ? 'EN' : 'AR'}
              </button>
            </div>

            <div className="h-8 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1 hidden lg:block" />
            
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-[11px] font-bold text-primary-600">
               {user?.firstName?.[0]}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden pb-24 lg:pb-6">
          <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
