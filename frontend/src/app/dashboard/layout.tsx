"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Building2, LayoutDashboard, DoorOpen, Users, FileText,
  CreditCard, Calendar, Receipt, TrendingUp, BookOpen,
  PenLine, Scale, BarChart3, Target, ArrowDownToLine,
  ArrowUpToLine, RefreshCw, CalendarRange, UserCog,
  PanelLeftClose, Bell, Moon, Sun, ChevronDown, Wallet,
  Menu, LogOut, User, Settings as SettingsIcon, ChevronRight,
  FileBarChart, X
} from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/lib/utils";

/* ─── Route labels ─────────────────────────────────────── */
const LABELS: Record<string, { ar: string; en: string }> = {
  dashboard:            { ar: "الرئيسية",          en: "Dashboard"         },
  properties:           { ar: "العقارات",           en: "Properties"        },
  units:                { ar: "الوحدات",            en: "Units"             },
  tenants:              { ar: "المستأجرين",         en: "Tenants"           },
  contracts:            { ar: "العقود",             en: "Contracts"         },
  payments:             { ar: "المدفوعات",          en: "Payments"          },
  installments:         { ar: "الأقساط",            en: "Installments"      },
  receipts:             { ar: "السندات",            en: "Receipts"          },
  finance:              { ar: "النظام المالي",      en: "Finance"           },
  "chart-of-accounts":  { ar: "دليل الحسابات",     en: "Chart of Accounts" },
  "journal-entries":    { ar: "قيود اليومية",       en: "Journal Entries"   },
  "trial-balance":      { ar: "ميزان المراجعة",     en: "Trial Balance"     },
  reports:              { ar: "التقارير",            en: "Reports"           },
  budgets:              { ar: "الميزانيات",          en: "Budgets"           },
  "accounts-receivable":{ ar: "حسابات القبض",       en: "Accounts Receivable"},
  "accounts-payable":   { ar: "حسابات الدفع",       en: "Accounts Payable"  },
  reconciliation:       { ar: "التسويات البنكية",   en: "Reconciliation"    },
  "fiscal-periods":     { ar: "الفترات المالية",    en: "Fiscal Periods"    },
  "income-statement":   { ar: "قائمة الدخل",        en: "Income Statement"  },
  "balance-sheet":      { ar: "الميزانية العمومية", en: "Balance Sheet"     },
  "cash-flow":          { ar: "التدفق النقدي",      en: "Cash Flow"         },
  "ar-aging":           { ar: "أعمار الديون",       en: "AR Aging"          },
  settings:             { ar: "الإعدادات",           en: "Settings"          },
  users:                { ar: "المستخدمون",          en: "Users"             },
  profile:              { ar: "الملف الشخصي",       en: "Profile"           },
  "audit-logs":         { ar: "سجل المراجعة",       en: "Audit Logs"        },
  tax:                  { ar: "الضرائب",             en: "Tax"               },
  new:                  { ar: "جديد",               en: "New"               },
};

function label(seg: string, lang: "ar" | "en") {
  return LABELS[seg]?.[lang] ?? seg.replace(/-/g, " ");
}

/* ─── Nav structure ─────────────────────────────────────── */
const NAV = [
  {
    group: { ar: "الرئيسي", en: "Main" },
    items: [
      { id: "dashboard",    href: "/dashboard",            icon: LayoutDashboard },
      { id: "properties",   href: "/dashboard/properties", icon: Building2       },
      { id: "units",        href: "/dashboard/units",      icon: DoorOpen        },
      { id: "tenants",      href: "/dashboard/tenants",    icon: Users           },
    ],
  },
  {
    group: { ar: "العمليات", en: "Operations" },
    items: [
      { id: "contracts",    href: "/dashboard/contracts",    icon: FileText   },
      { id: "payments",     href: "/dashboard/payments",     icon: CreditCard },
      { id: "installments", href: "/dashboard/installments", icon: Calendar   },
      { id: "receipts",     href: "/dashboard/receipts",     icon: Receipt    },
    ],
  },
];

const FINANCE_CHILDREN = [
  { id: "chart_of_accounts", href: "/dashboard/finance/chart-of-accounts",   icon: BookOpen        },
  { id: "journal_entries",   href: "/dashboard/finance/journal-entries",      icon: PenLine         },
  { id: "trial_balance",     href: "/dashboard/finance/trial-balance",        icon: Scale           },
  { id: "budgets",           href: "/dashboard/finance/budgets",              icon: Wallet          },
  { id: "ar",                href: "/dashboard/finance/accounts-receivable",  icon: ArrowDownToLine },
  { id: "ap",                href: "/dashboard/finance/accounts-payable/vendors", icon: ArrowUpToLine },
  { id: "reconciliation",    href: "/dashboard/finance/reconciliation",       icon: RefreshCw       },
  { id: "fiscal_periods",    href: "/dashboard/finance/fiscal-periods",       icon: CalendarRange   },
];

const FINANCE_REPORTS = [
  { id: "income_statement", href: "/dashboard/finance/reports/income-statement" },
  { id: "balance_sheet",    href: "/dashboard/finance/reports/balance-sheet"    },
  { id: "cash_flow",        href: "/dashboard/finance/reports/cash-flow"        },
  { id: "ar_aging",         href: "/dashboard/finance/reports/ar-aging"         },
];

const SYSTEM_NAV = [
  { id: "reports",    href: "/dashboard/reports",    icon: BarChart3   },
  { id: "users",      href: "/dashboard/users",      icon: UserCog     },
  { id: "settings",   href: "/dashboard/settings",   icon: SettingsIcon},
  { id: "audit-logs", href: "/dashboard/audit-logs", icon: FileBarChart},
];

/* ─── Component ─────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, dir, t } = useLanguage();
  const lang = language as "ar" | "en";

  const [collapsed,     setCollapsed]     = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [financeOpen,   setFinanceOpen]   = useState(false);
  const [reportsOpen,   setReportsOpen]   = useState(false);
  const [user,          setUser]          = useState<any>(null);

  const inFinance = pathname.includes("/finance");
  useEffect(() => { if (inFinance) setFinanceOpen(true); }, [inFinance]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/login"); return; }
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, [router]);

  const handleLogout = () => {
    ["accessToken","refreshToken","user"].forEach(k => localStorage.removeItem(k));
    router.push("/login");
  };

  /* breadcrumb */
  const segments = pathname.split("/").filter(Boolean).slice(1);
  const crumbs = [
    { label: lang === "ar" ? "الرئيسية" : "Home", href: "/dashboard" },
    ...segments.map((seg, i) => ({
      label: label(seg, lang),
      href: "/" + ["dashboard", ...segments.slice(0, i + 1)].join("/"),
    })),
  ];

  /* ─── Sidebar inner ─────────────────────────────────── */
  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-e border-neutral-100 dark:border-neutral-800">
      {/* Logo row */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-600/30">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-black tracking-tight text-neutral-900 dark:text-white truncate">
              سَنَد
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
        >
          <PanelLeftClose className={cn("w-4 h-4 transition-transform duration-200", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-2 py-3 space-y-5">
        {/* Main + Operations */}
        {NAV.map(section => (
          <div key={section.group.en}>
            {!collapsed && (
              <p className="px-2 mb-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
                {section.group[lang]}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-semibold transition-all",
                      active
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-blue-600 dark:text-blue-400" : "text-neutral-400")} />
                    {!collapsed && <span className="truncate">{t(item.id)}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Finance group */}
        <div>
          {!collapsed && (
            <p className="px-2 mb-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
              {lang === "ar" ? "المالية" : "Finance"}
            </p>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setFinanceOpen(!financeOpen)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-semibold transition-all",
                inFinance
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              )}
            >
              <TrendingUp className={cn("w-4 h-4 flex-shrink-0", inFinance ? "text-blue-600 dark:text-blue-400" : "text-neutral-400")} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-start">{t("finance")}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", financeOpen && "rotate-180")} />
                </>
              )}
            </button>

            {financeOpen && !collapsed && (
              <div className="ms-3 ps-3 border-s-2 border-neutral-100 dark:border-neutral-800 space-y-0.5 mt-0.5">
                {/* Finance Dashboard */}
                <Link
                  href="/dashboard/finance/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-semibold transition-all",
                    pathname === "/dashboard/finance/dashboard" || pathname === "/dashboard/finance"
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  )}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "لوحة المالية" : "Finance Dashboard"}</span>
                </Link>

                {FINANCE_CHILDREN.map(child => {
                  const active = pathname.startsWith(child.href);
                  return (
                    <Link
                      key={child.id}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-semibold transition-all",
                        active
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600"
                          : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      )}
                    >
                      <child.icon className={cn("w-3.5 h-3.5", active ? "text-blue-500" : "text-neutral-400")} />
                      <span>{t(child.id)}</span>
                    </Link>
                  );
                })}

                {/* Reports sub-group */}
                <button
                  onClick={() => setReportsOpen(!reportsOpen)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-semibold transition-all",
                    pathname.includes("/finance/reports")
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  )}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="flex-1 text-start">{t("reports")}</span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", reportsOpen && "rotate-180")} />
                </button>

                {reportsOpen && (
                  <div className="ms-4 space-y-0.5 border-s border-neutral-100 dark:border-neutral-800 ps-2">
                    {FINANCE_REPORTS.map(sub => {
                      const active = pathname === sub.href;
                      return (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "block px-2 py-1 rounded text-[11px] font-medium transition-all",
                            active
                              ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40"
                              : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          )}
                        >
                          {t(sub.id)}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* System */}
        <div>
          {!collapsed && (
            <p className="px-2 mb-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
              {lang === "ar" ? "النظام" : "System"}
            </p>
          )}
          <div className="space-y-0.5">
            {SYSTEM_NAV.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-semibold transition-all",
                    active
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-blue-600" : "text-neutral-400")} />
                  {!collapsed && <span>{t(item.id)}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-2 border-t border-neutral-100 dark:border-neutral-800 flex-shrink-0">
        <div
          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-all group"
          onClick={() => router.push("/dashboard/profile")}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-black text-xs flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-neutral-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-neutral-400 font-semibold">
                {user?.role === "ADMIN" ? (lang === "ar" ? "مدير النظام" : "Admin") : (lang === "ar" ? "محاسب" : "Accountant")}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={e => { e.stopPropagation(); handleLogout(); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-red-500 transition-all"
              title={lang === "ar" ? "خروج" : "Logout"}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950" dir={dir}>
      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:block h-screen sticky top-0 flex-shrink-0 transition-all duration-300 ease-in-out z-30",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}>
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className={cn("relative z-50 w-[220px] h-full flex-shrink-0", dir === "rtl" ? "mr-auto" : "ml-0")}>
            <div className="absolute top-3 end-3 z-10">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 sticky top-0 z-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur border-b border-neutral-100 dark:border-neutral-800 px-4 flex items-center justify-between gap-4">
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <nav className="flex items-center gap-1 text-xs overflow-hidden">
              {crumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1 whitespace-nowrap">
                  {i > 0 && <ChevronRight className="w-3 h-3 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />}
                  {i === crumbs.length - 1 ? (
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate max-w-[140px]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href} className="text-neutral-400 hover:text-blue-500 transition-colors font-medium">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="px-2 py-1 text-[10px] font-bold border border-neutral-200 dark:border-neutral-700 rounded-lg uppercase hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-neutral-600 dark:text-neutral-400"
            >
              {language === "ar" ? "EN" : "AR"}
            </button>

            <button
              onClick={() => router.push("/dashboard/profile")}
              className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              {user?.firstName?.[0]}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
