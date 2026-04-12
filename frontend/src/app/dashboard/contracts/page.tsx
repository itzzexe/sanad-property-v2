"use client";

import { useState, useEffect } from "react";
import {
  FileText, Plus, Search, Trash2, Eye,
  Calendar, Building2, Users, DollarSign,
  Loader2, X, CheckCircle2, Clock, XCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const FREQ_OPTIONS = [
  { value: "MONTHLY",     ar: "شهري",    en: "Monthly"    },
  { value: "QUARTERLY",   ar: "ربع سنوي",en: "Quarterly"  },
  { value: "SEMI_ANNUAL", ar: "نصف سنوي",en: "Semi-Annual"},
  { value: "ANNUAL",      ar: "سنوي",    en: "Annual"     },
];

const leaseStatusStyle: Record<string, string> = {
  ACTIVE:    "badge-success",
  EXPIRED:   "badge-neutral",
  CANCELLED: "badge-danger",
  PENDING:   "badge-warning",
};
const leaseStatusIcon: Record<string, any> = {
  ACTIVE: CheckCircle2, EXPIRED: Clock, CANCELLED: XCircle, PENDING: Clock,
};
const leaseStatusLabel: Record<string, { ar: string; en: string }> = {
  ACTIVE:    { ar: "نشط",    en: "Active"    },
  EXPIRED:   { ar: "منتهي",  en: "Expired"   },
  CANCELLED: { ar: "ملغي",   en: "Cancelled" },
  PENDING:   { ar: "معلّق",  en: "Pending"   },
};

export default function ContractsPage() {
  const { language, dir } = useLanguage();
  const { format }        = useCurrency();

  const [leases,     setLeases]     = useState<any[]>([]);
  const [units,      setUnits]      = useState<any[]>([]);
  const [tenants,    setTenants]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [statusFilt, setStatusFilt] = useState("ALL");
  const [showModal,  setShowModal]  = useState(false);
  const [viewing,    setViewing]    = useState<any>(null);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState<string | null>(null);

  const emptyForm = {
    unitId:"", tenantId:"", startDate:"", endDate:"",
    rentAmount:0, currency:"USD", securityDeposit:0,
    paymentFrequency:"MONTHLY", lateFeePercent:5,
    lateFeeGraceDays:5, notes:"",
  };
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    try {
      const [l, u, t] = await Promise.all([
        api.get(`/leases?search=${encodeURIComponent(search)}&limit=50`),
        api.get("/units?limit=200"),
        api.get("/tenants?limit=200"),
      ]);
      setLeases(l.data ?? []);
      setUnits(u.data ?? []);
      setTenants(t.data ?? []);
    } catch { setLeases([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const filtered = leases.filter(l => statusFilt === "ALL" || l.status === statusFilt);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/leases", form);
      setShowModal(false); load();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === "ar" ? "إلغاء هذا العقد نهائياً؟" : "Cancel this lease permanently?")) return;
    setDeleting(id);
    try { await api.delete(`/leases/${id}`); load(); }
    catch (err: any) { alert(err.message); }
    finally { setDeleting(null); }
  };

  const inp = "w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {language === "ar" ? "عقود الإيجار" : "Lease Contracts"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${filtered.length} ${language === "ar" ? "عقد" : "contracts"}`}
          </p>
        </div>
        <button onClick={() => { setForm({ ...emptyForm }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all self-start">
          <Plus className="w-4 h-4" />
          {language === "ar" ? "عقد جديد" : "New Contract"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={language === "ar" ? "ابحث برقم العقد..." : "Search by contract number..."}
            className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
        <select value={statusFilt} onChange={e => setStatusFilt(e.target.value)}
          className="h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm font-medium focus:outline-none min-w-[140px]">
          <option value="ALL">{language === "ar" ? "كل الحالات" : "All Status"}</option>
          {["ACTIVE","EXPIRED","CANCELLED","PENDING"].map(s => (
            <option key={s} value={s}>{leaseStatusLabel[s]?.[language as "ar"|"en"] ?? s}</option>
          ))}
        </select>
      </div>

      {/* Summary stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: language === "ar" ? "نشطة" : "Active",   count: leases.filter(l=>l.status==="ACTIVE").length,    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
            { label: language === "ar" ? "منتهية" : "Expired", count: leases.filter(l=>l.status==="EXPIRED").length,   color: "text-neutral-600 bg-neutral-50 dark:bg-neutral-800" },
            { label: language === "ar" ? "ملغاة" : "Cancelled",count: leases.filter(l=>l.status==="CANCELLED").length, color: "text-red-600 bg-red-50 dark:bg-red-950/30" },
            { label: language === "ar" ? "إجمالي الإيجار" : "Total Rent",
              count: format(leases.filter(l=>l.status==="ACTIVE").reduce((s,l)=>s+Number(l.rentAmount??0),0)),
              color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
          ].map((s,i) => (
            <div key={i} className={cn("px-4 py-3 rounded-xl font-semibold text-sm", s.color)}>
              <p className="text-[11px] font-semibold opacity-70 uppercase tracking-wide">{s.label}</p>
              <p className="text-lg font-black mt-0.5">{s.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <Sk key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {language === "ar" ? "لا توجد عقود بعد" : "No contracts yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "العقد" : "Contract"}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "المستأجر / الوحدة" : "Tenant / Unit"}</th>
                <th>{language === "ar" ? "الفترة" : "Period"}</th>
                <th>{language === "ar" ? "الإيجار" : "Rent"}</th>
                <th>{language === "ar" ? "الحالة" : "Status"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lease: any) => {
                const StatusIcon = leaseStatusIcon[lease.status] ?? Clock;
                return (
                  <tr key={lease.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-mono text-xs font-bold text-neutral-900 dark:text-white">{lease.leaseNumber}</p>
                          <p className="text-[10px] text-neutral-400">{lease.paymentFrequency}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white">
                          <Users className="w-3 h-3 text-neutral-400" />
                          {lease.tenant?.firstName} {lease.tenant?.lastName}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <Building2 className="w-3 h-3 text-neutral-400" />
                          {lease.unit?.unitNumber} — {lease.unit?.property?.name}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs">
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {new Date(lease.startDate).toLocaleDateString("ar-IQ")}
                        </p>
                        <p className="text-neutral-400">
                          → {new Date(lease.endDate).toLocaleDateString("ar-IQ")}
                        </p>
                      </div>
                    </td>
                    <td className="font-bold text-neutral-900 dark:text-white">
                      {format(Number(lease.rentAmount ?? 0))}
                    </td>
                    <td>
                      <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border", leaseStatusStyle[lease.status] ?? "badge-neutral")}>
                        <StatusIcon className="w-3 h-3" />
                        {leaseStatusLabel[lease.status]?.[language as "ar"|"en"] ?? lease.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setViewing(lease)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(lease.id)} disabled={deleting === lease.id}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                          {deleting === lease.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-lg border border-neutral-100 dark:border-neutral-800 scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <h2 className="font-bold text-neutral-900 dark:text-white">
                {language === "ar" ? "إنشاء عقد إيجار جديد" : "Create New Lease Contract"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "المستأجر *" : "Tenant *"}</label>
                  <select required value={form.tenantId} onChange={e => setForm({ ...form, tenantId: e.target.value })} className={inp}>
                    <option value="">{language === "ar" ? "اختر المستأجر..." : "Select tenant..."}</option>
                    {tenants.map((t: any) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "الوحدة *" : "Unit *"}</label>
                  <select required value={form.unitId} onChange={e => setForm({ ...form, unitId: e.target.value })} className={inp}>
                    <option value="">{language === "ar" ? "اختر الوحدة..." : "Select unit..."}</option>
                    {units.filter((u: any) => u.status === "AVAILABLE").map((u: any) => (
                      <option key={u.id} value={u.id}>{u.unitNumber} — {u.property?.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "تاريخ البداية *" : "Start Date *"}</label>
                  <input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "تاريخ الانتهاء *" : "End Date *"}</label>
                  <input type="date" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "مبلغ الإيجار *" : "Rent Amount *"}</label>
                  <input type="number" min="0" required value={form.rentAmount} onChange={e => setForm({ ...form, rentAmount: +e.target.value })} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "العملة" : "Currency"}</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className={inp}>
                    <option value="USD">USD</option>
                    <option value="IQD">IQD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "التأمين" : "Security Deposit"}</label>
                  <input type="number" min="0" value={form.securityDeposit} onChange={e => setForm({ ...form, securityDeposit: +e.target.value })} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "دورية الدفع" : "Payment Frequency"}</label>
                  <select value={form.paymentFrequency} onChange={e => setForm({ ...form, paymentFrequency: e.target.value })} className={inp}>
                    {FREQ_OPTIONS.map(f => <option key={f.value} value={f.value}>{f[language as "ar"|"en"]}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "نسبة الغرامة %" : "Late Fee %"}</label>
                  <input type="number" min="0" max="100" value={form.lateFeePercent} onChange={e => setForm({ ...form, lateFeePercent: +e.target.value })} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "فترة السماح (أيام)" : "Grace Period (days)"}</label>
                  <input type="number" min="0" value={form.lateFeeGraceDays} onChange={e => setForm({ ...form, lateFeeGraceDays: +e.target.value })} className={inp} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {language === "ar" ? "إنشاء العقد" : "Create Contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-md border border-neutral-100 dark:border-neutral-800 scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-bold text-neutral-900 dark:text-white">{language === "ar" ? "تفاصيل العقد" : "Contract Details"}</h2>
              <button onClick={() => setViewing(null)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-600">{viewing.leaseNumber}</span>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", leaseStatusStyle[viewing.status] ?? "badge-neutral")}>
                  {leaseStatusLabel[viewing.status]?.[language as "ar"|"en"] ?? viewing.status}
                </span>
              </div>
              <div className="space-y-2 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                {[
                  { icon: Users,       label: language==="ar"?"المستأجر":"Tenant",  value: `${viewing.tenant?.firstName} ${viewing.tenant?.lastName}` },
                  { icon: Building2,   label: language==="ar"?"الوحدة":"Unit",     value: `${viewing.unit?.unitNumber} — ${viewing.unit?.property?.name}` },
                  { icon: Calendar,    label: language==="ar"?"الفترة":"Period",   value: `${new Date(viewing.startDate).toLocaleDateString()} → ${new Date(viewing.endDate).toLocaleDateString()}` },
                  { icon: DollarSign,  label: language==="ar"?"الإيجار":"Rent",    value: format(Number(viewing.rentAmount)) },
                  { icon: DollarSign,  label: language==="ar"?"التأمين":"Deposit", value: format(Number(viewing.securityDeposit ?? 0)) },
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
