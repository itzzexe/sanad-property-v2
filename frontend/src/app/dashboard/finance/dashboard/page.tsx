"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { financeApi, FinanceDashboardStats } from "@/lib/api/finance";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, Target,
  ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Zap,
  ArrowDownToLine, ArrowUpToLine
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const fmt = (n: number) => (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";

export default function FinanceDashboardPage() {
  const { language, t, dir } = useLanguage();
  const { format } = useCurrency();
  const [stats, setStats] = useState<FinanceDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeApi.getFinanceStats();
      setStats(data);
    } catch (e: any) {
      setError(e.message || (language === 'ar' ? "فشل تحميل البيانات المالية" : "Failed to load financial data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: language === 'ar' ? "إجمالي الإيرادات" : "Total Revenue",
      value: format(stats?.revenue.mtd || 0),
      icon: TrendingUp,
      change: stats?.revenue.mtdGrowthPct ? `${stats.revenue.mtdGrowthPct > 0 ? '+' : ''}${stats.revenue.mtdGrowthPct.toFixed(1)}%` : null,
      positive: (stats?.revenue.mtdGrowthPct || 0) >= 0,
      sub: language === 'ar' ? "مقارنة بالشهر السابق" : "Vs last month"
    },
    {
      title: language === 'ar' ? "صافي الدخل" : "Net Income",
      value: format(stats?.netIncome.mtd || 0),
      icon: DollarSign,
      positive: (stats?.netIncome.mtd || 0) >= 0,
      sub: language === 'ar' ? "للفترة الحالية" : "Current period"
    },
    {
      title: language === 'ar' ? "المركز النقدي" : "Cash Position",
      value: format(stats?.cashPosition || 0),
      icon: Wallet,
      positive: true,
      sub: language === 'ar' ? "إجمالي السيولة" : "Total liquidity"
    },
    {
      title: language === 'ar' ? "مستحقات القبض" : "Receivables (AR)",
      value: format(stats?.ar.totalOutstanding || 0),
      icon: ArrowDownToLine,
      positive: false,
      sub: language === 'ar' ? "ديون المستأجرين" : "Active debts"
    },
    {
      title: language === 'ar' ? "حسابات الدفع" : "Payables (AP)",
      value: format(stats?.ap.totalOutstanding || 0),
      icon: ArrowUpToLine,
      positive: false,
      sub: language === 'ar' ? "ديون الموردين" : "Vendor balance"
    },
    {
      title: language === 'ar' ? "الميزانية المتبقية" : "Remaining Budget",
      value: stats?.budget ? `${stats.budget.utilizationPct?.toFixed(0)}%` : "N/A",
      icon: Target,
      positive: true,
      sub: language === 'ar' ? "من المخطط للفترة" : "Of current period plan"
    },
  ];

  const arPieData = [
    { name: language === 'ar' ? "حالي" : "Current", value: stats?.ar.current || 0, color: "#6366f1" },
    { name: "30-60", value: stats?.ar.overdue30 || 0, color: "#f59e0b" },
    { name: "60-90", value: stats?.ar.overdue60 || 0, color: "#f97316" },
    { name: "90+", value: stats?.ar.overdue90plus || 0, color: "#ef4444" },
  ];

  return (
    <div className={cn("space-y-8 font-arabic", language === 'ar' ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-neutral-900 dark:text-neutral-50 mb-2">
             {t('finance_center').split(' ')[0]} <span className="text-primary-500">{t('finance_center').split(' ')[1]}</span>
          </h1>
          <p className="text-xs font-bold text-neutral-400 flex items-center gap-1.5 justify-end">
            <Zap className="w-3.5 h-3.5 text-primary-500" />
            {stats?.currentPeriod.name || "Jan 2025"} — {t('live_data')}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="rounded-xl border-neutral-200 h-12 px-6 font-bold">{language === 'ar' ? "تحميل التقرير" : "Download PDF"}</Button>
           <Button className="bg-primary-600 rounded-xl h-12 px-8 font-black shadow-lg shadow-primary-600/20">{t('new_entry')}</Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="bg-white dark:bg-neutral-900 border-none shadow-soft hover:shadow-glow transition-all rounded-[32px] group overflow-hidden border border-neutral-100 dark:border-neutral-800">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 group-hover:bg-primary-600 group-hover:text-white transition-all flex items-center justify-center text-neutral-400">
                   <kpi.icon className="w-5 h-5" />
                </div>
                {kpi.change && (
                  <Badge className={cn(
                    "font-bold text-[10px] px-3 h-6 border-none",
                    kpi.positive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                  )}>
                    {kpi.change}
                  </Badge>
                )}
              </div>
              <h3 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 leading-none mb-2 font-mono">{kpi.value}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{kpi.title}</p>
              <div className="h-[1px] w-full bg-neutral-50 dark:bg-neutral-800 my-4" />
              <p className="text-[10px] font-bold text-neutral-400">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2 bg-white dark:bg-neutral-900 border-none shadow-soft rounded-[32px] overflow-hidden border border-neutral-100 dark:border-neutral-800">
          <CardHeader className="p-8 flex-row items-center justify-between border-b border-neutral-50 dark:border-neutral-800">
            <div>
              <CardTitle className="text-xl font-black text-neutral-900 dark:text-neutral-50">{t('revenue_trend')}</CardTitle>
              <CardDescription className="text-xs font-bold text-neutral-400">{t('last_12_periods')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.revenueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBEB" />
                  <XAxis dataKey="periodName" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: '700' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: '700' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={false} name={language === 'ar' ? "إيرادات" : "Revenue"} />
                  <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} dot={false} name={language === 'ar' ? "مصروفات" : "Expense"} />
                  <Line type="monotone" dataKey="netIncome" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} name={language === 'ar' ? "صافي" : "Net"} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AR Aging Donut */}
        <Card className="bg-white dark:bg-neutral-900 border-none shadow-soft rounded-[32px] overflow-hidden border border-neutral-100 dark:border-neutral-800">
          <CardHeader className="p-8 border-b border-neutral-50 dark:border-neutral-800">
            <CardTitle className="text-xl font-black text-neutral-900 dark:text-neutral-50">{t('ar_distribution')}</CardTitle>
            <CardDescription className="text-xs font-bold text-neutral-400">{t('receivables')}</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[240px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={arPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} dataKey="value" paddingAngle={6}>
                    {arPieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-black text-neutral-900 dark:text-neutral-50">{format(stats?.ar.totalOutstanding || 0)}</p>
                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">{t('total')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Properties Table */}
      {stats?.topProperties && stats.topProperties.length > 0 && (
        <Card className="bg-white dark:bg-neutral-900 border-none shadow-premium rounded-[40px] overflow-hidden">
          <CardHeader className="p-8 border-b border-neutral-50 dark:border-neutral-800">
            <CardTitle className="text-xl font-black text-neutral-900 dark:text-neutral-50">{t('top_revenue_properties')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-50 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-800/20">
                  <th className="text-right p-4 font-black text-neutral-400 uppercase text-[10px] tracking-widest">{t('properties')}</th>
                  <th className="text-right p-4 font-black text-neutral-400 uppercase text-[10px] tracking-widest">{t('revenue')}</th>
                  <th className="text-right p-4 font-black text-neutral-400 uppercase text-[10px] tracking-widest">{t('net_profit')}</th>
                  <th className="text-right p-4 font-black text-neutral-400 uppercase text-[10px] tracking-widest">{t('occupancy')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProperties.map((p) => (
                  <tr key={p.propertyId} className="border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="p-4 font-black text-neutral-900 dark:text-neutral-50">{p.propertyName}</td>
                    <td className="p-4 font-black text-neutral-700 dark:text-neutral-300">{format(p.revenue)}</td>
                    <td className={cn("p-4 font-black", p.netProfit >= 0 ? "text-emerald-500" : "text-rose-500")}>
                      {format(p.netProfit)}
                    </td>
                    <td className="p-4">
                       <Badge variant={p.occupancyRate > 0.9 ? 'success' : 'warning'} className="font-bold">
                         {(p.occupancyRate * 100).toFixed(0)}%
                       </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
