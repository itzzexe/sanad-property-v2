"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, CalendarDays, Paperclip, Plus, X, FileText } from "lucide-react";
import { financeApi } from "@/lib/api/finance";
import { api } from "@/lib/api";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/lib/utils";

export default function NewBudgetPage() {
  const router = useRouter();
  const { language, dir } = useLanguage();
  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [properties,  setProperties]  = useState<any[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [name,         setName]         = useState("");
  const [fiscalYearId, setFiscalYearId] = useState("");
  const [propertyId,   setPropertyId]   = useState("");
  const [notes,        setNotes]        = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/fiscal-periods/fiscal-years").catch(() => []),
      api.get("/properties?limit=100").catch(() => []),
    ]).then(([fy, pr]) => {
      const years = (fy as any)?.data ?? fy ?? [];
      const props = (pr as any)?.data ?? pr ?? [];
      setFiscalYears(Array.isArray(years) ? years : []);
      setProperties(Array.isArray(props) ? props : []);
      if (years.length > 0) setFiscalYearId(years[0].id);
    }).finally(() => setLoadingMeta(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fiscalYearId) { setError(t("يرجى اختيار السنة المالية", "Please select a fiscal year")); return; }
    setSubmitting(true);
    setError("");
    try {
      const budget = await financeApi.createBudget({
        name,
        fiscalYearId,
        propertyId: propertyId || undefined,
        notes: notes || undefined,
      }) as any;
      for (const file of pendingFiles) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('entityType', 'BUDGET');
        fd.append('entityId', budget.id);
        await api.post('/attachments/upload', fd);
      }
      router.push(`/dashboard/finance/budgets/${budget.id}/lines`);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? t("حدث خطأ", "An error occurred"));
    } finally {
      setSubmitting(false);
    }
  };

  const inp = "w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  return (
    <div className={cn("max-w-lg space-y-6 page-enter", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-neutral-900 dark:text-white">{t("ميزانية جديدة", "New Budget")}</h1>
          <p className="text-xs text-neutral-400 mt-0.5">{t("أنشئ ميزانية لسنة مالية معينة", "Create a budget for a fiscal year")}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-black text-neutral-700 dark:text-neutral-200">{t("بيانات الميزانية", "Budget Details")}</span>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Budget Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
              {t("اسم الميزانية", "Budget Name")} <span className="text-rose-500">*</span>
            </label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t("مثال: ميزانية 2025", "e.g. Budget 2025")}
              className={inp}
            />
          </div>

          {/* Fiscal Year */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
              {t("السنة المالية", "Fiscal Year")} <span className="text-rose-500">*</span>
            </label>
            {loadingMeta ? (
              <div className="skeleton-shimmer h-10 rounded-lg" />
            ) : fiscalYears.length === 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold py-2">
                {t("لا توجد سنوات مالية — يرجى إنشاء سنة مالية أولاً", "No fiscal years found — please create one first")}
              </p>
            ) : (
              <select
                required
                value={fiscalYearId}
                onChange={e => setFiscalYearId(e.target.value)}
                className={inp}
              >
                <option value="">{t("اختر السنة المالية", "Select fiscal year")}</option>
                {fiscalYears.map((fy: any) => (
                  <option key={fy.id} value={fy.id}>
                    {fy.name ?? fy.year} ({new Date(fy.startDate).getFullYear()}–{new Date(fy.endDate).getFullYear()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Property (optional) */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
              {t("العقار (اختياري)", "Property (optional)")}
            </label>
            <select
              value={propertyId}
              onChange={e => setPropertyId(e.target.value)}
              className={inp}
            >
              <option value="">{t("ميزانية على مستوى الشركة", "Company-level budget")}</option>
              {properties.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
              {t("ملاحظات", "Notes")}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t("ملاحظات إضافية...", "Additional notes...")}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
            />
          </div>

          {/* Attachments */}
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 space-y-3">
            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" /> {t("المرفقات", "Attachments")} <span className="font-normal text-neutral-400">{t("(صور وPDF)", "(images & PDF)")}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {pendingFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <FileText className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                  <span className="max-w-[140px] truncate">{f.name}</span>
                  <button type="button" onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))} className="text-neutral-400 hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input type="file" className="hidden" accept="image/*,application/pdf"
                onChange={e => { const f = e.target.files?.[0]; if (f) { setPendingFiles(prev => [...prev, f]); e.target.value = ''; } }} />
              <span className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <Plus className="w-3.5 h-3.5" /> {t("إضافة ملف", "Add File")}
              </span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => router.back()}
              className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              {t("إلغاء", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting || loadingMeta || !name || !fiscalYearId}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t("إنشاء الميزانية", "Create Budget")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
