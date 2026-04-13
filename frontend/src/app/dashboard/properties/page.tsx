"use client";

import { useState, useEffect } from "react";
import {
  Building2, Plus, Search, LayoutGrid, List,
  Edit, Trash2, Home, Users, DollarSign,
  Loader2, X, FileText, ChevronLeft
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { toast } from "sonner";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const TABS = [
  { id: 0, label: "معلومات عامة" },
  { id: 1, label: "السجل الحالي" },
  { id: 2, label: "السجل المنقول منه" },
  { id: 3, label: "تفاصيل الملكية" },
  { id: 4, label: "تفاصيل التسجيل" },
];

const sectionColors: Record<string, { border: string; dot: string }> = {
  blue:    { border: "border-blue-100 dark:border-blue-900/30",       dot: "bg-blue-500" },
  emerald: { border: "border-emerald-100 dark:border-emerald-900/30", dot: "bg-emerald-500" },
  violet:  { border: "border-violet-100 dark:border-violet-900/30",   dot: "bg-violet-500" },
  amber:   { border: "border-amber-100 dark:border-amber-900/30",     dot: "bg-amber-500" },
  rose:    { border: "border-rose-100 dark:border-rose-900/30",       dot: "bg-rose-500" },
};

const emptyForm = {
  name: "",
  issuer: "",
  registrationDirectorate: "",
  formType: "",
  governorate: "",
  district: "الرصافة",
  subDistrict: "",
  street: "",
  recordNumber: "",
  recordDate: "",
  recordVolume: "",
  prevRecordNumber: "",
  prevRecordDate: "",
  prevRecordVolume: "",
  propertySequence: "",
  neighborhoodName: "",
  doorNumber: "",
  plotNumber: "",
  sectionNumber: "",
  sectionName: "",
  ownerNationality: "",
  boundaries: "كما في الخارطة",
  propertyGender: "",
  propertyTypeDetailed: "",
  contents: "",
  easements: "",
  areaSqm: "" as string | number,
  areaOlk: "" as string | number,
  areaDonum: "" as string | number,
  registrationNature: "",
  insuranceNotes: "",
  deedRuling: "",
};

type PForm = typeof emptyForm;

export default function PropertiesPage() {
  const { language, dir } = useLanguage();
  const { format } = useCurrency();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [viewMode, setViewMode]   = useState<"grid" | "list">("grid");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<any>(null);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm]           = useState<PForm>({ ...emptyForm });

  const set = (k: keyof PForm, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/properties?search=${encodeURIComponent(search)}&limit=50`);
      setProperties(res.data ?? []);
    } catch { setProperties([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setActiveTab(0);
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name:                    p.name ?? "",
      issuer:                  p.issuer ?? "",
      registrationDirectorate: p.registrationDirectorate ?? "",
      formType:                p.formType ?? "",
      governorate:             p.governorate ?? "",
      district:                p.district ?? "الرصافة",
      subDistrict:             p.subDistrict ?? "",
      street:                  p.street ?? "",
      recordNumber:            p.recordNumber ?? "",
      recordDate:              p.recordDate ? String(p.recordDate).slice(0, 10) : "",
      recordVolume:            p.recordVolume ?? "",
      prevRecordNumber:        p.prevRecordNumber ?? "",
      prevRecordDate:          p.prevRecordDate ? String(p.prevRecordDate).slice(0, 10) : "",
      prevRecordVolume:        p.prevRecordVolume ?? "",
      propertySequence:        p.propertySequence ?? "",
      neighborhoodName:        p.neighborhoodName ?? "",
      doorNumber:              p.doorNumber ?? "",
      plotNumber:              p.plotNumber ?? "",
      sectionNumber:           p.sectionNumber ?? "",
      sectionName:             p.sectionName ?? "",
      ownerNationality:        p.ownerNationality ?? "",
      boundaries:              p.boundaries ?? "كما في الخارطة",
      propertyGender:          p.propertyGender ?? "",
      propertyTypeDetailed:    p.propertyTypeDetailed ?? "",
      contents:                p.contents ?? "",
      easements:               p.easements ?? "",
      areaSqm:                 p.areaSqm ?? "",
      areaOlk:                 p.areaOlk ?? "",
      areaDonum:               p.areaDonum ?? "",
      registrationNature:      p.registrationNature ?? "",
      insuranceNotes:          p.insuranceNotes ?? "",
      deedRuling:              p.deedRuling ?? "",
    });
    setActiveTab(0);
    setShowModal(true);
  };

  const validate = (): string | null => {
    const required: Array<{ k: keyof PForm; label: string }> = [
      { k: "name",                    label: "اسم/مرجع العقار" },
      { k: "issuer",                  label: "الجهة المصدرة" },
      { k: "registrationDirectorate", label: "مديرية التسجيل العقاري في" },
      { k: "formType",                label: "نوع النموذج" },
      { k: "governorate",             label: "المحافظة" },
      { k: "recordNumber",            label: "العدد (السجل الحالي)" },
      { k: "recordDate",              label: "التاريخ (السجل الحالي)" },
      { k: "recordVolume",            label: "رقم المجلد (السجل الحالي)" },
      { k: "prevRecordNumber",        label: "العدد (السجل المنقول منه)" },
      { k: "prevRecordDate",          label: "التاريخ (السجل المنقول منه)" },
      { k: "prevRecordVolume",        label: "رقم المجلد (السجل المنقول منه)" },
      { k: "propertySequence",        label: "تسلسل العقار" },
      { k: "neighborhoodName",        label: "اسم المحلة" },
      { k: "ownerNationality",        label: "المالك أو المتصرف وتابعيته" },
      { k: "boundaries",              label: "الحدود" },
      { k: "propertyGender",          label: "جنس العقار" },
      { k: "propertyTypeDetailed",    label: "نوع العقار (الصنف)" },
      { k: "registrationNature",      label: "ماهية التسجيل ومستنداته" },
    ];
    for (const { k, label } of required) {
      if (!form[k]) return `حقل "${label}" مطلوب`;
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (payload.areaSqm  !== "") payload.areaSqm  = Number(payload.areaSqm);
      else delete payload.areaSqm;
      if (payload.areaOlk  !== "") payload.areaOlk  = Number(payload.areaOlk);
      else delete payload.areaOlk;
      if (payload.areaDonum !== "") payload.areaDonum = Number(payload.areaDonum);
      else delete payload.areaDonum;

      if (editing) await api.patch(`/properties/${editing.id}`, payload);
      else         await api.post("/properties", payload);
      setShowModal(false);
      load();
    } catch (err: any) { toast.error(err?.response?.data?.message ?? err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذا العقار نهائياً؟")) return;
    setDeleting(id);
    try { await api.delete(`/properties/${id}`); load(); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? err.message); }
    finally { setDeleting(null); }
  };

  const inp = "w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  /* ── Inline sub-components (no hook rules broken — declared inside render) ── */
  const SH = ({ title, color = "blue" }: { title: string; color?: string }) => {
    const c = sectionColors[color] ?? sectionColors.blue;
    return (
      <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${c.border}`}>
        <div className={`w-1 h-5 ${c.dot} rounded-full flex-shrink-0`} />
        <h3 className="text-sm font-black text-neutral-700 dark:text-neutral-300">{title}</h3>
      </div>
    );
  };

  const F = ({ k, label, req, ph, type }: { k: keyof PForm; label: string; req?: boolean; ph?: string; type?: string }) => (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">
        {label}{req && <span className="text-red-500 ms-0.5">*</span>}
      </label>
      <input
        type={type ?? "text"}
        value={form[k] as string}
        onChange={e => set(k, e.target.value)}
        placeholder={ph ?? ""}
        className={inp}
      />
    </div>
  );

  const TA = ({ k, label, req, ph }: { k: keyof PForm; label: string; req?: boolean; ph?: string }) => (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">
        {label}{req && <span className="text-red-500 ms-0.5">*</span>}
      </label>
      <textarea
        rows={3}
        value={form[k] as string}
        onChange={e => set(k, e.target.value)}
        placeholder={ph ?? ""}
        className={inp + " h-20 resize-none py-2"}
      />
    </div>
  );

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {language === "ar" ? "العقارات" : "Properties"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${properties.length} ${language === "ar" ? "عقار مسجل" : "properties registered"}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            {viewMode === "grid" ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            {language === "ar" ? "إضافة عقار" : "Add Property"}
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={language === "ar" ? "ابحث عن عقار..." : "Search properties..."}
          className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className={cn(viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3")}>
          {[...Array(6)].map((_, i) => <Sk key={i} className="h-48" />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <Building2 className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {language === "ar" ? "لا توجد عقارات بعد" : "No properties yet"}
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {language === "ar" ? "أضف أول عقار" : "Add your first property"}
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p: any) => (
            <div key={p.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card hover:shadow-md-soft transition-all group overflow-hidden">
              <div className="h-28 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 flex items-center justify-center relative">
                <Building2 className="w-10 h-10 text-blue-300 dark:text-blue-700" />
                <div className="absolute top-2 end-2">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", p.isActive !== false ? "badge-success" : "badge-neutral")}>
                    {p.isActive !== false ? "نشط" : "غير نشط"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <h3 className="font-bold text-neutral-900 dark:text-white text-base leading-tight line-clamp-1">{p.name}</h3>
                    {(p.neighborhoodName || p.governorate) && (
                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                        {[p.neighborhoodName, p.governorate].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                      {deleting === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {p.propertyTypeDetailed && (
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1 mb-2">
                    <FileText className="w-3 h-3 flex-shrink-0" /> {p.propertyTypeDetailed}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-50 dark:border-neutral-800">
                  {[
                    { icon: Home,       label: language === "ar" ? "الوحدات"    : "Units",   value: p.units?.length ?? 0 },
                    { icon: Users,      label: language === "ar" ? "المستأجرون" : "Tenants", value: p.units?.filter((u: any) => u.status === "RENTED").length ?? 0 },
                    { icon: DollarSign, label: language === "ar" ? "الإيجار"    : "Rent",    value: format(p.units?.reduce((s: number, u: any) => s + Number(u.rentAmount ?? 0), 0)) },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-[10px] text-neutral-400 font-medium">{stat.label}</p>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-hidden">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-right">{language === "ar" ? "العقار" : "Property"}</th>
                <th className="text-right">{language === "ar" ? "المحلة / المحافظة" : "Neighborhood"}</th>
                <th>{language === "ar" ? "النوع" : "Type"}</th>
                <th>{language === "ar" ? "الوحدات" : "Units"}</th>
                <th>{language === "ar" ? "الحالة" : "Status"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="font-semibold text-neutral-900 dark:text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="text-neutral-500">
                    {[p.neighborhoodName, p.governorate].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td>
                    <span className="badge-info text-[10px] font-bold px-2 py-0.5 rounded-full border">
                      {p.propertyTypeDetailed ?? "—"}
                    </span>
                  </td>
                  <td className="font-semibold">{p.units?.length ?? 0}</td>
                  <td>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", p.isActive !== false ? "badge-success" : "badge-neutral")}>
                      {p.isActive !== false ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        {deleting === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div
            className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-3xl border border-neutral-100 dark:border-neutral-800 flex flex-col"
            style={{ maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-black text-neutral-900 dark:text-white text-base">
                    {editing ? "تعديل بيانات العقار" : "تسجيل عقار جديد"}
                  </h2>
                  <p className="text-[11px] text-neutral-400">نموذج السجل العقاري الدائمي</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto flex-shrink-0">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0",
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-6" dir="rtl">

                {/* Tab 0 — معلومات عامة */}
                {activeTab === 0 && (
                  <div className="space-y-4">
                    <SH title="معلومات عامة" color="blue" />
                    <F k="name" label="اسم/مرجع العقار" req ph="مثال: عقار المحلة 236 - الرصافة" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <F k="issuer"                  label="الجهة المصدرة"              req ph="مثال: دائرة التسجيل العقاري" />
                      <F k="registrationDirectorate" label="مديرية التسجيل العقاري في" req ph="مثال: بغداد / الرصافة" />
                    </div>
                    <F k="formType" label="نوع النموذج" req ph="مثال: سند تمليك" />
                  </div>
                )}

                {/* Tab 1 — السجل الحالي */}
                {activeTab === 1 && (
                  <div className="space-y-4">
                    <SH title="وصف السجل العقاري الدائمي الحالي" color="emerald" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <F k="governorate" label="المحافظة" req ph="مثال: بغداد" />
                      <F k="district"    label="القضاء"   ph="مثال: الرصافة" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <F k="subDistrict" label="الناحية" ph="اختياري" />
                      <F k="street"      label="الشارع"  ph="اختياري" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <F k="recordNumber" label="العدد"      req />
                      <F k="recordDate"   label="التاريخ"    req type="date" />
                      <F k="recordVolume" label="رقم المجلد" req />
                    </div>
                  </div>
                )}

                {/* Tab 2 — السجل المنقول منه */}
                {activeTab === 2 && (
                  <div className="space-y-4">
                    <SH title="وصف السجل العقاري الدائمي المنقول منه" color="violet" />
                    <div className="grid grid-cols-3 gap-3">
                      <F k="prevRecordNumber" label="العدد"      req />
                      <F k="prevRecordDate"   label="التاريخ"    req type="date" />
                      <F k="prevRecordVolume" label="رقم المجلد" req />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <F k="propertySequence" label="تسلسل العقار" req />
                      <F k="neighborhoodName" label="اسم المحلة"   req />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-neutral-400 mb-3 uppercase tracking-wide">
                        رقم الباب / رقم القطعة / رقم المقاطعة / اسم المقاطعة
                        <span className="normal-case font-normal ms-1 text-neutral-300">(اختياري)</span>
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <F k="doorNumber"    label="رقم الباب"    />
                        <F k="plotNumber"    label="رقم القطعة"   />
                        <F k="sectionNumber" label="رقم المقاطعة" />
                        <F k="sectionName"   label="اسم المقاطعة" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3 — تفاصيل الملكية */}
                {activeTab === 3 && (
                  <div className="space-y-4">
                    <SH title="تفاصيل الملكية والعقار" color="amber" />
                    <TA k="ownerNationality" label="المالك أو المتصرف وتابعيته" req ph="الاسم الكامل والتابعية..." />
                    <TA k="boundaries"       label="الحدود"                     req ph="مثال: كما في الخارطة" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <F k="propertyGender"       label="جنس العقار"          req ph="مثال: دار، أرض، محل..." />
                      <F k="propertyTypeDetailed" label="نوع العقار (الصنف)"  req ph="مثال: سكني، تجاري..." />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TA k="contents"  label="المشتملات"             ph="اختياري" />
                      <TA k="easements" label="حقوق الارتفاق والعقر" ph="اختياري" />
                    </div>
                    {/* Area row */}
                    <div>
                      <p className="text-xs font-bold text-neutral-500 mb-2">
                        المساحة
                        <span className="text-[11px] font-semibold text-neutral-400 ms-1">(أدخل متر مربع أو اولك)</span>
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-500 block">متر مربع</label>
                          <input type="number" min="0" step="0.01" value={form.areaSqm as string} onChange={e => set("areaSqm", e.target.value)} placeholder="0.00" className={inp} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-500 block">اولك</label>
                          <input type="number" min="0" step="0.01" value={form.areaOlk as string} onChange={e => set("areaOlk", e.target.value)} placeholder="0.00" className={inp} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-500 block">
                            دونم <span className="text-neutral-300 font-normal">(اختياري)</span>
                          </label>
                          <input type="number" min="0" step="0.01" value={form.areaDonum as string} onChange={e => set("areaDonum", e.target.value)} placeholder="0.00" className={inp} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4 — تفاصيل التسجيل */}
                {activeTab === 4 && (
                  <div className="space-y-4">
                    <SH title="تفاصيل التسجيل" color="rose" />
                    <TA k="registrationNature" label="ماهية التسجيل ومستنداته"                         req ph="وصف طبيعة التسجيل والوثائق المستند إليها..." />
                    <TA k="insuranceNotes"      label="اشارات التأمينات العينية والحجز ومواقع التسجيل" ph="اختياري" />
                    <TA k="deedRuling"          label="حكم السند"                                      ph="اختياري" />
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex-shrink-0 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-2xl">
                {/* Step indicators */}
                <div className="flex gap-1.5 items-center">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "rounded-full transition-all",
                        activeTab === tab.id
                          ? "w-4 h-2 bg-blue-500"
                          : "w-2 h-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400"
                      )}
                    />
                  ))}
                </div>
                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    إلغاء
                  </button>
                  {activeTab > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab - 1)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> السابق
                    </button>
                  )}
                  {activeTab < TABS.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab + 1)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      التالي <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-600/20"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {editing ? "حفظ التعديلات" : "تسجيل العقار"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
