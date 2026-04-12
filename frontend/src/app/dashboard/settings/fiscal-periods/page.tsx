"use client";

import { useState, useEffect } from "react";
import { CalendarRange, Lock, Unlock, CheckCircle2, Clock, AlertCircle, Loader2, Plus } from "lucide-react";
import { financeApi, FiscalPeriod } from "@/lib/api/finance";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const statusInfo: Record<string, { label: { ar: string; en: string }; color: string; icon: any }> = {
  OPEN:   { label: { ar: "مفتوحة", en: "Open" },   color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",   icon: CheckCircle2 },
  CLOSED: { label: { ar: "مغلقة",  en: "Closed" }, color: "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400",        icon: Lock },
  FUTURE: { label: { ar: "مستقبلية", en: "Future" }, color: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",               icon: Clock },
};

export default function FiscalPeriodsPage() {
  const { language, dir } = useLanguage();
  const [periods,  setPeriods]  = useState<FiscalPeriod[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [closing,  setClosing]  = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setPeriods(await financeApi.getFiscalPeriods()); }
    catch { setPeriods([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const closePeriod = async (id: string) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من إغلاق هذه الفترة؟" : "Close this fiscal period?")) return;
    setClosing(id);
    try { await financeApi.closeFiscalPeriod(id); load(); }
    catch {}
    finally { setClosing(null); }
  };

  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          {t("الفترات المالية","Fiscal Periods")}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t("فتح وإغلاق الفترات المحاسبية للتحكم في القيود المالية","Open and close accounting periods to control journal entries")}
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <Sk key={i} className="h-14" />)}</div>
      ) : periods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <CalendarRange className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {t("لا توجد فترات مالية","No fiscal periods found")}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{t("الفترة","Period")}</th>
                <th>{t("تاريخ البداية","Start Date")}</th>
                <th>{t("تاريخ النهاية","End Date")}</th>
                <th>{t("الحالة","Status")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p: FiscalPeriod) => {
                const st = statusInfo[p.status] ?? statusInfo.FUTURE;
                const Icon = st.icon;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                          <CalendarRange className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(p.startDate).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US")}
                    </td>
                    <td className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(p.endDate).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US")}
                    </td>
                    <td>
                      <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full", st.color)}>
                        <Icon className="w-3 h-3" />
                        {st.label[language as "ar"|"en"]}
                      </span>
                    </td>
                    <td>
                      {p.status === "OPEN" && (
                        <button onClick={() => closePeriod(p.id)} disabled={closing === p.id}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50">
                          {closing === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                          {t("إغلاق","Close")}
                        </button>
                      )}
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
