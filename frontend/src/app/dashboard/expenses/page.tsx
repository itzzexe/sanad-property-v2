"use client";

import { useState, useEffect, useRef } from "react";
import {
  Receipt, Plus, Search, Trash2, FileText, Loader2,
  Eye, Paperclip, ArrowDownRight, Zap, Home, X
} from "lucide-react";
import { AttachmentManager } from "@/components/shared/attachment-manager";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const CATEGORIES: Record<string, { ar: string; en: string }> = {
  MAINTENANCE: { ar: "صيانة",          en: "Maintenance" },
  UTILITY:     { ar: "فواتير وخدمات", en: "Utilities"   },
  TAX:         { ar: "ضرائب ورسوم",   en: "Taxes"       },
  MANAGEMENT:  { ar: "إدارة",          en: "Management"  },
  INSURANCE:   { ar: "تأمين",          en: "Insurance"   },
  SALARY:      { ar: "رواتب",          en: "Salaries"    },
  MARKETING:   { ar: "تسويق",          en: "Marketing"   },
  OTHER:       { ar: "أخرى",           en: "Other"       },
};

const emptyForm = {
  title: "", amount: 0, category: "MAINTENANCE", propertyId: "",
  description: "", date: new Date().toISOString().split("T")[0],
};

export default function ExpensesPage() {
  const { language, dir } = useLanguage();
  const { format }        = useCurrency();

  const [expenses,    setExpenses]    = useState<any[]>([]);
  const [properties,  setProperties]  = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [viewing,     setViewing]     = useState<any>(null);
  const [attachExp,   setAttachExp]   = useState<any>(null);
  const [form,        setForm]        = useState({ ...emptyForm });
  const [files,       setFiles]       = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [expRes, propRes] = await Promise.all([
        api.get("/financial/expenses"),
        api.get("/properties?limit=100"),
      ]);
      const exps  = (expRes as any).data  ?? expRes  ?? [];
      const props = (propRes as any).data ?? propRes ?? [];
      setExpenses(exps);
      setProperties(props);
      if (props.length > 0) setForm(f => ({ ...f, propertyId: props[0].id }));
    } catch { setExpenses([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post("/financial/expenses", form);
      const id  = (res as any).id ?? (res as any).data?.id;
      if (id && files.length > 0) {
        for (const file of files) {
          const fd = new FormData();
          fd.append("file", file); fd.append("entityType", "EXPENSE"); fd.append("entityId", id);
          await api.post("/attachments/upload", fd);
        }
      }
      setModal(false); setFiles([]); setForm({ ...emptyForm, propertyId: form.propertyId }); load();
    } catch { }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Delete this expense?")) return;
    try { await api.delete(`/financial/expenses/${id}`); load(); } catch {}
  };

  const stats = {
    total:       expenses.reduce((s, e) => s + Number(e.amount ?? 0), 0),
    utilities:   expenses.filter(e => e.category === "UTILITY").reduce((s, e) => s + Number(e.amount ?? 0), 0),
    maintenance: expenses.filter(e => e.category === "MAINTENANCE").reduce((s, e) => s + Number(e.amount ?? 0), 0),
  };

  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {t("المصروفات", "Expenses")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${expenses.length} ${t("نفقة", "expenses")}`}
          </p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
          <Plus className="w-4 h-4" />
          {t("نفقة جديدة", "New Expense")}
        </button>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: t("إجمالي النفقات","Total Expenses"),  value: format(stats.total),       color: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",           icon: ArrowDownRight },
            { label: t("فواتير الخدمات","Utilities"),       value: format(stats.utilities),   color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",           icon: Zap },
            { label: t("مصاريف الصيانة","Maintenance"),     value: format(stats.maintenance), color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400", icon: Home },
          ].map((s, i) => (
            <div key={i} className={cn("px-4 py-3 rounded-xl flex items-center gap-3", s.color)}>
              <s.icon className="w-5 h-5 opacity-60 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold opacity-70 uppercase tracking-wide">{s.label}</p>
                <p className="text-lg font-black mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <Sk key={i} className="h-14" />)}</div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <Receipt className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">{t("لا توجد نفقات", "No expenses found")}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{t("النفقة","Expense")}</th>
                <th>{t("التصنيف","Category")}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{t("العقار","Property")}</th>
                <th>{t("المبلغ","Amount")}</th>
                <th>{t("التاريخ","Date")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp: any) => (
                <tr key={exp.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5 text-neutral-500" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">{exp.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {CATEGORIES[exp.category]?.[language as "ar"|"en"] ?? exp.category}
                    </span>
                  </td>
                  <td className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    {exp.property?.name ?? t("عام","General")}
                  </td>
                  <td className="font-bold text-rose-600 dark:text-rose-400">{format(Number(exp.amount))}</td>
                  <td className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(exp.date).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US")}
                  </td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setViewing(exp)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setAttachExp(exp)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors">
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Expense Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-lg border border-neutral-100 dark:border-neutral-800 scale-in max-h-[90vh] overflow-y-auto" dir={dir}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 rounded-t-2xl">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm">{t("تسجيل نفقة جديدة","New Expense")}</h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("موضوع النفقة","Title")}</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    placeholder={t("مثال: فاتورة كهرباء","e.g. Electricity bill")}
                    className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("المبلغ","Amount")}</label>
                    <input required type="number" min="0" step="any" value={form.amount || ""} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})} dir="ltr"
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("التاريخ","Date")}</label>
                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("التصنيف","Category")}</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none">
                      {Object.entries(CATEGORIES).map(([k, v]) => (
                        <option key={k} value={k}>{v[language as "ar"|"en"]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("العقار","Property")}</label>
                    <select value={form.propertyId} onChange={e => setForm({...form, propertyId: e.target.value})}
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none">
                      {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("ملاحظات","Notes")}</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" />
                </div>
                {/* File attachments */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                    <Paperclip className="inline w-3 h-3 me-1" />{t("مرفقات","Attachments")}
                  </label>
                  <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="hidden"
                    onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])} />
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full h-10 rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
                    {t("اختر ملفات","Choose Files")}
                  </button>
                  {files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs">
                          <span className="truncate text-neutral-600 dark:text-neutral-400 max-w-[240px]">{f.name}</span>
                          <button type="button" onClick={() => setFiles(prev => prev.filter((_,j) => j !== i))}
                            className="text-rose-500 hover:text-rose-700 flex-shrink-0 ms-2">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 sticky bottom-0 bg-white dark:bg-neutral-900 rounded-b-2xl">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  {t("إلغاء","Cancel")}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t("حفظ","Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-md border border-neutral-100 dark:border-neutral-800 scale-in" dir={dir}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm">{t("تفاصيل النفقة","Expense Details")}</h2>
              <button onClick={() => setViewing(null)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                {[
                  { label: t("الموضوع","Title"),       value: viewing.title },
                  { label: t("المبلغ","Amount"),        value: format(Number(viewing.amount)) },
                  { label: t("التصنيف","Category"),    value: CATEGORIES[viewing.category]?.[language as "ar"|"en"] ?? viewing.category },
                  { label: t("العقار","Property"),     value: viewing.property?.name ?? t("عام","General") },
                  { label: t("التاريخ","Date"),         value: new Date(viewing.date).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US") },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0 text-sm">
                    <span className="text-neutral-400 text-xs font-semibold">{row.label}</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{row.value}</span>
                  </div>
                ))}
              </div>
              {viewing.description && (
                <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-sm text-neutral-600 dark:text-neutral-400">
                  {viewing.description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attachments Modal */}
      {attachExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAttachExp(null)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-xl border border-neutral-100 dark:border-neutral-800 scale-in max-h-[80vh] overflow-y-auto" dir={dir}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 rounded-t-2xl">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm">
                <Paperclip className="inline w-4 h-4 me-2" />{attachExp.title}
              </h2>
              <button onClick={() => setAttachExp(null)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <AttachmentManager entityType="EXPENSE" entityId={attachExp.id} title={t("الوصولات والمستندات","Receipts & Documents")} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
