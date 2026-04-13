"use client";

import { useState } from "react";
import {
  FileText, Search, Loader2, AlertTriangle,
  TrendingUp, TrendingDown, Scale, CheckCircle2,
  CalendarDays, Download
} from "lucide-react";
import { api } from "@/lib/api";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

export default function VatReturnPage() {
  const { language, dir } = useLanguage();
  const { format } = useCurrency();
  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  const now   = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(first);
  const [endDate,   setEndDate]   = useState(last);
  const [data,      setData]      = useState<any>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleFetch = async () => {
    if (!startDate || !endDate) return;
    setLoading(true); setError(""); setData(null);
    try {
      const res = await api.get(`/tax/vat-return?startDate=${startDate}&endDate=${endDate}`);
      setData((res as any)?.data ?? res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? t("حدث خطأ", "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  const netVat = data ? (Number(data.outputVat ?? 0) - Number(data.inputVat ?? 0)) : 0;

  return (
    <div className={cn("space-y-5 page-enter pb-10", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {t("إقرار ضريبة القيمة المضافة", "VAT Return")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t("احسب ضريبة القيمة المضافة المستحقة لأي فترة", "Calculate VAT liability for any period")}
          </p>
        </div>
        {data && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> {t("تصدير", "Export")}
          </button>
        )}
      </div>

      {/* Period Selector */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-black text-neutral-700 dark:text-neutral-200">{t("الفترة الزمنية", "Reporting Period")}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">{t("من تاريخ", "From")}</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls + " w-full"} dir="ltr" />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">{t("إلى تاريخ", "To")}</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls + " w-full"} dir="ltr" />
          </div>
          <button
            onClick={handleFetch}
            disabled={loading || !startDate || !endDate}
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-colors whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {t("احتساب", "Calculate")}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 text-sm font-semibold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Sk key={i} className="h-28" />)}
        </div>
      )}

      {data && !loading && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("ضريبة المبيعات (مخرجات)", "Output VAT")}</span>
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{format(Number(data.outputVat ?? 0))}</p>
              <p className="text-xs text-neutral-400 mt-1">{t("ضريبة مستحقة للحكومة", "Tax owed to gov")}</p>
            </div>

            <div className="p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("ضريبة المشتريات (مدخلات)", "Input VAT")}</span>
              </div>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{format(Number(data.inputVat ?? 0))}</p>
              <p className="text-xs text-neutral-400 mt-1">{t("ضريبة قابلة للاسترداد", "Reclaimable")}</p>
            </div>

            <div className={cn("p-5 rounded-xl border shadow-card",
              netVat >= 0
                ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40")}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",
                  netVat >= 0 ? "bg-amber-100 dark:bg-amber-950/40" : "bg-emerald-100 dark:bg-emerald-950/40")}>
                  <Scale className={cn("w-4 h-4", netVat >= 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")} />
                </div>
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("صافي الضريبة", "Net VAT")}</span>
              </div>
              <p className={cn("text-2xl font-black", netVat >= 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                {netVat >= 0 ? "" : "+"}{format(Math.abs(netVat))}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {netVat >= 0 ? t("مستحق الدفع للحكومة", "Payable to government") : t("مستحق الاسترداد", "Refund due")}
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          {data.transactions && data.transactions.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider">
                  {t("تفاصيل المعاملات الضريبية", "Tax Transaction Details")} ({data.transactions.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <th className="text-start p-4 text-[10px] font-black text-neutral-400 uppercase">{t("التاريخ", "Date")}</th>
                      <th className="text-start p-4 text-[10px] font-black text-neutral-400 uppercase">{t("الوصف", "Description")}</th>
                      <th className="text-start p-4 text-[10px] font-black text-neutral-400 uppercase">{t("النوع", "Type")}</th>
                      <th className="text-end p-4 text-[10px] font-black text-neutral-400 uppercase">{t("المبلغ الخاضع", "Taxable Amount")}</th>
                      <th className="text-end p-4 text-[10px] font-black text-neutral-400 uppercase">{t("الضريبة", "Tax")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                    {data.transactions.map((tx: any, i: number) => (
                      <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                        <td className="p-4 text-xs text-neutral-500">
                          {new Date(tx.date).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-GB")}
                        </td>
                        <td className="p-4 font-medium text-neutral-700 dark:text-neutral-300 max-w-[240px] truncate">
                          {tx.description}
                        </td>
                        <td className="p-4">
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                            tx.isInput
                              ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                              : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400")}>
                            {tx.isInput ? t("مدخلات", "Input") : t("مخرجات", "Output")}
                          </span>
                        </td>
                        <td className="p-4 text-end font-mono tabular-nums font-bold text-neutral-800 dark:text-neutral-100">
                          {format(Number(tx.taxableAmount ?? 0))}
                        </td>
                        <td className="p-4 text-end font-mono tabular-nums font-black text-neutral-900 dark:text-white">
                          {format(Number(tx.taxAmount ?? 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-t-2 border-neutral-200 dark:border-neutral-700">
                      <td colSpan={3} className="p-4 text-end text-xs font-black uppercase text-neutral-500">{t("الإجمالي", "Total")}</td>
                      <td className="p-4 text-end font-mono font-black text-neutral-900 dark:text-white">
                        {format(data.transactions.reduce((s: number, tx: any) => s + Number(tx.taxableAmount ?? 0), 0))}
                      </td>
                      <td className="p-4 text-end font-mono font-black text-neutral-900 dark:text-white">
                        {format(Number(data.outputVat ?? 0) + Number(data.inputVat ?? 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Net Summary Banner */}
          <div className={cn("flex items-center justify-between gap-4 p-5 rounded-xl border",
            netVat >= 0
              ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50"
              : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50")}>
            <div className="flex items-center gap-3">
              {netVat >= 0
                ? <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                : <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
              <div>
                <p className={cn("text-sm font-black", netVat >= 0 ? "text-amber-800 dark:text-amber-300" : "text-emerald-800 dark:text-emerald-300")}>
                  {netVat >= 0
                    ? t("يوجد ضريبة مستحقة الدفع", "VAT payment due")
                    : t("يستحق استرداد ضريبي", "VAT refund due")}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {new Date(startDate).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-GB")}
                  {" — "}
                  {new Date(endDate).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-GB")}
                </p>
              </div>
            </div>
            <p className={cn("text-2xl font-black font-mono tabular-nums",
              netVat >= 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
              {format(Math.abs(netVat))}
            </p>
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {t("اختر فترة واضغط احتساب لعرض الإقرار", "Select a period and click Calculate")}
          </p>
        </div>
      )}
    </div>
  );
}
