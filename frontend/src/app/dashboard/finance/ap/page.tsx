"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard, Hammer, Building, Plus,
  ArrowRight, AlertCircle, CheckCircle2, Clock, Users
} from "lucide-react";
import { financeApi } from "@/lib/api/finance";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-xl", className)} />
);

const STATUS_COLOR: Record<string, string> = {
  DRAFT:          "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
  OPEN:           "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  PARTIALLY_PAID: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
  PAID:           "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  VOIDED:         "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",
};

const STATUS_LABEL: Record<string, { ar: string; en: string }> = {
  DRAFT:          { ar: "مسودة",    en: "Draft" },
  OPEN:           { ar: "مفتوحة",   en: "Open" },
  PARTIALLY_PAID: { ar: "جزئية",    en: "Partial" },
  PAID:           { ar: "مدفوعة",   en: "Paid" },
  VOIDED:         { ar: "ملغاة",    en: "Voided" },
};

export default function AccountsPayablePage() {
  const { language, dir } = useLanguage();
  const { format } = useCurrency();
  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  const [bills,   setBills]   = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      financeApi.getBills().catch(() => []),
      financeApi.getVendors().catch(() => []),
    ]).then(([b, v]) => {
      setBills(Array.isArray(b) ? b : (b as any)?.data ?? []);
      setVendors(Array.isArray(v) ? v : (v as any)?.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const unpaid     = bills.filter(b => ["OPEN","PARTIALLY_PAID","DRAFT"].includes(b.status));
  const totalUnpaid = unpaid.reduce((s, b) => s + Number(b.totalAmount ?? 0), 0);
  const overdue = bills.filter(b => b.status === "OPEN" && new Date(b.dueDate) < new Date());

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {t("حسابات الدفع", "Accounts Payable")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${bills.length} ${t("فاتورة", "bills")} · ${vendors.length} ${t("مورّد", "vendors")}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/finance/accounts-payable/vendors"
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <Users className="w-3.5 h-3.5" /> {t("الموردون", "Vendors")}
          </Link>
          <Link href="/dashboard/finance/accounts-payable/bills/new"
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
            <Plus className="w-3.5 h-3.5" /> {t("فاتورة جديدة", "New Bill")}
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Sk key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                <CreditCard className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("فواتير غير مدفوعة", "Unpaid Bills")}</span>
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{format(totalUnpaid)}</p>
            <p className="text-xs text-neutral-400 mt-1">{unpaid.length} {t("فاتورة مفتوحة", "open bills")}</p>
          </div>
          <div className="p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                <AlertCircle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("متأخرة السداد", "Overdue")}</span>
            </div>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {format(overdue.reduce((s, b) => s + Number(b.totalAmount ?? 0), 0))}
            </p>
            <p className="text-xs text-neutral-400 mt-1">{overdue.length} {t("فاتورة متأخرة", "overdue bills")}</p>
          </div>
          <div className="p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                <Hammer className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("عدد الموردين", "Vendors")}</span>
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{vendors.length}</p>
            <p className="text-xs text-neutral-400 mt-1">{vendors.filter((v: any) => v.isActive).length} {t("نشط", "active")}</p>
          </div>
        </div>
      )}

      {/* Recent Bills */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider">{t("آخر الفواتير", "Recent Bills")}</h3>
          <Link href="/dashboard/finance/accounts-payable/bills"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
            {t("عرض الكل", "View all")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <Sk key={i} className="h-12" />)}</div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Building className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-semibold text-neutral-400">{t("لا توجد فواتير", "No bills yet")}</p>
            <Link href="/dashboard/finance/accounts-payable/bills/new"
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
              <Plus className="w-3.5 h-3.5" /> {t("أضف أول فاتورة", "Add first bill")}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
            {bills.slice(0, 6).map((bill: any) => (
              <Link key={bill.id} href={`/dashboard/finance/accounts-payable/bills/${bill.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{bill.billNumber}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{bill.vendor?.name ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STATUS_COLOR[bill.status] ?? STATUS_COLOR.DRAFT)}>
                    {STATUS_LABEL[bill.status]?.[language as "ar"|"en"] ?? bill.status}
                  </span>
                  <p className="text-sm font-black text-neutral-900 dark:text-white font-mono tabular-nums">
                    {format(Number(bill.totalAmount ?? 0))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/finance/accounts-payable/bills"
          className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-black text-neutral-800 dark:text-white">{t("جميع الفواتير", "All Bills")}</p>
              <p className="text-[11px] text-neutral-400">{bills.length} {t("فاتورة", "total")}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
        </Link>
        <Link href="/dashboard/finance/accounts-payable/vendors"
          className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-black text-neutral-800 dark:text-white">{t("الموردون", "Vendors")}</p>
              <p className="text-[11px] text-neutral-400">{vendors.length} {t("مورّد", "registered")}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
