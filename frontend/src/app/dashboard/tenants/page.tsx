"use client";

import { useState, useEffect } from "react";
import {
  Users, Plus, Search, Edit, Trash2,
  Mail, Phone, MapPin, FileText,
  Loader2, X, Eye
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

const COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
];
const avatarColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

export default function TenantsPage() {
  const { language, dir } = useLanguage();

  const [tenants,   setTenants]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewing,   setViewing]   = useState<any>(null);
  const [editing,   setEditing]   = useState<any>(null);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  const emptyForm = {
    firstName:"", lastName:"", email:"", phone:"",
    idType:"بطاقة وطنية", idNumber:"", nationality:"عراقي", address:"",
  };
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tenants?search=${encodeURIComponent(search)}&limit=50`);
      setTenants(res.data ?? []);
    } catch { setTenants([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit   = (t: any) => {
    setEditing(t);
    setForm({
      firstName: t.firstName, lastName: t.lastName, email: t.email, phone: t.phone,
      idType: t.idType ?? "بطاقة وطنية", idNumber: t.idNumber ?? "",
      nationality: t.nationality ?? "عراقي", address: t.address ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api.patch(`/tenants/${editing.id}`, form);
      else         await api.post("/tenants", form);
      setShowModal(false); load();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === "ar" ? "حذف هذا المستأجر نهائياً؟" : "Delete this tenant permanently?")) return;
    setDeleting(id);
    try { await api.delete(`/tenants/${id}`); load(); }
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
            {language === "ar" ? "المستأجرون" : "Tenants"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${tenants.length} ${language === "ar" ? "مستأجر مسجّل" : "tenants registered"}`}
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all self-start">
          <Plus className="w-4 h-4" />
          {language === "ar" ? "إضافة مستأجر" : "Add Tenant"}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={language === "ar" ? "ابحث بالاسم أو البريد أو الهاتف..." : "Search by name, email, phone..."}
          className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Sk key={i} className="h-16" />)}</div>
      ) : tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {language === "ar" ? "لا يوجد مستأجرون بعد" : "No tenants yet"}
          </p>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            {language === "ar" ? "أضف أول مستأجر" : "Add your first tenant"}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "المستأجر" : "Tenant"}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "بيانات التواصل" : "Contact"}</th>
                <th>{language === "ar" ? "الهوية" : "ID"}</th>
                <th>{language === "ar" ? "العقود" : "Leases"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant: any) => (
                <tr key={tenant.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0", avatarColor(tenant.firstName))}>
                        {initials(tenant.firstName, tenant.lastName)}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {tenant.firstName} {tenant.lastName}
                        </p>
                        {tenant.address && (
                          <p className="text-xs text-neutral-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {tenant.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" /> {tenant.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" /> {tenant.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    {tenant.idNumber ? (
                      <div className="text-xs">
                        <p className="text-[10px] text-neutral-400 font-semibold uppercase">{tenant.idType}</p>
                        <p className="font-mono font-bold text-neutral-700 dark:text-neutral-300">{tenant.idNumber}</p>
                      </div>
                    ) : <span className="text-neutral-300">—</span>}
                  </td>
                  <td>
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border",
                      (tenant.leases?.length ?? 0) > 0 ? "badge-success" : "badge-neutral"
                    )}>
                      <FileText className="w-3 h-3" />
                      {tenant.leases?.length ?? 0}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setViewing(tenant)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(tenant)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(tenant.id)} disabled={deleting === tenant.id}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        {deleting === tenant.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-lg border border-neutral-100 dark:border-neutral-800 scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <h2 className="font-bold text-neutral-900 dark:text-white">
                {editing ? (language === "ar" ? "تعديل بيانات المستأجر" : "Edit Tenant") : (language === "ar" ? "تسجيل مستأجر جديد" : "Register New Tenant")}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "الاسم الأول *" : "First Name *"}</label>
                  <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "الاسم الأخير *" : "Last Name *"}</label>
                  <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={inp} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "البريد الإلكتروني *" : "Email *"}</label>
                  <input required type="email" dir="ltr" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inp} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "رقم الهاتف *" : "Phone *"}</label>
                  <input required dir="ltr" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} placeholder="+964..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "نوع الهوية" : "ID Type"}</label>
                  <select value={form.idType} onChange={e => setForm({ ...form, idType: e.target.value })} className={inp}>
                    <option value="بطاقة وطنية">بطاقة وطنية</option>
                    <option value="جواز سفر">جواز سفر</option>
                    <option value="هوية أحوال مدنية">هوية أحوال مدنية</option>
                    <option value="Passport">Passport</option>
                    <option value="National ID">National ID</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "رقم الهوية" : "ID Number"}</label>
                  <input dir="ltr" value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} className={inp} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{language === "ar" ? "العنوان" : "Address"}</label>
                  <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={inp} />
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
                  {editing ? (language === "ar" ? "حفظ التعديلات" : "Save") : (language === "ar" ? "تسجيل المستأجر" : "Register Tenant")}
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
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-md border border-neutral-100 dark:border-neutral-800 scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-bold text-neutral-900 dark:text-white">{language === "ar" ? "ملف المستأجر" : "Tenant Profile"}</h2>
              <button onClick={() => setViewing(null)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black", avatarColor(viewing.firstName))}>
                  {initials(viewing.firstName, viewing.lastName)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900 dark:text-white">{viewing.firstName} {viewing.lastName}</h3>
                  <p className="text-sm text-neutral-500">{viewing.nationality}</p>
                </div>
              </div>
              <div className="space-y-3 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                {[
                  { icon: Mail,  label: language === "ar" ? "البريد" : "Email", value: viewing.email },
                  { icon: Phone, label: language === "ar" ? "الهاتف" : "Phone", value: viewing.phone },
                  { icon: MapPin,label: language === "ar" ? "العنوان" : "Address", value: viewing.address || "—" },
                  { icon: FileText, label: viewing.idType || "ID", value: viewing.idNumber || "—" },
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
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                  {language === "ar"
                    ? `${viewing.leases?.length ?? 0} عقد إيجار مسجّل في النظام`
                    : `${viewing.leases?.length ?? 0} lease(s) registered in the system`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
