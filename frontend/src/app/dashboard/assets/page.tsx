"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileBadge, Plus, Trash2, TrendingDown, ShieldCheck,
  Building2, Loader2, Paperclip, X
} from "lucide-react";
import { AttachmentManager } from "@/components/shared/attachment-manager";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const emptyForm = {
  name: "", value: 0,
  purchaseDate: new Date().toISOString().split("T")[0],
  depreciationRate: 10, usefulLifeYears: 10, description: "",
};

export default function AssetsPage() {
  const { language, dir } = useLanguage();
  const { format }        = useCurrency();

  const [properties,  setProperties]  = useState<any[]>([]);
  const [selectedProp,setSelectedProp]= useState("");
  const [assets,      setAssets]      = useState<any[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [modal,       setModal]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [attachAsset, setAttachAsset] = useState<any>(null);
  const [form,        setForm]        = useState({ ...emptyForm });
  const [files,       setFiles]       = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

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
    setLoading(true);
    api.get(`/financial/properties/${selectedProp}/assets`)
      .then((res: any) => setAssets(res.data ?? res ?? []))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, [selectedProp]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post("/financial/assets", { ...form, propertyId: selectedProp });
      const id  = (res as any).id ?? (res as any).data?.id;
      if (id && files.length > 0) {
        for (const file of files) {
          const fd = new FormData();
          fd.append("file", file); fd.append("entityType", "ASSET"); fd.append("entityId", id);
          await api.post("/attachments/upload", fd);
        }
      }
      setModal(false); setFiles([]); setForm({ ...emptyForm });
      // Reload assets
      const res2 = await api.get(`/financial/properties/${selectedProp}/assets`);
      setAssets((res2 as any).data ?? res2 ?? []);
    } catch { }
    finally { setSaving(false); }
  };

  const stats = {
    totalValue: assets.reduce((s, a) => s + Number(a.value ?? 0), 0),
    bookValue:  assets.reduce((s, a) => s + Number(a.bookValue ?? 0), 0),
    totalDep:   assets.reduce((s, a) => s + Number(a.accumulatedDepreciation ?? 0), 0),
  };

  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {t("الأصول والإهلاك", "Assets & Depreciation")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${assets.length} ${t("أصل","assets")}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedProp} onChange={e => setSelectedProp(e.target.value)}
            className="h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm font-medium focus:outline-none min-w-[160px]">
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" />
            {t("إضافة أصل","Add Asset")}
          </button>
        </div>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: t("القيمة الشرائية","Purchase Value"),   value: format(stats.totalValue), color: "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",         icon: FileBadge },
            { label: t("صافي القيمة الدفترية","Book Value"), value: format(stats.bookValue),  color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",       icon: ShieldCheck },
            { label: t("الإهلاك المتراكم","Accumulated Dep"),value: format(stats.totalDep),   color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",               icon: TrendingDown },
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
        <div className="space-y-3">{[...Array(4)].map((_,i) => <Sk key={i} className="h-14" />)}</div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <FileBadge className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {t("لا توجد أصول لهذا العقار","No assets for this property")}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{t("الأصل","Asset")}</th>
                <th>{t("تاريخ الشراء","Purchase Date")}</th>
                <th>{t("الإهلاك %","Dep. Rate")}</th>
                <th>{t("القيمة الأصلية","Original Value")}</th>
                <th>{t("القيمة الحالية","Book Value")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a: any) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{a.name}</p>
                        {a.description && <p className="text-[11px] text-neutral-400">{a.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(a.purchaseDate).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US")}
                  </td>
                  <td>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                      {a.depreciationRate}%
                    </span>
                  </td>
                  <td className="font-bold text-neutral-700 dark:text-neutral-300">{format(Number(a.value))}</td>
                  <td>
                    <p className="font-black text-emerald-600 dark:text-emerald-400">{format(Number(a.bookValue ?? 0))}</p>
                    <p className="text-[10px] text-neutral-400">{t("إهلاك:","Dep:")} -{format(Number(a.accumulatedDepreciation ?? 0))}</p>
                  </td>
                  <td>
                    <button onClick={() => setAttachAsset(a)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors">
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Asset Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-md border border-neutral-100 dark:border-neutral-800 scale-in max-h-[90vh] overflow-y-auto" dir={dir}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 rounded-t-2xl">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm">{t("إدراج أصل مادي","Add Asset")}</h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("اسم الأصل","Asset Name")}</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder={t("مثال: مصاعد الطابق الأول","e.g. First floor elevators")}
                    className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("القيمة الشرائية","Purchase Value")}</label>
                    <input required type="number" min="0" step="any" value={form.value || ""} onChange={e => setForm({...form, value: parseFloat(e.target.value) || 0})} dir="ltr"
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("تاريخ الشراء","Purchase Date")}</label>
                    <input type="date" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})}
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("معدل الإهلاك (%)","Dep. Rate (%)")}</label>
                    <input required type="number" step="0.1" min="0" max="100" value={form.depreciationRate} onChange={e => setForm({...form, depreciationRate: parseFloat(e.target.value) || 0})} dir="ltr"
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("العمر الإنتاجي (سنوات)","Useful Life (years)")}</label>
                    <input required type="number" min="1" value={form.usefulLifeYears} onChange={e => setForm({...form, usefulLifeYears: parseInt(e.target.value) || 1})} dir="ltr"
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                </div>
                {/* File attachments */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                    <Paperclip className="inline w-3 h-3 me-1" />{t("صور ومستندات","Photos & Documents")}
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
              <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  {t("إلغاء","Cancel")}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t("إدراج الأصل","Save Asset")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attachments Modal */}
      {attachAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAttachAsset(null)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-xl border border-neutral-100 dark:border-neutral-800 scale-in max-h-[80vh] overflow-y-auto" dir={dir}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 rounded-t-2xl">
              <h2 className="font-bold text-neutral-900 dark:text-white text-sm">
                <Paperclip className="inline w-4 h-4 me-2" />{attachAsset.name}
              </h2>
              <button onClick={() => setAttachAsset(null)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <AttachmentManager entityType="ASSET" entityId={attachAsset.id} title={t("وثائق الملكية والصور","Documents & Photos")} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
