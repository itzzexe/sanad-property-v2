"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import {
  LayoutDashboard, BookOpen, FileEdit, Scale, TrendingUp, PieChart, DollarSign,
  BarChart3, Wallet, Users, Building2, Landmark, Receipt, CalendarDays, ChevronLeft
} from "lucide-react";

const SECTIONS = [
  {
    label: "نظرة عامة",
    items: [
      { name: "لوحة المالية", href: "/dashboard/finance/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "الدفاتر",
    items: [
      { name: "شجرة الحسابات", href: "/dashboard/finance/chart-of-accounts", icon: BookOpen },
      { name: "القيود اليومية", href: "/dashboard/finance/journal-entries", icon: FileEdit },
      { name: "ميزان المراجعة", href: "/dashboard/finance/trial-balance", icon: Scale },
    ],
  },
  {
    label: "التقارير",
    items: [
      { name: "قائمة الدخل", href: "/dashboard/finance/reports/income-statement", icon: TrendingUp },
      { name: "الميزانية العمومية", href: "/dashboard/finance/reports/balance-sheet", icon: PieChart },
      { name: "التدفقات النقدية", href: "/dashboard/finance/reports/cash-flow", icon: DollarSign },
      { name: "أعمار الديون", href: "/dashboard/finance/reports/ar-aging", icon: BarChart3 },
      { name: "ربحية العقارات", href: "/dashboard/finance/reports/property-profitability", icon: Building2 },
    ],
  },
  {
    label: "التخطيط",
    items: [
      { name: "الميزانيات", href: "/dashboard/finance/budgets", icon: Wallet },
    ],
  },
  {
    label: "الذمم",
    items: [
      { name: "حسابات القبض", href: "/dashboard/finance/accounts-receivable", icon: Users },
      { name: "حسابات الدفع", href: "/dashboard/finance/accounts-payable/vendors", icon: Receipt },
    ],
  },
  {
    label: "الخزينة",
    items: [
      { name: "التسويات البنكية", href: "/dashboard/finance/reconciliation", icon: Landmark },
    ],
  },
  {
    label: "الإعدادات",
    items: [
      { name: "الفترات المالية", href: "/dashboard/finance/fiscal-periods", icon: CalendarDays },
    ],
  },
];

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language, t, dir } = useLanguage();

  const SECTIONS = [
    {
      label: language === 'ar' ? "نظرة عامة" : "Overview",
      items: [
        { name: t('dashboard'), id: 'dashboard', href: "/dashboard/finance/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: language === 'ar' ? "الدفاتر" : "Ledgers",
      items: [
        { name: t('chart_of_accounts'), id: 'coa', href: "/dashboard/finance/chart-of-accounts", icon: BookOpen },
        { name: t('journal_entries'), id: 'journal', href: "/dashboard/finance/journal-entries", icon: FileEdit },
        { name: t('trial_balance'), id: 'trial', href: "/dashboard/finance/trial-balance", icon: Scale },
      ],
    },
    {
      label: language === 'ar' ? "التقارير" : "Reports",
      items: [
        { name: t('income_statement'), id: 'is', href: "/dashboard/finance/reports/income-statement", icon: TrendingUp },
        { name: t('balance_sheet'), id: 'bs', href: "/dashboard/finance/reports/balance-sheet", icon: PieChart },
        { name: t('cash_flow'), id: 'cf', href: "/dashboard/finance/reports/cash-flow", icon: DollarSign },
        { name: t('ar_aging'), id: 'aging', href: "/dashboard/finance/reports/ar-aging", icon: BarChart3 },
      ],
    },
    {
      label: language === 'ar' ? "التخطيط" : "Planning",
      items: [
        { name: t('budgets'), id: 'budgets', href: "/dashboard/finance/budgets", icon: Wallet },
      ],
    },
  ];

  return (
    <div className={cn("flex gap-8", dir === 'rtl' ? 'flex-row' : 'flex-row-reverse')}>
      {/* Main Content (Primary focus) */}
      <main className="flex-1 min-w-0">
        {children}
      </main>

      {/* Finance Sub-nav (Side focus) */}
      <aside className="w-64 min-h-[calc(100vh-10rem)] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-4 flex-shrink-0 sticky top-24 h-fit hidden xl:block shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2 px-3 mb-6 text-xs font-black text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest">
          <ChevronLeft className={cn("w-4 h-4", dir === 'rtl' ? 'rotate-180' : '')} /> {language === 'ar' ? "العودة للرئيسية" : "Back to Dashboard"}
        </Link>

        {SECTIONS.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">{section.label}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard/finance/dashboard");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/10 text-primary-600 shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    )}
                  >
                    <item.icon className={cn("w-4.5 h-4.5", isActive ? "text-primary-600" : "text-neutral-400")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
