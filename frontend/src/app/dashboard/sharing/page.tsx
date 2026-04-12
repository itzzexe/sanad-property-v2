"use client";

import { useState, useEffect } from "react";
import {
  Calculator, UserPlus, Users, ArrowUpRight, ArrowDownRight,
  TrendingUp, Coins, Loader2, History, X, Pencil, Trash2
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

function avatarColor(name: string) {
  const colors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-cyan-500"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

const emptyForm = { id: "", name: "", email: "", sharePercent: 0, phone: "" };

export default function SharingPage() {
  const { language, dir } = useLanguage();
  const { format }        = useCurrency();

  const [properties,   setProperties]   = useState<any[]>([]);
  const [selectedProp, setSelectedProp] = useState("");
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [distributions,setDistributions]= useState<any[]>([]);
  const [analysis,     setAnalysis]     = useState<any>(null);
  const [loading,      setLoading]      = useState(false);

  const [addModal,     setAddModal]     = useState(false);
  const [editModal,    setEditModal]    = useState(false);
  const [distModal,    setDistModal]    = useState(false);
  const [histModal,    setHistModal]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [form,         setForm]         = useState({ ...emptyForm });

  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const [dates, setDates] = useState({ start: firstOfMonth, end: today });

  useEffect(() => {
    api.get("/properties?limit=100")
      .then((res: any) => {
        const d = res.data ?? res ?? [];
        setProperties(d);
        if (d.length > 0) setSelectedProp(d[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProp) return;
    loadData();
  }, [selectedProp, dates]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shRes, anRes] = await Promise.all([
        api.get(`/financial/properties/${selectedProp}/shareholders`),
        api.get(`/financial/properties/${selectedProp}/profit-analysis?startDate=${dates.start}&endDate=${dates.end}`),
      ]);
      const sh = (shRes as any).data ?? shRes ?? [];
      setShareholders(sh);
      setAnalysis((anRes as any).data ?? anRes);
      const all = sh.flatMap((s: any) =>
        (s.distributions ?? []).map((d: any) => ({ ...d, shareholderName: s.name }))
      ).sort((a: any, b: any) => new Date(b.distributedAt).getTime() - new Date(a.distributedAt).getTime());
      setDistributions(all);
    } catch {}
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/financial/shareholders", { ...form, propertyId: selectedProp });
      setAddModal(false); setForm({ ...emptyForm }); loadData();
    } catch {} finally { setSaving(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/financial/shareholders/${form.id}`, form);
      setEditModal(false); setForm({ ...emptyForm }); loadData();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("هل أنت متأكد من الحذف؟","Confirm delete?"))) return;
    try { await api.delete(`/financial/shareholders/${id}`); loadData(); } catch {}
  };

  const handleDeleteDist = async (id: string) => {
    if (!confirm(t("حذف سجل التوزيع؟","Delete distribution record?"))) return;
    try { await api.delete(`/financial/distributions/${id}`); loadData(); } catch {}
  };

  const handleDistribute = async () => {
    try {
      await api.post("/financial/distribute-profit", {
        propertyId: selectedProp, amount: analysis?.netProfit,
        periodStart: dates.start, periodEnd: dates.end,
      });
      setDistModal(false); loadData();
    } catch {}
  };

  const t = (ar: string, en: string) => language === "ar" ? ar : en;
  const netProfit = analysis?.netProfit ?? 0;
  const totalShares = shareholders.reduce((s, sh) => s + Number(sh.sharePercent ?? 0), 0);

  const ShareholderFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("اسم الشريك","Name")}</label>
        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
          className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("نسبة الملكية (%)","Share (%)")}</label>
          <input required type="number" step="0.01" min="0" max="100" value={form.sharePercent || ""} onChange={e => setForm({...form, sharePercent: parseFloat(e.target.value) || 0})} dir="ltr"
            className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("رقم الهاتف","Phone")}</label>
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} dir="ltr"
            className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("البريد الإلكتروني","Email")}</label>
        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} dir="ltr"
          className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {t("توزيع الأرباح","Profit Sharing")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t("تقسيم العوائد على الشركاء والمساهمين","Distribute profits among shareholders")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedProp} onChange={e => setSelectedProp(e.target.value)}
            className="h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm font-medium focus:outline-none min-w-[150px]">
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={() => setHistModal(true)}
            className="flex items-center gap-1.5 h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <History className="w-4 h-4" />
            {t("السجل","History")}
          </button>
          <button onClick={() => { setForm({ ...emptyForm }); setAddModal(true); }}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
            <UserPlus className="w-4 h-4" />
            {t("إضافة مساهم","Add Shareholder")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left column: date filter + distribution card */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card p-4">
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-3">{t("فترة التحليل","Analysis Period")}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">{t("من","From")}</label>
                <input type="date" value={dates.start} onChange={e => setDates({...dates, start: e.target.value})}
                  className="w-full h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 text-xs font-medium focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">{t("إلى","To")}</label>
                <input type="date" value={dates.end} onChange={e => setDates({...dates, end: e.target.value})}
                  className="w-full h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 text-xs font-medium focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-card p-5 text-white">
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">{t("الصافي القابل للتوزيع","Distributable Net")}</p>
            <p className="text-2xl font-black mt-1">{loading ? "..." : format(netProfit)}</p>
            <div className="h-1.5 w-full bg-white/20 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, (totalShares / 100) * 100)}%` }} />
            </div>
            <p className="text-[10px] opacity-60 mt-1">{totalShares.toFixed(1)}% {t("موزعة","allocated")}</p>
            <button onClick={() => setDistModal(true)} disabled={!analysis || netProfit <= 0}
              className="mt-4 w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50">
              <Calculator className="w-4 h-4" />
              {t("توزيع الآن","Distribute Now")}
            </button>
          </div>
        </div>

        {/* Right: summary + shareholders table */}
        <div className="lg:col-span-3 space-y-4">
          {/* Summary row */}
          {!loading && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t("إجمالي الإيرادات","Total Revenue"),    value: format(analysis?.revenue ?? 0),     icon: ArrowUpRight,   color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" },
                { label: t("إجمالي المصروفات","Total Expenses"),   value: format(analysis?.expenses ?? 0),    icon: ArrowDownRight, color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30" },
                { label: t("إهلاك الأصول","Depreciation"),         value: format(analysis?.depreciation ?? 0), icon: TrendingUp,    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30" },
              ].map((s, i) => (
                <div key={i} className={cn("px-4 py-3 rounded-xl flex items-center gap-2.5", s.color)}>
                  <s.icon className="w-4 h-4 opacity-60 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold opacity-70 uppercase tracking-wide">{s.label}</p>
                    <p className="text-base font-black mt-0.5">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Shareholders table */}
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_,i) => <Sk key={i} className="h-14" />)}</div>
          ) : shareholders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <Users className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
              <p className="font-semibold text-neutral-500 dark:text-neutral-400 text-sm">
                {t("لا يوجد مساهمون لهذا العقار","No shareholders for this property")}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 dark:border-neutral-800">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="font-bold text-neutral-900 dark:text-white text-sm">{t("حصص المساهمين","Shareholder Stakes")}</p>
              </div>
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className={language === "ar" ? "text-right" : "text-left"}>{t("المساهم","Shareholder")}</th>
                    <th>{t("النسبة %","Share %")}</th>
                    <th>{t("الحصة التقديرية","Est. Share")}</th>
                    <th>{t("إجمالي المستلم","Total Received")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {shareholders.map((sh: any) => {
                    const bg = avatarColor(sh.name ?? "");
                    const estShare = netProfit * (Number(sh.sharePercent ?? 0) / 100);
                    const totalRcvd = (sh.distributions ?? []).reduce((s: number, d: any) => s + Number(d.amount ?? 0), 0);
                    return (
                      <tr key={sh.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0", bg)}>
                              {(sh.name ?? "")[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{sh.name}</p>
                              <p className="text-[10px] text-neutral-400">{sh.email || sh.phone || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
                            {Number(sh.sharePercent).toFixed(1)}%
                          </span>
                        </td>
                        <td className="font-bold text-emerald-600 dark:text-emerald-400">{format(estShare)}</td>
                        <td className="font-bold text-neutral-700 dark:text-neutral-300">{format(totalRcvd)}</td>
                        <td>
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => { setForm({ id: sh.id, name: sh.name, email: sh.email ?? "", phone: sh.phone ?? "", sharePercent: sh.sharePercent }); setEditModal(true); }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(sh.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      </div>

      {/* Add Shareholder Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-md border border-neutral-100 dark:border-neutral-800 scale-in" dir={dir}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm">{t("إضافة شريك","Add Shareholder")}</h2>
              <button onClick={() => setAddModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="p-6"><ShareholderFormFields /></div>
              <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
                <button type="button" onClick={() => setAddModal(false)} className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">{t("إلغاء","Cancel")}</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-colors">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}{t("إضافة","Add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shareholder Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-md border border-neutral-100 dark:border-neutral-800 scale-in" dir={dir}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm">{t("تعديل بيانات المساهم","Edit Shareholder")}</h2>
              <button onClick={() => setEditModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="p-6"><ShareholderFormFields /></div>
              <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
                <button type="button" onClick={() => setEditModal(false)} className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">{t("إلغاء","Cancel")}</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-colors">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}{t("حفظ","Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distribution History Modal */}
      {histModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setHistModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-2xl border border-neutral-100 dark:border-neutral-800 scale-in max-h-[80vh] flex flex-col" dir={dir}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm">{t("سجل توزيع الأرباح","Distribution History")}</h2>
              <button onClick={() => setHistModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              {distributions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-400">
                  <Coins className="w-10 h-10 opacity-40" />
                  <p className="text-sm font-semibold">{t("لا توجد سجلات توزيع","No distribution records")}</p>
                </div>
              ) : (
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th className={language === "ar" ? "text-right" : "text-left"}>{t("المساهم","Shareholder")}</th>
                      <th>{t("المبلغ","Amount")}</th>
                      <th className={language === "ar" ? "text-right" : "text-left"}>{t("الفترة","Period")}</th>
                      <th>{t("تاريخ الصرف","Date")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributions.map((d: any) => (
                      <tr key={d.id}>
                        <td className="font-semibold text-neutral-900 dark:text-white text-sm">{d.shareholderName}</td>
                        <td className="font-bold text-emerald-600 dark:text-emerald-400">{format(Number(d.amount))}</td>
                        <td className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {new Date(d.periodStart).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US")} —{" "}
                          {new Date(d.periodEnd).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US")}
                        </td>
                        <td className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(d.distributedAt).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US")}
                        </td>
                        <td>
                          <button onClick={() => handleDeleteDist(d.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Distribute Confirmation Modal */}
      {distModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDistModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-sm border border-neutral-100 dark:border-neutral-800 scale-in" dir={dir}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-2">{t("تأكيد التوزيع","Confirm Distribution")}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                {t("سيتم توزيع","Distributing")}{" "}
                <span className="font-bold text-emerald-600">{format(netProfit)}</span>{" "}
                {t(`على ${shareholders.length} مساهمين`,`across ${shareholders.length} shareholders`)}
              </p>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("الإيرادات","Revenue")}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{format(analysis?.revenue ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("التكاليف","Costs")}</span>
                  <span className="font-bold text-rose-600">-{format((analysis?.expenses ?? 0) + (analysis?.depreciation ?? 0))}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-700 pt-2">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">{t("الصافي","Net")}</span>
                  <span className="font-black text-emerald-600">{format(netProfit)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDistModal(false)} className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">{t("تراجع","Cancel")}</button>
                <button onClick={handleDistribute} className="flex-1 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors">{t("توزيع","Distribute")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
