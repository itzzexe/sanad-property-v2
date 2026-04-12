"use client";

import { useState, useEffect } from "react";
import { Receipt, Search, Download, Printer, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

export default function ReceiptsPage() {
  const { language, dir } = useLanguage();
  const { format }        = useCurrency();

  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    // Receipts are essentially completed/partial payments
    api.get("/payments?limit=200&status=COMPLETED")
      .then((res: any) => setReceipts(res.data ?? res ?? []))
      .catch(() => setReceipts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = receipts.filter((r: any) => {
    const name = `${r.lease?.tenant?.firstName ?? ""} ${r.lease?.tenant?.lastName ?? ""} ${r.lease?.unit?.unitNumber ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const total = filtered.reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {language === "ar" ? "سندات القبض" : "Receipts"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${filtered.length} ${language === "ar" ? "سند" : "receipts"}`}
          </p>
        </div>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: language === "ar" ? "إجمالي المقبوضات" : "Total Collected", value: format(total),      color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" },
            { label: language === "ar" ? "عدد السندات" : "Receipt Count",       value: filtered.length,    color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" },
            { label: language === "ar" ? "المدفوعات المكتملة" : "Completed",      value: receipts.length,    color: "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400" },
          ].map((s, i) => (
            <div key={i} className={cn("px-4 py-3 rounded-xl", s.color)}>
              <p className="text-[11px] font-semibold opacity-70 uppercase tracking-wide">{s.label}</p>
              <p className="text-lg font-black mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={language === "ar" ? "بحث..." : "Search..."}
          className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <Sk key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <Receipt className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {language === "ar" ? "لا توجد سندات قبض" : "No receipts found"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "رقم السند" : "Receipt #"}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "المستأجر / الوحدة" : "Tenant / Unit"}</th>
                <th>{language === "ar" ? "التاريخ" : "Date"}</th>
                <th>{language === "ar" ? "المبلغ" : "Amount"}</th>
                <th>{language === "ar" ? "طريقة الدفع" : "Method"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any, idx: number) => (
                <tr key={r.id}>
                  <td>
                    <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">
                      REC-{String(idx + 1).padStart(4, "0")}
                    </span>
                  </td>
                  <td>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                        {r.lease?.tenant?.firstName} {r.lease?.tenant?.lastName}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {r.lease?.unit?.unitNumber} — {r.lease?.unit?.property?.name}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      {new Date(r.paymentDate ?? r.createdAt).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US")}
                    </div>
                  </td>
                  <td className="font-bold text-emerald-600 dark:text-emerald-400">{format(Number(r.amount))}</td>
                  <td>
                    <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                      {r.paymentMethod ?? "—"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <button className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        title={language === "ar" ? "طباعة" : "Print"}>
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                        title={language === "ar" ? "تحميل" : "Download"}>
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
