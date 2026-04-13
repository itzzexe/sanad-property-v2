"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, Building2, Clock, FileCheck, CreditCard,
  FilePlus, UserPlus, BarChart2, ArrowUpRight, ArrowDownRight,
  AlertCircle, Home, DollarSign, Activity, RefreshCw, ClipboardCheck
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { api } from "@/lib/api";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/lib/utils";

/* ─── Skeleton ─────────────────────────────────────────── */
const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

/* ─── KPI Card ─────────────────────────────────────────── */
function KPICard({
  icon: Icon, label, value, change, trend, colorScheme, loading,
}: {
  icon: any; label: string; value: string; change?: number; trend?: "up" | "down";
  colorScheme: "blue" | "green" | "amber" | "violet"; loading?: boolean;
}) {
  const schemes = {
    blue:   { bg: "bg-blue-50 dark:bg-blue-950/30",   icon: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",   badge: trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50" },
    green:  { bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600", badge: trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50" },
    amber:  { bg: "bg-amber-50 dark:bg-amber-950/30",  icon: "bg-amber-100 dark:bg-amber-900/40 text-amber-600",  badge: trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50" },
    violet: { bg: "bg-violet-50 dark:bg-violet-950/30",icon: "bg-violet-100 dark:bg-violet-900/40 text-violet-600",badge: trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50" },
  };
  const s = schemes[colorScheme];

  if (loading) return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-5 space-y-4 shadow-card">
      <div className="flex items-start justify-between"><Sk className="w-10 h-10 rounded-lg" /><Sk className="w-14 h-5 rounded-full" /></div>
      <div className="space-y-2"><Sk className="w-24 h-3" /><Sk className="w-32 h-8" /></div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-card hover:shadow-md-soft transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span className={cn("flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full", s.badge)}>
            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-neutral-900 dark:text-white mt-1 leading-none">{value}</p>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────── */
export default function DashboardPage() {
  const { language, t, dir } = useLanguage();
  const { format } = useCurrency();
  const [stats,           setStats]           = useState<any>(null);
  const [chartData,       setChartData]       = useState<any[]>([]);
  const [transactions,    setTransactions]    = useState<any[]>([]);
  const [pendingCount,    setPendingCount]    = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [s, r, tr, pc] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/revenue-chart"),
        api.get("/dashboard/recent-payments?limit=6"),
        api.get("/approvals/count/pending").catch(() => ({ count: 0 })),
      ]);
      setStats(s);
      setChartData(Array.isArray(r) ? r : []);
      setTransactions(Array.isArray(tr) ? tr : []);
      setPendingCount((pc as any)?.count ?? 0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const arAging = [
    { name: language === "ar" ? "حالي" : "Current", value: stats?.ar?.current ?? 65,     color: "#22C55E" },
    { name: "30d",                                    value: stats?.ar?.overdue30 ?? 20,   color: "#F59E0B" },
    { name: "60d",                                    value: stats?.ar?.overdue60 ?? 10,   color: "#F97316" },
    { name: "90d+",                                   value: stats?.ar?.overdue90plus ?? 5,color: "#EF4444" },
  ];

  const quickActions = [
    { id: "record_payment", icon: CreditCard, href: "/dashboard/payments",   color: "text-blue-500",  bg: "bg-blue-50 dark:bg-blue-950/30"   },
    { id: "new_lease",      icon: FilePlus,   href: "/dashboard/contracts",  color: "text-violet-500",bg: "bg-violet-50 dark:bg-violet-950/30"},
    { id: "add_tenant",     icon: UserPlus,   href: "/dashboard/tenants",    color: "text-emerald-500",bg:"bg-emerald-50 dark:bg-emerald-950/30"},
    { id: "finance_reports",icon: BarChart2,  href: "/dashboard/finance/reports/income-statement", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  ];

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p className="text-neutral-600 dark:text-neutral-400 font-medium">
        {language === "ar" ? "تعذّر تحميل البيانات" : "Failed to load data"}
      </p>
      <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
        <RefreshCw className="w-4 h-4" /> {language === "ar" ? "إعادة المحاولة" : "Retry"}
      </button>
    </div>
  );

  return (
    <div className={cn("space-y-6 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {language === "ar" ? "لوحة التحكم" : "Dashboard"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
            {language === "ar" ? "نظرة عامة على المحفظة العقارية" : "Portfolio overview at a glance"}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all self-start"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          {language === "ar" ? "تحديث" : "Refresh"}
        </button>
      </div>

      {/* Pending Approvals Banner */}
      {!loading && pendingCount > 0 && (
        <Link href="/dashboard/approvals"
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              {language === "ar"
                ? `يوجد ${pendingCount} طلب${pendingCount > 1 ? "ات" : ""} بانتظار الموافقة`
                : `${pendingCount} approval request${pendingCount > 1 ? "s" : ""} pending your review`}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
            {language === "ar" ? "عرض الكل ←" : "View all →"}
          </span>
        </Link>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={DollarSign} colorScheme="blue" loading={loading}
          label={t("total_revenue")}
          value={format(stats?.payments?.revenue ?? 0)}
          change={12.5} trend="up"
        />
        <KPICard
          icon={Home} colorScheme="green" loading={loading}
          label={t("occupancy_rate")}
          value={`${stats?.occupancyRate ?? 0}%`}
          change={2.1} trend="up"
        />
        <KPICard
          icon={Clock} colorScheme="amber" loading={loading}
          label={t("outstanding_ar")}
          value={format(stats?.ar?.outstanding ?? 0)}
          change={4.3} trend="down"
        />
        <KPICard
          icon={FileCheck} colorScheme="violet" loading={loading}
          label={t("active_leases")}
          value={String(stats?.leases?.active ?? 0)}
          change={8} trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{t("revenue_vs_expenses")}</h2>
              <p className="text-xs text-neutral-400 mt-0.5">{t("monthly_trend")}</p>
            </div>
            <Activity className="w-4 h-4 text-neutral-300" />
          </div>
          <div className="h-52">
            {loading ? (
              <Sk className="w-full h-full" />
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-neutral-300 dark:text-neutral-700 text-sm font-medium">
                {language === "ar" ? "لا توجد بيانات" : "No data yet"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    formatter={(val: any) => [format(Number(val)), ""]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#gradRev)"
                    name={language === "ar" ? "الإيرادات" : "Revenue"} />
                  <Area type="monotone" dataKey="expenses" stroke="#F59E0B" strokeWidth={2} fill="url(#gradExp)"
                    name={language === "ar" ? "المصروفات" : "Expenses"} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AR Aging donut */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-card">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{t("ar_aging_title")}</h2>
            <p className="text-xs text-neutral-400 mt-0.5">{t("ar_status")}</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-44">
              <Sk className="w-36 h-36 rounded-full" />
            </div>
          ) : (
            <div className="relative h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={arAging} innerRadius={52} outerRadius={72} paddingAngle={4} dataKey="value">
                    {arAging.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-neutral-900 dark:text-white">
                  {format(stats?.ar?.outstanding ?? 0)}
                </span>
                <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                  {t("total")}
                </span>
              </div>
            </div>
          )}
          <div className="mt-3 space-y-1.5">
            {arAging.map((e, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: e.color }} />
                  <span className="text-neutral-600 dark:text-neutral-400 font-medium">{e.name}</span>
                </div>
                <span className="font-bold text-neutral-900 dark:text-white">{e.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{t("recent_transactions")}</h2>
            <Link href="/dashboard/payments" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              {t("view_all")}
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => <Sk key={i} className="h-12 w-full" />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 dark:text-neutral-600 text-sm font-medium">
              {language === "ar" ? "لا توجد معاملات حديثة" : "No recent transactions"}
            </div>
          ) : (
            <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                      {(tx.lease?.tenant?.firstName?.[0] ?? "?")}{(tx.lease?.tenant?.lastName?.[0] ?? "")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                        {tx.lease?.tenant?.firstName} {tx.lease?.tenant?.lastName}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {tx.lease?.unit?.unitNumber ?? "—"} · {tx.lease?.unit?.property?.name ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {format(Number(tx.amount))}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      tx.status === "COMPLETED" ? "badge-success" :
                      tx.status === "PARTIAL"   ? "badge-warning" : "badge-danger"
                    )}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-card">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">{t("quick_actions")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(action => (
              <Link
                key={action.id}
                href={action.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800",
                  "hover:border-transparent hover:shadow-md-soft hover:scale-[1.02]",
                  "transition-all duration-150 cursor-pointer group",
                  action.bg
                )}
              >
                <action.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", action.color)} />
                <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 text-center uppercase tracking-wider leading-tight">
                  {t(action.id)}
                </span>
              </Link>
            ))}
          </div>

          {/* Summary stats */}
          <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5">
            {[
              { label: language === "ar" ? "إجمالي العقارات" : "Total Properties", value: stats?.properties?.total ?? 0, icon: Building2 },
              { label: language === "ar" ? "الوحدات المتاحة"  : "Available Units",   value: stats?.units?.available ?? 0,  icon: Home      },
              { label: language === "ar" ? "المستأجرون النشطون" : "Active Tenants",   value: stats?.tenants?.active ?? 0,   icon: TrendingUp},
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </div>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {loading ? "—" : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
