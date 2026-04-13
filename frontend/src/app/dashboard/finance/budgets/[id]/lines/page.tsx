"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Plus, Trash2, Loader2,
  CalendarDays, CheckCircle2, AlertTriangle
} from "lucide-react";
import { financeApi } from "@/lib/api/finance";
import { api } from "@/lib/api";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

interface LineRow {
  id?: string;
  accountId: string;
  fiscalPeriodId: string;
  amount: number;
  notes: string;
}

const emptyLine = (): LineRow => ({
  accountId: "", fiscalPeriodId: "", amount: 0, notes: "",
});

export default function BudgetLinesPage() {
  const { id } = useParams() as { id: string };
  const router  = useRouter();
  const { language, dir } = useLanguage();
  const { format } = useCurrency();
  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  const [budget,        setBudget]        = useState<any>(null);
  const [accounts,      setAccounts]      = useState<any[]>([]);
  const [periods,       setPeriods]       = useState<any[]>([]);
  const [lines,         setLines]         = useState<LineRow[]>([emptyLine()]);
  const [loadingMeta,   setLoadingMeta]   = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [error,         setError]         = useState("");

  const load = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const [budgetRes, accsRes, periodsRes] = await Promise.all([
        financeApi.getBudget(id),
        api.get("/accounts"),
        api.get("/fiscal-periods"),
      ]);
      const b  = budgetRes as any;
      const ac = (accsRes  as any)?.data ?? accsRes  ?? [];
      const fp = (periodsRes as any)?.data ?? periodsRes ?? [];

      setBudget(b);
      setAccounts(Array.isArray(ac) ? ac : []);
      setPeriods(Array.isArray(fp) ? fp : []);

      // Pre-fill existing lines
      if (b.lines && b.lines.length > 0) {
        setLines(b.lines.map((l: any) => ({
          id:            l.id,
          accountId:     l.accountId,
          fiscalPeriodId: l.fiscalPeriodId,
          amount:        Number(l.amount),
          notes:         l.notes ?? "",
        })));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? t("فشل تحميل البيانات", "Failed to load data"));
    } finally {
      setLoadingMeta(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateLine = (idx: number, field: keyof LineRow, value: string | number) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const addLine = () => setLines(prev => [...prev, emptyLine()]);

  const removeLine = (idx: number) => {
    if (lines.length === 1) return;
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const valid = lines.filter(l => l.accountId && l.fiscalPeriodId && l.amount > 0);
    if (valid.length === 0) {
      setError(t("يرجى إضافة بند واحد على الأقل بحساب وفترة ومبلغ", "Add at least one line with account, period and amount"));
      return;
    }
    setSaving(true); setError(""); setSaved(false);
    try {
      await api.post(`/budgets/${id}/lines`, { lines: valid });
      setSaved(true);
      await load();
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? t("فشل الحفظ", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const totalBudget = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);

  const inp = "h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-full";

  if (loadingMeta) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Sk className="h-10 w-48" />
        <Sk className="h-16" />
        {[...Array(4)].map((_, i) => <Sk key={i} className="h-12" />)}
      </div>
    );
  }

  return (
    <div className={cn("space-y-5 page-enter pb-10 max-w-4xl", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-neutral-900 dark:text-white">
              {t("بنود الميزانية", "Budget Lines")}
            </h1>
            {budget && (
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {budget.name} · {budget.fiscalYear?.name ?? budget.fiscalYearId}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t("تم الحفظ", "Saved")}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {t("حفظ البنود", "Save Lines")}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 text-sm font-semibold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Lines Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
          <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider">{t("البنود", "Lines")}</h3>
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
            {t("الإجمالي:", "Total:")} <span className="text-blue-600 dark:text-blue-400 font-black">{format(totalBudget)}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <th className="text-start p-3 text-[10px] font-black text-neutral-400 uppercase tracking-wider w-[35%]">{t("الحساب", "Account")}</th>
                <th className="text-start p-3 text-[10px] font-black text-neutral-400 uppercase tracking-wider w-[25%]">{t("الفترة المالية", "Fiscal Period")}</th>
                <th className="text-start p-3 text-[10px] font-black text-neutral-400 uppercase tracking-wider w-[15%]">{t("المبلغ", "Amount")}</th>
                <th className="text-start p-3 text-[10px] font-black text-neutral-400 uppercase tracking-wider">{t("ملاحظات", "Notes")}</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="p-2">
                    <select
                      value={line.accountId}
                      onChange={e => updateLine(idx, "accountId", e.target.value)}
                      className={inp}
                    >
                      <option value="">{t("اختر حساب", "Select account")}</option>
                      {accounts.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a.code} – {a.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      value={line.fiscalPeriodId}
                      onChange={e => updateLine(idx, "fiscalPeriodId", e.target.value)}
                      className={inp}
                    >
                      <option value="">{t("اختر فترة", "Select period")}</option>
                      {periods.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name ?? `${new Date(p.startDate).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-GB")} – ${new Date(p.endDate).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-GB")}`}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      dir="ltr"
                      value={line.amount || ""}
                      onChange={e => updateLine(idx, "amount", parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={inp}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={line.notes}
                      onChange={e => updateLine(idx, "notes", e.target.value)}
                      placeholder={t("اختياري", "optional")}
                      className={inp}
                    />
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => removeLine(idx)}
                      disabled={lines.length === 1}
                      className="p-1.5 rounded-lg text-neutral-300 dark:text-neutral-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:pointer-events-none transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={addLine}
            className="flex items-center gap-2 h-8 px-3 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 text-xs font-bold text-neutral-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> {t("إضافة بند", "Add Line")}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl flex items-center justify-between text-sm">
        <span className="font-bold text-blue-700 dark:text-blue-400">{t("إجمالي الميزانية المخططة", "Total Planned Budget")}</span>
        <span className="font-black text-blue-700 dark:text-blue-300 text-lg font-mono">{format(totalBudget)}</span>
      </div>
    </div>
  );
}
