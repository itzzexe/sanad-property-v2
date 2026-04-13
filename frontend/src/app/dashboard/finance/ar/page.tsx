"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet, Clock, Receipt, ArrowRight,
  TrendingUp, AlertCircle, Users, ChevronDown
} from "lucide-react";
import { financeApi } from "@/lib/api/finance";
import { api } from "@/lib/api";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-xl", className)} />
);

export default function AccountsReceivablePage() {
  const { language, dir } = useLanguage();
  const { format } = useCurrency();
  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  const [tenants,   setTenants]   = useState<any[]>([]);
  const [selected,  setSelected]  = useState("");
  const [statement, setStatement] = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [stmtLoad,  setStmtLoad]  = useState(false);

  useEffect(() => {
    api.get("/tenants")
      .then((res: any) => {
        const list = res.data ?? res ?? [];
        setTenants(list);
        if (list.length > 0) {
          setSelected(list[0].id);
        }
      })
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setStmtLoad(true);
    financeApi.getTenantStatement(selected, {})
      .then((data: any) => setStatement(data))
      .catch(() => setStatement(null))
      .finally(() => setStmtLoad(false));
  }, [selected]);

  const fmt = (n: number) => format(n ?? 0);

  // Derive KPIs from all tenant statements would require N calls — use single tenant for now
  const balance      = statement?.closingBalance ?? 0;
  const overdueLines = (statement?.lines ?? []).filter((l: any) => l.daysOverdue > 0);
  const overdueAmt   = overdueLines.reduce((s: number, l: any) => s + Number(l.runningBalance ?? 0), 0);

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {t("حسابات القبض", "Accounts Receivable")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${tenants.length} ${t("مستأجر", "tenants")}`}
          </p>
        </div>
        <Link href="/dashboard/finance/reports/ar-aging"
          className="flex items-center gap-2 h-9 px-4 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <TrendingUp className="w-3.5 h-3.5" /> {t("تقرير التقادم", "Aging Report")}
        </Link>
      </div>

      {/* Tenant Selector */}
      <div className="relative max-w-sm">
        <Users className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-8 text-sm font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none"
        >
          {tenants.map((tn: any) => (
            <option key={tn.id} value={tn.id}>
              {tn.firstName} {tn.lastName}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>

      {/* KPI Cards */}
      {loading || stmtLoad ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Sk key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("إجمالي المستحق", "Total Outstanding")}</span>
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{fmt(balance)}</p>
            <p className="text-xs text-neutral-400 mt-1">{statement?.tenant?.firstName} {statement?.tenant?.lastName}</p>
          </div>
          <div className="p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("متأخرات", "Overdue")}</span>
            </div>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{fmt(Math.abs(overdueAmt))}</p>
            <p className="text-xs text-neutral-400 mt-1">{overdueLines.length} {t("حركة متأخرة", "overdue entries")}</p>
          </div>
          <div className="p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("عدد الحركات", "Transactions")}</span>
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{(statement?.lines ?? []).length}</p>
            <p className="text-xs text-neutral-400 mt-1">{t("في كشف الحساب", "in statement")}</p>
          </div>
        </div>
      )}

      {/* Statement Lines */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider">
            {t("كشف حساب المستأجر", "Tenant Statement")}
          </h3>
          {statement && (
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
              {t("الرصيد الختامي:", "Closing Balance:")}
              <span className={cn("ms-1.5 font-black", balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                {fmt(balance)}
              </span>
            </span>
          )}
        </div>

        {stmtLoad ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Sk key={i} className="h-10" />)}</div>
        ) : !statement || (statement.lines ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Clock className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-semibold text-neutral-400">{t("لا توجد حركات لهذا المستأجر", "No transactions for this tenant")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                  <th className="text-start p-4 text-[10px] font-black text-neutral-400 uppercase tracking-wider">{t("التاريخ", "Date")}</th>
                  <th className="text-start p-4 text-[10px] font-black text-neutral-400 uppercase tracking-wider">{t("الوصف", "Description")}</th>
                  <th className="text-end p-4 text-[10px] font-black text-neutral-400 uppercase tracking-wider">{t("مدين", "Debit")}</th>
                  <th className="text-end p-4 text-[10px] font-black text-neutral-400 uppercase tracking-wider">{t("دائن", "Credit")}</th>
                  <th className="text-end p-4 text-[10px] font-black text-neutral-400 uppercase tracking-wider">{t("الرصيد", "Balance")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {statement.lines.map((line: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="p-4 text-xs text-neutral-500">
                      {new Date(line.date).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-GB")}
                    </td>
                    <td className="p-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 max-w-[240px] truncate">
                      {line.description}
                    </td>
                    <td className="p-4 text-end font-mono tabular-nums text-sm font-bold text-neutral-800 dark:text-neutral-100">
                      {line.debit > 0 ? format(line.debit) : "—"}
                    </td>
                    <td className="p-4 text-end font-mono tabular-nums text-sm text-neutral-400 italic">
                      {line.credit > 0 ? format(line.credit) : "—"}
                    </td>
                    <td className={cn("p-4 text-end font-mono tabular-nums text-sm font-black",
                      line.runningBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                      {format(Math.abs(line.runningBalance ?? 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/finance/accounts-receivable"
          className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-black text-neutral-800 dark:text-white">{t("كشوف المستأجرين", "Tenant Statements")}</p>
              <p className="text-[11px] text-neutral-400">{t("عرض تفصيلي", "Detailed view")}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
        </Link>
        <Link href="/dashboard/finance/reports/ar-aging"
          className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-black text-neutral-800 dark:text-white">{t("تقرير التقادم", "AR Aging")}</p>
              <p className="text-[11px] text-neutral-400">{t("30/60/90+ يوم", "30/60/90+ days")}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
