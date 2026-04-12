"use client";

import { useState, useEffect } from "react";
import {
  DoorOpen, Plus, Search, Edit, Trash2,
  Home, Building2, Loader2, X
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const UNIT_TYPES  = ["APARTMENT","VILLA","OFFICE","SHOP","WAREHOUSE","STUDIO","OTHER"];
const UNIT_STATUS = ["AVAILABLE","RENTED","MAINTENANCE","RESERVED"];

const statusStyle: Record<string, string> = {
  AVAILABLE:   "badge-success",
  RENTED:      "badge-info",
  MAINTENANCE: "badge-warning",
  RESERVED:    "badge-neutral",
};
const statusLabel: Record<string, { ar: string; en: string }> = {
  AVAILABLE:   { ar: "متاحة",  en: "Available"   },
  RENTED:      { ar: "مؤجرة",  en: "Rented"      },
  MAINTENANCE: { ar: "صيانة",  en: "Maintenance" },
  RESERVED:    { ar: "محجوزة", en: "Reserved"    },
};

export default function UnitsPage() {
  const { language, dir } = useLanguage();
  const { format }        = useCurrency();

  const [units,        setUnits]        = useState<any[]>([]);
  const [properties,   setProperties]   = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [propFilter,   setPropFilter]   = useState("ALL");
  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState<any>(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState<string | null>(null);

  const emptyForm = {
    unitNumber:"", floor:"", unitType:"APARTMENT",
    bedrooms:0, bathrooms:0, area:0,
    rentAmount:0, currency:"USD",
    propertyId:"", description:"",
  };
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([
        api.get(`/units?search=${encodeURIComponent(search)}&limit=100`),
        api.get("/properties?limit=100"),
      ]);
      setUnits(u.data ?? []);
      setProperties(p.data ?? []);
    } catch { setUnits([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const filtered = units.filter(u => {
    if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
    if (propFilter   !== "ALL" && u.propertyId !== propFilter) return false;
    return true;
  });

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit   = (u: any) => {
    setEditing(u);
    setForm({
      unitNumber: u.unitNumber, floor: u.floor ?? "", unitType: u.unitType,
      bedrooms: u.bedrooms ?? 0, bathrooms: u.bathrooms ?? 0, area: u.area ?? 0,
      rentAmount: Number(u.rentAmount ?? 0), currency: u.currency ?? "USD",
      propertyId: u.propertyId ?? "", description: u.description ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api.patch(`/units/${editing.id}`, form);
      else         await api.post("/units", form);
      setShowModal(false); load();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === "ar" ? "حذف هذه الوحدة نهائياً؟" : "Delete this unit?")) return;
    setDeleting(id);
    try { await api.delete(`/units/${id}`); load(); }
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
            {language === "ar" ? "الوحدات العقارية" : "Units"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${filtered.length} ${language === "ar" ? "وحدة" : "units"}`}
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all self-start">
          <Plus className="w-4 h-4" />
          {language === "ar" ? "إضافة وحدة" : "Add Unit"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={language === "ar" ? "ابحث عن وحدة..." : "Search units..."}
            className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[140px]">
          <option value="ALL">{language === "ar" ? "كل الحالات" : "All Status"}</option>
          {UNIT_STATUS.map(s => <option key={s} value={s}>{statusLabel[s]?.[language as "ar"|"en"] ?? s}</option>)}
        </select>
        <select value={propFilter} onChange={e => setPropFilter(e.target.value)}
          className="h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[160px]">
          <option value="ALL">{language === "ar" ? "كل العقارات" : "All Properties"}</option>
          {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <Sk key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <DoorOpen className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {language === "ar" ? "لا توجد وحدات" : "No units found"}
          </p>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            {language === "ar" ? "أضف وحدة" : "Add Unit"}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "الوحدة" : "Unit"}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "العقار" : "Property"}</th>
                <th>{language === "ar" ? "النوع" : "Type"}</th>
                <th>{language === "ar" ? "الإيجار/شهر" : "Rent/Month"}</th>
                <th>{language === "ar" ? "الحالة" : "Status"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0">
                        <Home className="w-4 h-4 text-violet-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">{u.unitNumber}</p>
                        <p className="text-xs text-neutral-400">
                          {u.floor ? `${language === "ar" ? "ط" : "F"}${u.floor}` : "—"} · {u.area ? `${u.area}m²` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 text-sm">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate max-w-[160px]">{u.property?.name ?? "—"}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-info text-[10px] font-bold px-2 py-0.5 rounded-full border">{u.unitType}</span>
                  </td>
                  <td className="font-bold text-neutral-900 dark:text-white">
                    {format(Number(u.rentAmount ?? 0))}
                  </td>
                  <td>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", statusStyle[u.status] ?? "badge-neutral")}>
                      {statusLabel[u.status]?.[language as "ar"|"en"] ?? u.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(u.id)} disabled={deleting === u.id}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        {deleting === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-lg border border-neutral-100 dark:border-neutral-800 scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <h2 className="font-bold text-neutral-900 dark:text-white">
                {editing ? (language === "ar" ? "تعديل الوحدة" : "Edit Unit") : (language === "ar" ? "إضافة وحدة جديدة" : "Add New Unit")}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "رقم الوحدة *" : "Unit Number *"}</label>
                  <input required value={form.unitNumber} onChange={e => setForm({ ...form, unitNumber: e.target.value })} className={inp} placeholder="A-101" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "الطابق" : "Floor"}</label>
                  <input value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} className={inp} placeholder="1" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "العقار *" : "Property *"}</label>
                  <select required value={form.propertyId} onChange={e => setForm({ ...form, propertyId: e.target.value })} className={inp}>
                    <option value="">{language === "ar" ? "اختر العقار..." : "Select property..."}</option>
                    {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "نوع الوحدة" : "Unit Type"}</label>
                  <select value={form.unitType} onChange={e => setForm({ ...form, unitType: e.target.value })} className={inp}>
                    {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "المساحة م²" : "Area m²"}</label>
                  <input type="number" min="0" value={form.area} onChange={e => setForm({ ...form, area: +e.target.value })} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "غرف النوم" : "Bedrooms"}</label>
                  <input type="number" min="0" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: +e.target.value })} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "الحمامات" : "Bathrooms"}</label>
                  <input type="number" min="0" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: +e.target.value })} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "الإيجار الشهري *" : "Monthly Rent *"}</label>
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
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? (language === "ar" ? "حفظ" : "Save") : (language === "ar" ? "إضافة" : "Add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
