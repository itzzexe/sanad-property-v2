"use client";

import { useState, useEffect } from "react";
import {
  Calendar, Search, Eye, X,
  CheckCircle2, Clock, AlertTriangle,
  Building2, Users, DollarSign, CreditCard
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const statusStyle: Record<string, string> = {
  PENDING:        "badge-warning",
  PAID:           "badge-success",
  OVERDUE:        "badge-danger",
  PARTIALLY_PAID: "badge-info",
};
const statusLabel: Record<string, { ar: string; en: string }> = {
  PENDING:        { ar: "معلّق",    en: "Pending"       },
  PAID:           { ar: "مدفوع",   en: "Paid"          },
  OVERDUE:        { ar: "متأخر",   en: "Overdue"       },
  PARTIALLY_PAID: { ar: "مدفوع جزئياً", en: "Partially Paid" },
};
const statusIcon: Record<string, any> = {
  PENDING: Clock, PAID: CheckCircle2, OVERDUE: AlertTriangle, PARTIALLY_PAID: Clock,
};

export default function InstallmentsPage() {
  const { language, dir } = useLanguage();
  const { format }        = useCurrency();

  const [installments, setInstallments] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilt,   setStatusFilt]   = useState("ALL");
  const [viewing,      setViewing]      = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (statusFilt !== "ALL") params.set("status", statusFilt);
      const res = await api.get(`/installments?${params}`);
      setInstallments(res.data ?? []);
    } catch { setInstallments([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, statusFilt]);

  const totalPending  = installments.filter(i => i.status === "PENDING" || i.status === "OVERDUE").reduce((s, i) => s + Number(i.amount ?? 0), 0);
  const totalOverdue  = installments.filter(i => i.status === "OVERDUE").length;
  const totalPaid     = installments.filter(i => i.status === "PAID").length;

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          {language === "ar" ? "الأقساط" : "Installments"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {loading ? "..." : `${installments.length} ${language === "ar" ? "قسط" : "installments"}`}
        </p>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: language==="ar"?"إجمالي المستحق":"Total Due",     value: format(totalPending),  color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" },
            { label: language==="ar"?"متأخرة":"Overdue",               value: totalOverdue,           color: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400" },
            { label: language==="ar"?"مدفوعة":"Paid",                  value: totalPaid,              color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" },
            { label: language==="ar"?"الإجمالي":"Total",               value: installments.length,    color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" },
          ].map((s, i) => (
            <div key={i} className={cn("px-4 py-3 rounded-xl", s.color)}>
              <p className="text-[11px] font-semibold opacity-70 uppercase tracking-wide">{s.label}</p>
              <p className="text-lg font-black mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={language === "ar" ? "بحث..." : "Search..."}
            className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
        <select value={statusFilt} onChange={e => setStatusFilt(e.target.value)}
          className="h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm font-medium focus:outline-none min-w-[140px]">
          <option value="ALL">{language === "ar" ? "كل الحالات" : "All Status"}</option>
          {Object.keys(statusLabel).map(s => (
            <option key={s} value={s}>{statusLabel[s][language as "ar"|"en"]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_,i) => <Sk key={i} className="h-14" />)}</div>
      ) : installments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <Calendar className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {language === "ar" ? "لا توجد أقساط" : "No installments found"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "تاريخ الاستحقاق" : "Due Date"}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "المستأجر / الوحدة" : "Tenant / Unit"}</th>
                <th>{language === "ar" ? "المبلغ" : "Amount"}</th>
                <th>{language === "ar" ? "المدفوع" : "Paid"}</th>
                <th>{language === "ar" ? "الحالة" : "Status"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {installments.map((inst: any) => {
                const StatusIcon = statusIcon[inst.status] ?? Clock;
                const isOverdue  = inst.status === "OVERDUE";
                return (
                  <tr key={inst.id} className={isOverdue ? "bg-red-50/30 dark:bg-red-950/10" : ""}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Calendar className={cn("w-3.5 h-3.5 flex-shrink-0", isOverdue ? "text-red-500" : "text-neutral-400")} />
                        <span className={cn("text-sm font-semibold", isOverdue ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-white")}>
                          {new Date(inst.dueDate).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {inst.lease?.tenant?.firstName} {inst.lease?.tenant?.lastName}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {inst.lease?.unit?.unitNumber} — {inst.lease?.unit?.property?.name}
                        </p>
                      </div>
                    </td>
                    <td className="font-bold text-neutral-900 dark:text-white">{format(Number(inst.amount))}</td>
                    <td>
                      <div className="text-xs">
                        <p className="font-bold text-emerald-600">{format(Number(inst.paidAmount ?? 0))}</p>
                        {Number(inst.paidAmount ?? 0) < Number(inst.amount) && (
                          <p className="text-neutral-400">{language==="ar"?"متبقي:":"rem:"} {format(Number(inst.amount) - Number(inst.paidAmount ?? 0))}</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border", statusStyle[inst.status] ?? "badge-neutral")}>
                        <StatusIcon className="w-3 h-3" />
                        {statusLabel[inst.status]?.[language as "ar"|"en"] ?? inst.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => setViewing(inst)} className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-md border border-neutral-100 dark:border-neutral-800 scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-bold text-neutral-900 dark:text-white">{language === "ar" ? "تفاصيل القسط" : "Installment Details"}</h2>
              <button onClick={() => setViewing(null)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="space-y-2 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                {[
                  { icon: Users,      label: language==="ar"?"المستأجر":"Tenant",    value: `${viewing.lease?.tenant?.firstName} ${viewing.lease?.tenant?.lastName}` },
                  { icon: Building2,  label: language==="ar"?"الوحدة":"Unit",       value: `${viewing.lease?.unit?.unitNumber} — ${viewing.lease?.unit?.property?.name}` },
                  { icon: Calendar,   label: language==="ar"?"الاستحقاق":"Due Date", value: new Date(viewing.dueDate).toLocaleDateString() },
                  { icon: DollarSign, label: language==="ar"?"المبلغ":"Amount",     value: format(Number(viewing.amount)) },
                  { icon: CreditCard, label: language==="ar"?"المدفوع":"Paid",      value: format(Number(viewing.paidAmount ?? 0)) },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
                    <row.icon className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-neutral-400 font-semibold uppercase">{row.label}</p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {Number(viewing.lateFee ?? 0) > 0 && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
                  <p className="text-xs font-bold text-red-600">{language==="ar"?"غرامة التأخير":"Late Fee"}: {format(Number(viewing.lateFee))}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
