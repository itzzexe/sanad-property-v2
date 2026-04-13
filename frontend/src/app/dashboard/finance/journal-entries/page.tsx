"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Search, RotateCcw, Eye, CheckCircle2, FileText, Loader2, Clock
} from "lucide-react";
import { financeApi } from "@/lib/api/finance";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const statusStyle: Record<string, string> = {
  POSTED:   "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  DRAFT:    "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
  REVERSED: "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
};

const sourceStyle: Record<string, string> = {
  PAYMENT: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  INVOICE: "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400",
  MANUAL:  "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
};

export default function JournalEntriesPage() {
  const { language, dir } = useLanguage();
  const { format }        = useCurrency();

  const [entries,        setEntries]        = useState<any[]>([]);
  const [pendingIds,     setPendingIds]     = useState<Set<string>>(new Set());
  const [loading,        setLoading]        = useState(true);
  const [filters, setFilters] = useState({
    search: "", status: "all", sourceType: "all", startDate: "", endDate: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [res, approvals] = await Promise.all([
        financeApi.getJournalEntries({
          status:     filters.status     !== "all" ? filters.status     : undefined,
          sourceType: filters.sourceType !== "all" ? filters.sourceType : undefined,
          startDate:  filters.startDate  || undefined,
          endDate:    filters.endDate    || undefined,
        }),
        api.get("/approvals?status=PENDING&type=JOURNAL_ENTRY").catch(() => ({ data: [] })),
      ]);
      setEntries(Array.isArray(res) ? res : (res as any).data ?? []);
      const pending = (approvals.data ?? approvals ?? []) as any[];
      setPendingIds(new Set(pending.map((a: any) => a.entityId)));
    } catch { setEntries([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters.status, filters.sourceType, filters.startDate, filters.endDate]);

  const filtered = entries.filter(e =>
    !filters.search ||
    e.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
    e.entryNumber?.toLowerCase().includes(filters.search.toLowerCase())
  );

  const stats = {
    posted:   entries.filter(e => e.status === "POSTED").length,
    draft:    entries.filter(e => e.status === "DRAFT").length,
    total:    entries.length,
  };

  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {t("قيود اليومية","Journal Entries")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${entries.length} ${t("قيد","entries")}`}
          </p>
        </div>
        <Link href="/dashboard/finance/journal-entries/new"
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
          <Plus className="w-4 h-4" />
          {t("قيد جديد","New Entry")}
        </Link>
      </div>

      {/* Stats strip */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
            <CheckCircle2 className="w-3 h-3" /> {t("مرحّلة","Posted")}: {stats.posted}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
            <FileText className="w-3 h-3" /> {t("مسودة","Draft")}: {stats.draft}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            <RotateCcw className="w-3 h-3" /> {t("الإجمالي","Total")}: {stats.total}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})}
              placeholder={t("بحث...","Search...")}
              className="w-full h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
          </div>
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
            className="h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none min-w-[130px]">
            <option value="all">{t("كل الحالات","All Status")}</option>
            <option value="DRAFT">{t("مسودة","Draft")}</option>
            <option value="POSTED">{t("مرحّلة","Posted")}</option>
            <option value="REVERSED">{t("معكوسة","Reversed")}</option>
          </select>
          <select value={filters.sourceType} onChange={e => setFilters({...filters, sourceType: e.target.value})}
            className="h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none min-w-[130px]">
            <option value="all">{t("كل المصادر","All Sources")}</option>
            <option value="MANUAL">{t("يدوي","Manual")}</option>
            <option value="PAYMENT">{t("دفعة","Payment")}</option>
            <option value="INVOICE">{t("فاتورة","Invoice")}</option>
          </select>
          <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})}
            className="h-9 w-36 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 text-xs font-medium focus:outline-none" />
          <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})}
            className="h-9 w-36 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 text-xs font-medium focus:outline-none" />
          <button onClick={() => setFilters({ search: "", status: "all", sourceType: "all", startDate: "", endDate: "" })}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold text-neutral-500 hover:text-blue-600 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> {t("إعادة تعيين","Reset")}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <Sk key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">{t("لا توجد قيود","No journal entries")}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{t("رقم القيد","Entry #")}</th>
                <th>{t("التاريخ","Date")}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{t("الوصف","Description")}</th>
                <th>{t("المصدر","Source")}</th>
                <th>{t("المدين","Debit")}</th>
                <th>{t("الدائن","Credit")}</th>
                <th>{t("الحالة","Status")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e: any) => {
                const debit  = (e.lines ?? []).reduce((s: number, l: any) => s + Number(l.debit  ?? 0), 0);
                const credit = (e.lines ?? []).reduce((s: number, l: any) => s + Number(l.credit ?? 0), 0);
                return (
                  <tr key={e.id}>
                    <td>
                      <Link href={`/dashboard/finance/journal-entries/${e.id}`}
                        className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                        {e.entryNumber}
                      </Link>
                    </td>
                    <td className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(e.date).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td className="text-sm text-neutral-700 dark:text-neutral-300 max-w-[200px] truncate">{e.description}</td>
                    <td>
                      <span className={cn("inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", sourceStyle[e.sourceType] ?? sourceStyle.MANUAL)}>
                        {e.sourceType}
                      </span>
                    </td>
                    <td className="font-mono text-sm font-bold text-neutral-900 dark:text-white">{format(debit)}</td>
                    <td className="font-mono text-sm text-neutral-400">{format(credit)}</td>
                    <td>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn("inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", statusStyle[e.status] ?? statusStyle.DRAFT)}>
                          {e.status}
                        </span>
                        {pendingIds.has(e.id) && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            <Clock className="w-2.5 h-2.5" />
                            {t("موافقة","Approval")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <Link href={`/dashboard/finance/journal-entries/${e.id}`}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors inline-flex">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
