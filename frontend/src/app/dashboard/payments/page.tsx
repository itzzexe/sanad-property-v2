"use client";

import { useState, useEffect } from "react";
import {
  CreditCard, Plus, Search, Eye, X,
  Loader2, Paperclip,
  Building2, Users, Calendar, DollarSign
} from "lucide-react";
import { AttachmentManager } from "@/components/shared/attachment-manager";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { toast } from "sonner";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const PAYMENT_METHODS = ["CASH","BANK_TRANSFER","CHEQUE","CARD","ONLINE"];

const statusStyle: Record<string, string> = {
  COMPLETED: "badge-success",
  PARTIAL:   "badge-warning",
  PENDING:   "badge-info",
  FAILED:    "badge-danger",
};
const statusLabel: Record<string, { ar: string; en: string }> = {
  COMPLETED: { ar: "مكتمل",  en: "Completed" },
  PARTIAL:   { ar: "جزئي",   en: "Partial"   },
  PENDING:   { ar: "معلّق",  en: "Pending"   },
  FAILED:    { ar: "فاشل",   en: "Failed"    },
};
const methodLabel: Record<string, string> = {
  CASH:"نقدي", BANK_TRANSFER:"تحويل بنكي", CHEQUE:"شيك", CARD:"بطاقة", ONLINE:"إلكتروني",
};

export default function PaymentsPage() {
  const { language, dir } = useLanguage();
  const { format }        = useCurrency();

  const [payments,     setPayments]     = useState<any[]>([]);
  const [leases,       setLeases]       = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilt,   setStatusFilt]   = useState("ALL");
  const [viewing,      setViewing]      = useState<any>(null);
  const [showModal,    setShowModal]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [attachItem,   setAttachItem]   = useState<any>(null);

  const emptyForm = {
    leaseId:"", installmentId:"", amount:0, currency:"USD",
    method:"CASH", paidDate: new Date().toISOString().split("T")[0], notes:"",
  };
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    try {
      const [p, l] = await Promise.all([
        api.get(`/payments?search=${encodeURIComponent(search)}&limit=50`),
        api.get("/leases?status=ACTIVE&limit=100"),
      ]);
      setPayments(p.data ?? []);
      setLeases(l.data ?? []);
    } catch { setPayments([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const loadInstallments = async (leaseId: string) => {
    if (!leaseId) { setInstallments([]); return; }
    try {
      const res = await api.get(`/installments?leaseId=${leaseId}&status=PENDING,OVERDUE,PARTIALLY_PAID&limit=50`);
      setInstallments(res.data ?? []);
    } catch { setInstallments([]); }
  };

  const filtered = payments.filter(p => statusFilt === "ALL" || p.status === statusFilt);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/payments", form);
      setShowModal(false); setForm({ ...emptyForm }); load();
    } catch (err: any) { toast.error(err?.response?.data?.message ?? err.message); }
    finally { setSaving(false); }
  };

  const inp = "w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  const totalRevenue = filtered.filter(p => p.status === "COMPLETED").reduce((s, p) => s + Number(p.amount ?? 0), 0);

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {language === "ar" ? "المدفوعات" : "Payments"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${filtered.length} ${language === "ar" ? "معاملة" : "transactions"}`}
          </p>
        </div>
        <button onClick={() => { setForm({ ...emptyForm }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all self-start">
          <Plus className="w-4 h-4" />
          {language === "ar" ? "تسجيل دفعة" : "Record Payment"}
        </button>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: language==="ar"?"إجمالي المحصّل":"Total Collected",  value: format(totalRevenue),            color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" },
            { label: language==="ar"?"مكتملة":"Completed",               value: payments.filter(p=>p.status==="COMPLETED").length, color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" },
            { label: language==="ar"?"جزئية":"Partial",                  value: payments.filter(p=>p.status==="PARTIAL").length,   color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" },
            { label: language==="ar"?"إجمالي المعاملات":"Total Txns",    value: payments.length,                  color: "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400" },
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
            placeholder={language === "ar" ? "ابحث برقم الدفعة..." : "Search by payment number..."}
            className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
        <select value={statusFilt} onChange={e => setStatusFilt(e.target.value)}
          className="h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm font-medium focus:outline-none min-w-[130px]">
          <option value="ALL">{language === "ar" ? "كل الحالات" : "All Status"}</option>
          {Object.keys(statusLabel).map(s => (
            <option key={s} value={s}>{statusLabel[s][language as "ar"|"en"]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_,i) => <Sk key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <CreditCard className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {language === "ar" ? "لا توجد مدفوعات بعد" : "No payments yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "الدفعة" : "Payment"}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "المستأجر / الوحدة" : "Tenant / Unit"}</th>
                <th>{language === "ar" ? "المبلغ" : "Amount"}</th>
                <th>{language === "ar" ? "طريقة الدفع" : "Method"}</th>
                <th>{language === "ar" ? "التاريخ" : "Date"}</th>
                <th>{language === "ar" ? "الحالة" : "Status"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">{p.paymentNumber}</span>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                        {p.lease?.tenant?.firstName} {p.lease?.tenant?.lastName}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {p.lease?.unit?.unitNumber} — {p.lease?.unit?.property?.name}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-white">{format(Number(p.amount))}</p>
                      {Number(p.lateFee ?? 0) > 0 && (
                        <p className="text-[10px] text-red-500 font-semibold">+{format(Number(p.lateFee))} {language==="ar"?"غرامة":"late fee"}</p>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      {language === "ar" ? (methodLabel[p.method] ?? p.method) : p.method}
                    </span>
                  </td>
                  <td className="text-xs text-neutral-500">
                    {p.paidDate ? new Date(p.paidDate).toLocaleDateString("ar-IQ") : "—"}
                  </td>
                  <td>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", statusStyle[p.status] ?? "badge-neutral")}>
                      {statusLabel[p.status]?.[language as "ar"|"en"] ?? p.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewing(p)} className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setAttachItem(p)} className="p-1.5 rounded-lg text-neutral-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors">
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-md border border-neutral-100 dark:border-neutral-800 flex flex-col overflow-hidden max-h-[calc(100dvh-2rem)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
              <h2 className="font-bold text-neutral-900 dark:text-white">
                {language === "ar" ? "تسجيل دفعة جديدة" : "Record New Payment"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form id="payment-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "العقد *" : "Lease *"}</label>
                <select required value={form.leaseId} onChange={e => { setForm({ ...form, leaseId: e.target.value, installmentId:"" }); loadInstallments(e.target.value); }} className={inp}>
                  <option value="">{language === "ar" ? "اختر العقد..." : "Select lease..."}</option>
                  {leases.map((l: any) => (
                    <option key={l.id} value={l.id}>
                      {l.tenant?.firstName} {l.tenant?.lastName} — {l.unit?.unitNumber}
                    </option>
                  ))}
                </select>
              </div>
              {installments.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "القسط (اختياري)" : "Installment (optional)"}</label>
                  <select value={form.installmentId} onChange={e => setForm({ ...form, installmentId: e.target.value })} className={inp}>
                    <option value="">{language === "ar" ? "بدون قسط محدد" : "No specific installment"}</option>
                    {installments.map((i: any) => (
                      <option key={i.id} value={i.id}>
                        {new Date(i.dueDate).toLocaleDateString()} — {format(Number(i.amount))} [{i.status}]
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "المبلغ *" : "Amount *"}</label>
                  <input type="number" min="0" required value={form.amount || ""} onChange={e => setForm({ ...form, amount: +e.target.value })} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "العملة" : "Currency"}</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className={inp}>
                    <option value="USD">USD</option>
                    <option value="IQD">IQD</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "طريقة الدفع" : "Method"}</label>
                  <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} className={inp}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{language==="ar"?(methodLabel[m]??m):m}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "تاريخ الدفع" : "Payment Date"}</label>
                  <input type="date" value={form.paidDate} onChange={e => setForm({ ...form, paidDate: e.target.value })} className={inp} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "ملاحظات" : "Notes"}</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className={inp + " h-auto resize-none py-2"} />
              </div>
            </form>
            <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex-shrink-0">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button type="submit" form="payment-form" disabled={saving}
                className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {language === "ar" ? "تسجيل الدفعة" : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-md border border-neutral-100 dark:border-neutral-800 flex flex-col overflow-hidden max-h-[calc(100dvh-2rem)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
              <div>
                <h2 className="font-bold text-neutral-900 dark:text-white">{language === "ar" ? "تفاصيل الدفعة" : "Payment Details"}</h2>
                <p className="font-mono text-xs text-blue-600 mt-0.5">{viewing.paymentNumber}</p>
              </div>
              <button onClick={() => setViewing(null)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="space-y-2 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                {[
                  { icon: Users,      label: language==="ar"?"المستأجر":"Tenant", value: `${viewing.lease?.tenant?.firstName} ${viewing.lease?.tenant?.lastName}` },
                  { icon: Building2,  label: language==="ar"?"الوحدة":"Unit",    value: `${viewing.lease?.unit?.unitNumber} — ${viewing.lease?.unit?.property?.name}` },
                  { icon: DollarSign, label: language==="ar"?"المبلغ":"Amount",  value: format(Number(viewing.amount)) },
                  { icon: CreditCard, label: language==="ar"?"الطريقة":"Method", value: language==="ar"?(methodLabel[viewing.method]??viewing.method):viewing.method },
                  { icon: Calendar,   label: language==="ar"?"التاريخ":"Date",   value: viewing.paidDate ? new Date(viewing.paidDate).toLocaleDateString() : "—" },
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
              {viewing.notes && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3">{viewing.notes}</p>
              )}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex-shrink-0">
              <button onClick={() => { setAttachItem(viewing); setViewing(null); }}
                className="flex items-center gap-2 px-4 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <Paperclip className="w-4 h-4" />
                {language === "ar" ? "المرفقات" : "Attachments"}
              </button>
              <button onClick={() => setViewing(null)}
                className="flex-1 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                {language === "ar" ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachments Modal */}
      {attachItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAttachItem(null)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-lg border border-neutral-100 dark:border-neutral-800 flex flex-col overflow-hidden max-h-[calc(100dvh-2rem)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
              <div>
                <h2 className="font-bold text-neutral-900 dark:text-white">{language === "ar" ? "مرفقات الدفعة" : "Payment Attachments"}</h2>
                <p className="font-mono text-xs text-blue-600 mt-0.5">{attachItem.paymentNumber}</p>
              </div>
              <button onClick={() => setAttachItem(null)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <AttachmentManager entityType="PAYMENT" entityId={attachItem.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
