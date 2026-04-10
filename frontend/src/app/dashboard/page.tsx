"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, Building2, Clock, FileCheck, 
  CreditCard, FilePlus, UserPlus, BarChart2,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  Target, Wallet, PieChart as PieIcon
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { api } from "@/lib/api";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// --- Mock Data for Charts (Replace with API data if available) ---
const REVENUE_EXPENSES_DATA = [
  { month: "Jan", revenue: 45000, expenses: 32000 },
  { month: "Feb", revenue: 52000, expenses: 34000 },
  { month: "Mar", revenue: 48000, expenses: 31000 },
  { month: "Apr", revenue: 61000, expenses: 42000 },
  { month: "May", revenue: 55000, expenses: 38000 },
  { month: "Jun", revenue: 67000, expenses: 40000 },
];

const AR_AGING_DATA = [
  { name: "Current", value: 65, color: "var(--accent-500)" },
  { name: "30d", value: 20, color: "var(--warning)" },
  { name: "60d", value: 10, color: "#FB923C" }, // orange-400
  { name: "90d+", value: 5, color: "var(--danger)" },
];

const RECENT_TRANSACTIONS = [
  { id: 1, tenant: "Alex Johnson", property: "Sunset Heights 4B", amount: 1200, type: "Rent", date: "Oct 12, 2024", status: "Success" },
  { id: 2, tenant: "Maria Garcia", property: "Green Valley A2", amount: 850, type: "Maintenance", date: "Oct 11, 2024", status: "Pending" },
  { id: 3, tenant: "David Smith", property: "Urban Loft 12", amount: 2100, type: "Security", date: "Oct 10, 2024", status: "Success" },
  { id: 4, tenant: "Sarah Lee", property: "Sunset Heights 1A", amount: 1200, type: "Rent", date: "Oct 09, 2024", status: "Success" },
  { id: 5, tenant: "Robert Chen", property: "Harbor View 5C", amount: 3400, type: "Late Fee", date: "Oct 08, 2024", status: "Failed" },
];

const KPICard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  trend, 
  colorClass = "text-primary-500",
  bgClass = "bg-primary-50",
  loading = false
}: any) => (
  <Card className="hover:shadow-lg transition-all duration-300">
    <CardContent className="p-6">
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-12 h-4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-32 h-8" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div className={cn("p-2.5 rounded-full", bgClass)}>
              <Icon className={cn("w-5 h-5", colorClass)} />
            </div>
            {change && (
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-bold",
                trend === "up" ? "text-accent-600" : "text-danger"
              )}>
                {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change}%
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{label}</p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1 leading-none">{value}</h3>
            {change && (
              <p className="text-[10px] text-neutral-400 mt-2">vs last month</p>
            )}
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

import { useLanguage } from "@/context/language-context";

export default function DashboardPage() {
  const { language, t, dir } = useLanguage();
  const { format } = useCurrency();
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsRes, revenueRes, transactionsRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/revenue-chart"),
          api.get("/dashboard/recent-payments?limit=5")
        ]);
        setStats(statsRes);
        setRevenueData(revenueRes || []);
        setTransactions(transactionsRes || []);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const arAgingData = [
    { name: t('current'), value: stats?.ar?.current || 65, color: "var(--accent-500)" },
    { name: "30d", value: stats?.ar?.overdue30 || 20, color: "var(--warning)" },
    { name: "60d", value: stats?.ar?.overdue60 || 10, color: "#FB923C" },
    { name: "90d+", value: stats?.ar?.overdue90plus || 5, color: "var(--danger)" },
  ];

  return (
    <div className={cn("space-y-8 pb-12 font-arabic", language === 'ar' ? "text-right" : "")} dir={dir}>
      <PageHeader 
        title={t('portfolio_overview')}
        description={t('portfolio_description')}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl">{t('export_data')}</Button>
            <Button size="sm" className="rounded-xl bg-primary-600">{t('add_property')}</Button>
          </div>
        }
      />

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <KPICard 
             icon={TrendingUp} 
             label={t('total_revenue')} 
             value={format(stats?.payments?.revenue || 0)} 
             change={12.5} 
             trend="up"
             loading={loading}
             colorClass="text-primary-500"
             bgClass="bg-primary-50"
             vsLabel={language === 'ar' ? "مقابل الشهر الماضي" : "vs last month"}
           />
           <KPICard 
             icon={Building2} 
             label={t('occupancy_rate')} 
             value={`${stats?.occupancyRate || 0}%`} 
             change={2.1} 
             trend="up"
             loading={loading}
             colorClass="text-accent-600"
             bgClass="bg-accent-50"
             vsLabel={language === 'ar' ? "مقابل الشهر الماضي" : "vs last month"}
           />
           <KPICard 
             icon={Clock} 
             label={t('outstanding_ar')} 
             value={format(stats?.ar?.outstanding || 0)} 
             change={4.3} 
             trend="down"
             loading={loading}
             colorClass="text-amber-600"
             bgClass="bg-amber-50"
             vsLabel={language === 'ar' ? "مقابل الشهر الماضي" : "vs last month"}
           />
           <KPICard 
             icon={FileCheck} 
             label={t('active_leases')} 
             value={stats?.leases?.active || 0} 
             change={8} 
             trend="up"
             loading={loading}
             colorClass="text-blue-600"
             bgClass="bg-blue-50"
             vsLabel={language === 'ar' ? "مقابل الشهر الماضي" : "vs last month"}
           />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-[32px] border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle>{t('revenue_vs_expenses')}</CardTitle>
              <p className="text-xs text-neutral-400 mt-1">{t('monthly_trend')}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              {loading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94A3B8', fontSize: 12}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94A3B8', fontSize: 12}}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#6366F1" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                      name={t('revenue')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 rounded-[32px] border-none shadow-soft">
          <CardHeader>
            <CardTitle>{t('ar_aging_title')}</CardTitle>
            <p className="text-xs text-neutral-400 mt-1">{t('ar_status')}</p>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={arAgingData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {arAgingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-neutral-900 dark:text-neutral-50">{format(stats?.ar?.outstanding || 0)}</span>
                <span className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">{t('total')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recently & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-[40px] border-none shadow-premium overflow-hidden">
             <div className="p-8 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
                <CardTitle className="text-xl font-black">{t('recent_transactions')}</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary-500 font-bold">{t('view_all')}</Button>
             </div>
             {loading ? (
                <div className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
             ) : (
               <DataTable 
                 columns={[
                   { header: t('tenant'), accessorKey: "lease.tenant", cell: (item) => `${item.lease?.tenant?.firstName} ${item.lease?.tenant?.lastName}` },
                   { header: t('unit'), accessorKey: "lease.unit.unitNumber", cell: (item) => item.lease?.unit?.unitNumber || "N/A" },
                   { header: t('amount'), accessorKey: "amount", cell: (item) => <span className="font-black">{format(item.amount)}</span> },
                   { header: t('status'), accessorKey: "status", cell: (item) => (
                     <Badge 
                      variant={item.status === "COMPLETED" ? "success" : item.status === "PENDING" ? "warning" : "danger"} 
                      size="sm"
                     >
                       {item.status}
                     </Badge>
                   )},
                 ]}
                 data={transactions}
               />
             )}
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-[32px] border-none shadow-soft">
            <CardHeader>
              <CardTitle>{t('quick_actions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'record_payment', icon: CreditCard, color: "text-primary-500" },
                  { id: 'new_lease', icon: FilePlus, color: "text-accent-500" },
                  { id: 'add_tenant', icon: UserPlus, color: "text-blue-500" },
                  { id: 'finance_reports', icon: BarChart2, color: "text-amber-500" },
                ].map((action) => (
                  <button 
                    key={action.id}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:border-primary-200 transition-all group"
                  >
                    <action.icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", action.color)} />
                    <span className="text-[10px] font-black text-neutral-600 dark:text-neutral-400 text-center uppercase tracking-wider">{t(action.id)}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 4: Finance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-accent-50 rounded-lg">
                <Wallet className="w-5 h-5 text-accent-500" />
              </div>
              <Badge variant="success" size="sm">+14% {t('goal')}</Badge>
            </div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{t('net_income')} MTD</p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">
              {format((stats?.payments?.revenue || 0) - (stats?.expenses?.total || 0))}
            </h3>
            <div className="mt-4 space-y-2">
              <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-accent-500 rounded-full" style={{ width: '75%' }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-neutral-400">
                 <span>75% {t('target_vs_actual')}</span>
                 <span>{t('target')}: {format(30000)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Coins className="w-5 h-5 text-blue-500" />
              </div>
              <div className={cn("flex items-center gap-1 text-[10px] font-bold text-danger", language === 'ar' ? 'flex-row-reverse' : '')}>
                 <ArrowDownRight className="w-3 h-3" /> 2.4% {language === 'ar' ? 'مقابل الأمس' : 'vs yesterday'}
              </div>
            </div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{t('cash_position')}</p>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">{format(stats?.cashPosition || 0)}</h3>
            <p className="text-[10px] text-neutral-400 mt-2 italic">{language === 'ar' ? 'متاح عبر جميع الحسابات' : 'Available across all accounts'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="stroke-neutral-100 dark:stroke-neutral-800"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-primary-500"
                  strokeWidth="3.5"
                  strokeDasharray="62, 100"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">62%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{t('budget_utilization')}</p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">{format(84200)}</h3>
              <p className="text-[10px] text-neutral-400 mt-1">{t('remaining')}: {format(52000)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add local coins icon as it was missing from lucide import
const Coins = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="8" cy="8" r="6"/>
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18.06"/>
    <path d="M7 6h1v4"/>
    <path d="m16.71 13.88.7.71-2.82 2.82"/>
  </svg>
);
