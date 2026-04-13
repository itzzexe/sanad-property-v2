"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, FileText, Download, Filter, Calendar,
  Building2, Users, CheckCircle2, FileSpreadsheet, FilePieChart, Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { toast } from "sonner";

const REPORT_TYPES = [
  {
    id: "financial",
    title: { ar: "التقرير المالي العام",          en: "General Financial Report" },
    desc:  { ar: "ملخص شامل للإيرادات والمصروفات وصافي الأرباح.", en: "Summary of revenues, expenses, and net profit." },
    icon: BarChart3,
    color: "text-blue-600 dark:text-blue-400",
    bg:    "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    id: "occupancy",
    title: { ar: "تقرير نسبة الإشغال",            en: "Occupancy Report" },
    desc:  { ar: "تحليل الوحدات المشغولة والشاغرة ونسبة العائد.", en: "Analysis of occupied vs. vacant units and yield." },
    icon: Building2,
    color: "text-violet-600 dark:text-violet-400",
    bg:    "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    id: "expenses",
    title: { ar: "سجل المصروفات التشغيلية",       en: "Operating Expenses" },
    desc:  { ar: "تقرير تفصيلي بكافة المصاريف والصيانة والرسوم.", en: "Detailed expenses, maintenance, and fees." },
    icon: FileText,
    color: "text-emerald-600 dark:text-emerald-400",
    bg:    "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    id: "tenants",
    title: { ar: "بيانات المستأجرين النشطين",     en: "Active Tenants Report" },
    desc:  { ar: "تقرير شامل بحالة المستأجرين ومواعيد انتهاء العقود.", en: "Tenant status, contacts, and lease expiry dates." },
    icon: Users,
    color: "text-amber-600 dark:text-amber-400",
    bg:    "bg-amber-50 dark:bg-amber-950/40",
  },
];

export default function ReportsPage() {
  const { language, dir } = useLanguage();

  const [selected,   setSelected]   = useState("financial");
  const [loading,    setLoading]    = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [filters,    setFilters]    = useState({ startDate: "", endDate: "", property: "all" });

  useEffect(() => {
    api.get("/properties?limit=100").then((res: any) => setProperties(res.data ?? res ?? [])).catch(() => {});
  }, []);

  const handleDownload = async (fmt: "excel" | "pdf") => {
    setLoading(true);
    try {
      const map: Record<string, Record<string, string>> = {
        financial: { excel: "/reports/financial/excel", pdf: "/reports/financial/pdf" },
        occupancy: { excel: "/reports/occupancy/excel", pdf: "/reports/occupancy/excel" },
        expenses:  { excel: "/reports/expenses/excel",  pdf: "/reports/expenses/excel"  },
        tenants:   { excel: "/reports/tenants/excel",   pdf: "/reports/tenants/excel"   },
      };
      const endpoint = map[selected]?.[fmt];
      if (!endpoint) return;

      const params = new URLSearchParams();
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate)   params.set("endDate",   filters.endDate);
      if (filters.property !== "all") params.set("property", filters.property);

      const blob = await api.download(`${endpoint}?${params}`);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${selected}-report-${Date.now()}.${fmt === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e?.message ?? (language === "ar" ? "فشل تحميل التقرير" : "Failed to download report"));
    } finally { setLoading(false); }
  };

  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          {t("التقارير", "Reports")}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t("استخراج التقارير المالية والتشغيلية", "Export financial and operational reports")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Report type selector */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">
            {t("نوع التقرير", "Report Type")}
          </p>
          <div className="space-y-2">
            {REPORT_TYPES.map(r => (
              <button key={r.id} onClick={() => setSelected(r.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-4 rounded-xl border-2 text-start transition-all",
                  selected === r.id
                    ? "bg-white dark:bg-neutral-900 border-blue-500 shadow-card"
                    : "bg-neutral-50 dark:bg-neutral-800/50 border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                )}>
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", r.bg)}>
                  <r.icon className={cn("w-4.5 h-4.5", r.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold", selected === r.id ? "text-blue-600 dark:text-blue-400" : "text-neutral-800 dark:text-neutral-200")}>
                    {r.title[language as "ar"|"en"]}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                    {r.desc[language as "ar"|"en"]}
                  </p>
                </div>
                {selected === r.id && <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />}
              </button>
            ))}
          </div>
        </div>

        {/* Filters + export */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="font-bold text-neutral-900 dark:text-white text-sm">
                {t("تخصيص بيانات التقرير", "Report Configuration")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                  {t("تاريخ البداية", "Start Date")}
                </label>
                <div className="relative">
                  <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})}
                    className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 ps-9 pe-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                  {t("تاريخ النهاية", "End Date")}
                </label>
                <div className="relative">
                  <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})}
                    className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 ps-9 pe-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                  {t("العقار", "Property")}
                </label>
                <select value={filters.property} onChange={e => setFilters({...filters, property: e.target.value})}
                  className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none">
                  <option value="all">{t("كافة العقارات", "All Properties")}</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button onClick={() => handleDownload("excel")} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                {t("تصدير Excel", "Export Excel")}
              </button>
              <button onClick={() => handleDownload("pdf")} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-bold transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePieChart className="w-4 h-4" />}
                {t("تصدير PDF", "Export PDF")}
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
            {t(
              "سيتم إنشاء التقرير بناءً على الفلاتر المحددة. قد يستغرق بضع ثوانٍ.",
              "The report will be generated based on the selected filters. This may take a few seconds."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
