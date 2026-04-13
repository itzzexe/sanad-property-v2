"use client";

import { useState, useEffect } from "react";
import {
  Clock, AlertTriangle, RefreshCcw, Building2
} from "lucide-react";
import { api } from "@/lib/api";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

interface AgingRow {
  vendorId: string;
  vendorName: string;
  current: number;
  "1-30": number;
  "30-60": number;
  "60-90": number;
  "90+": number;
  total: number;
}

export default function ApAgingPage() {
  const { language, dir } = useLanguage();
  const { format } = useCurrency();
  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  const [rows,    setRows]    = useState<AgingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [asOf,    setAsOf]    = useState(new Date().toISOString().split("T")[0]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ap/aging?asOfDate=${asOf}`);
      setRows((res as any)?.data ?? res ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [asOf]);

  // Column totals
  const totals = rows.reduce(
    (acc, r) => ({
      current: acc.current + r.current,
      "1-30":  acc["1-30"]  + r["1-30"],
      "30-60": acc["30-60"] + r["30-60"],
      "60-90": acc["60-90"] + r["60-90"],
      "90+":   acc["90+"]   + r["90+"],
      total:   acc.total    + r.total,
    }),
    { current: 0, "1-30": 0, "30-60": 0, "60-90": 0, "90+": 0, total: 0 }
  );

  const buckets: { key: keyof AgingRow; label: string; color: string }[] = [
    { key: "current", label: t("حالي",    "Current"),  color: "text-neutral-600 dark:text-neutral-400" },
    { key: "1-30",    label: "1–30",                   color: "text-amber-600 dark:text-amber-400" },
    { key: "30-60",   label: "31–60",                  color: "text-orange-600 dark:text-orange-400" },
    { key: "60-90",   label: "61–90",                  color: "text-red-600 dark:text-red-400" },
    { key: "90+",     label: "90+",                    color: "text-rose-700 dark:text-rose-400" },
    { key: "total",   label: t("الإجمالي", "Total"),   color: "text-neutral-900 dark:text-white" },
  ];

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {t("أعمار ديون الموردين", "AP Aging Report")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t("تصنيف الفواتير المعلقة حسب مدة التأخير", "Outstanding bills classified by overdue duration")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
              {t("بتاريخ:", "As of:")}
            </label>
            <input
              type="date"
              value={asOf}
              onChange={e => setAsOf(e.target.value)}
              dir="ltr"
              className="h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            {t("تحديث", "Refresh")}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => <Sk key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {buckets.filter(b => b.key !== "total").map(b => (
            <div key={b.key} className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card">
              <p className={cn("text-[11px] font-bold uppercase tracking-widest mb-1", b.color)}>
                {b.label} {b.key !== "current" ? t("يوم", "days") : ""}
              </p>
              <p className={cn("text-lg font-black font-mono tabular-nums", b.color)}>
                {format(totals[b.key as keyof typeof totals] as number)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
          <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            {t("تفصيل بالمورد", "Breakdown by Vendor")}
            {!loading && <span className="font-mono font-bold text-neutral-500">({rows.length})</span>}
          </h3>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Sk key={i} className="h-11" />)}</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Building2 className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
            <p className="font-semibold text-neutral-400">
              {t("لا توجد فواتير معلقة حتى هذا التاريخ", "No outstanding bills as of this date")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <th className="text-start p-4 text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                    {t("المورّد", "Vendor")}
                  </th>
                  {buckets.map(b => (
                    <th key={b.key} className={cn("text-end p-4 text-[10px] font-black uppercase tracking-wider", b.color)}>
                      {b.label}{b.key !== "current" && b.key !== "total" ? ` ${t("يوم","d")}` : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {rows.map((row) => (
                  <tr key={row.vendorId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                        </div>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">{row.vendorName}</span>
                      </div>
                    </td>
                    {buckets.map(b => {
                      const val = row[b.key as keyof AgingRow] as number;
                      return (
                        <td key={b.key} className={cn(
                          "p-4 text-end font-mono tabular-nums",
                          b.key === "total" ? "font-black text-neutral-900 dark:text-white" : val > 0 ? b.color + " font-bold" : "text-neutral-300 dark:text-neutral-700"
                        )}>
                          {val > 0 ? format(val) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-t-2 border-neutral-200 dark:border-neutral-700">
                  <td className="p-4 text-xs font-black uppercase text-neutral-500">{t("الإجمالي الكلي", "Grand Total")}</td>
                  {buckets.map(b => (
                    <td key={b.key} className={cn("p-4 text-end font-mono tabular-nums font-black text-base", b.color)}>
                      {format(totals[b.key as keyof typeof totals] as number)}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Warning for overdue */}
      {!loading && (totals["30-60"] + totals["60-90"] + totals["90+"]) > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            {t(
              `يوجد ${format(totals["30-60"] + totals["60-90"] + totals["90+"])} من الفواتير المتأخرة أكثر من 30 يوماً`,
              `${format(totals["30-60"] + totals["60-90"] + totals["90+"])} in bills overdue by more than 30 days`
            )}
          </p>
        </div>
      )}
    </div>
  );
}
