"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, Target,
  ArrowDownToLine, ArrowUpToLine, RefreshCw, Zap
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { financeApi, FinanceDashboardStats } from "@/lib/api/finance";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

export default function FinanceDashboardPage() {
  const { language, t, dir } = useLanguage();
  const { format } = useCurrency();

  const [stats,   setStats]   = useState<FinanceDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setStats(await financeApi.getFinanceStats()); }
    catch (e: any) { setError(e.message ?? "Error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const kpis = [
    { title: language === "ar" ? "إجمالي الإيرادات" : "Total Revenue",   value: format(stats?.revenue.mtd ?? 0),         icon: TrendingUp,       positive: (stats?.revenue.mtdGrowthPct ?? 0) >= 0, change: stats?.revenue.mtdGrowthPct != null ? `${stats!.revenue.mtdGrowthPct > 0 ? "+" : ""}${stats!.revenue.mtdGrowthPct.toFixed(1)}%` : null },
    { title: language === "ar" ? "صافي الدخل" : "Net Income",             value: format(stats?.netIncome.mtd ?? 0),       icon: DollarSign,       positive: (stats?.netIncome.mtd ?? 0) >= 0, change: null },
    { title: language === "ar" ? "المركز النقدي" : "Cash Position",       value: format(stats?.cashPosition ?? 0),        icon: Wallet,           positive: true, change: null },
    { title: language === "ar" ? "مستحقات القبض" : "Receivables (AR)",    value: format(stats?.ar.totalOutstanding ?? 0), icon: ArrowDownToLine,  positive: false, change: null },
    { title: language === "ar" ? "حسابات الدفع" : "Payables (AP)",        value: format(stats?.ap.totalOutstanding ?? 0), icon: ArrowUpToLine,    positive: false, change: null },
    { title: language === "ar" ? "الميزانية المستخدمة" : "Budget Used",   value: stats?.budget ? `${stats.budget.utilizationPct?.toFixed(0)}%` : "N/A", icon: Target, positive: true, change: null },
  ];

  const arPieData = [
    { name: language === "ar" ? "حالي" : "Current", value: stats?.ar.current  ?? 0, color: "#6366f1" },
    { name: "30-60d",  value: stats?.ar.overdue30   ?? 0, color: "#f59e0b" },
    { name: "60-90d",  value: stats?.ar.overdue60   ?? 0, color: "#f97316" },
    { name: "90d+",    value: stats?.ar.overdue90plus ?? 0, color: "#ef4444" },
  ];

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {language === "ar" ? "لوحة المالية" : "Finance Dashboard"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            {stats?.currentPeriod?.name ?? "—"} — {language === "ar" ? "بيانات حية" : "Live data"}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 h-10 px-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          {language === "ar" ? "تحديث" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <Sk key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                  <kpi.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                {kpi.change && (
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                    kpi.positive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400")}>
                    {kpi.change}
                  </span>
                )}
              </div>
              <p className="text-xl font-black text-neutral-900 dark:text-white font-mono">{kpi.value}</p>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mt-1">{kpi.title}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue trend line chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card p-5">
          <div className="mb-4">
            <p className="font-bold text-neutral-900 dark:text-white text-sm">{t("revenue_trend") ?? (language === "ar" ? "منحنى الإيرادات" : "Revenue Trend")}</p>
            <p className="text-[11px] text-neutral-400">{t("last_12_periods") ?? (language === "ar" ? "آخر 12 فترة" : "Last 12 periods")}</p>
          </div>
          {loading ? (
            <Sk className="h-64" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.revenueTrend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="periodName" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} />
                  <Line type="monotone" dataKey="revenue"   stroke="#6366f1" strokeWidth={2.5} dot={false} name={language === "ar" ? "إيرادات" : "Revenue"} />
                  <Line type="monotone" dataKey="expense"   stroke="#f43f5e" strokeWidth={2}   dot={false} name={language === "ar" ? "مصروفات" : "Expense"} />
                  <Line type="monotone" dataKey="netIncome" stroke="#10b981" strokeWidth={2}   dot={false} strokeDasharray="5 5" name={language === "ar" ? "صافي" : "Net"} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* AR aging donut */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card p-5">
          <div className="mb-4">
            <p className="font-bold text-neutral-900 dark:text-white text-sm">{t("ar_distribution") ?? (language === "ar" ? "توزيع المديونية" : "AR Distribution")}</p>
            <p className="text-[11px] text-neutral-400">{language === "ar" ? "المستحقات" : "Receivables"}</p>
          </div>
          {loading ? (
            <Sk className="h-52" />
          ) : (
            <div className="relative h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={arPieData} cx="50%" cy="50%" innerRadius={62} outerRadius={82} dataKey="value" paddingAngle={5}>
                    {arPieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "none", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-lg font-black text-neutral-900 dark:text-white">{format(stats?.ar.totalOutstanding ?? 0)}</p>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">{language === "ar" ? "الإجمالي" : "Total"}</p>
              </div>
            </div>
          )}
          {/* Legend */}
          <div className="mt-3 space-y-1.5">
            {arPieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-neutral-700 dark:text-neutral-300">{format(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top properties table */}
      {stats?.topProperties && stats.topProperties.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <p className="font-bold text-neutral-900 dark:text-white text-sm">
              {t("top_revenue_properties") ?? (language === "ar" ? "أعلى العقارات إيراداً" : "Top Revenue Properties")}
            </p>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "العقار" : "Property"}</th>
                <th>{language === "ar" ? "الإيرادات" : "Revenue"}</th>
                <th>{language === "ar" ? "صافي الربح" : "Net Profit"}</th>
                <th>{language === "ar" ? "نسبة الإشغال" : "Occupancy"}</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProperties.map((p: any) => (
                <tr key={p.propertyId}>
                  <td className="font-semibold text-neutral-900 dark:text-white text-sm">{p.propertyName}</td>
                  <td className="font-bold text-neutral-700 dark:text-neutral-300">{format(p.revenue)}</td>
                  <td className={cn("font-black", p.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                    {format(p.netProfit)}
                  </td>
                  <td>
                    <span className={cn("inline-block text-[10px] font-bold px-2.5 py-1 rounded-full",
                      p.occupancyRate > 0.9 ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400")}>
                      {(p.occupancyRate * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
