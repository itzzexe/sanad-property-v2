"use client";

import { useState, useEffect } from "react";
import {
  Users, UserPlus, Search, Shield, ShieldCheck, Mail, Phone,
  Trash2, ToggleRight, ToggleLeft, Loader2, X, Check, UserCog
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

function avatarColor(name: string) {
  const colors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-cyan-500","bg-indigo-500","bg-pink-500"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

const roleInfo: Record<string, { ar: string; en: string; color: string }> = {
  ADMIN:      { ar: "مدير النظام", en: "System Admin", color: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400" },
  OWNER:      { ar: "المالك",      en: "Owner",         color: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400" },
  ACCOUNTANT: { ar: "محاسب",       en: "Accountant",    color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" },
};

const emptyForm = { firstName: "", lastName: "", email: "", password: "", role: "OWNER", phone: "" };

export default function UsersPage() {
  const { language, dir } = useLanguage();

  const [users,   setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ ...emptyForm });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data ?? res ?? []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      await api.post("/users", form);
      setModal(false);
      setForm({ ...emptyForm });
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? (language === "ar" ? "فشلت العملية" : "Operation failed"));
    } finally { setSaving(false); }
  };

  const toggleStatus = async (id: string, cur: boolean) => {
    try { await api.patch(`/users/${id}/status`, { isActive: !cur }); load(); } catch {}
  };

  const deleteUser = async (id: string) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) return;
    try { await api.delete(`/users/${id}`); load(); } catch {}
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {language === "ar" ? "المستخدمون" : "Users"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${users.length} ${language === "ar" ? "مستخدم" : "users"}`}
          </p>
        </div>
        <button onClick={() => { setModal(true); setForm({ ...emptyForm }); setErr(""); }}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
          <UserPlus className="w-4 h-4" />
          {language === "ar" ? "مستخدم جديد" : "New User"}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={language === "ar" ? "بحث..." : "Search..."}
          className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <Sk key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {language === "ar" ? "لا يوجد مستخدمون" : "No users found"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "المستخدم" : "User"}</th>
                <th>{language === "ar" ? "الدور" : "Role"}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{language === "ar" ? "بريد / هاتف" : "Email / Phone"}</th>
                <th>{language === "ar" ? "الحالة" : "Status"}</th>
                <th>{language === "ar" ? "الانضمام" : "Joined"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => {
                const initials = `${(u.firstName ?? "")[0] ?? ""}${(u.lastName ?? "")[0] ?? ""}`.toUpperCase();
                const bg = avatarColor(`${u.firstName}${u.lastName}`);
                const role = roleInfo[u.role] ?? { ar: u.role, en: u.role, color: "bg-neutral-100 text-neutral-600" };
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0", bg)}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">{u.firstName} {u.lastName}</p>
                          <p className="text-[11px] text-neutral-400">{u.id?.split('-')[0].toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full", role.color)}>
                        {u.role === "ADMIN" ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {role[language as "ar"|"en"]}
                      </span>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                          <Mail className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                          <span className="truncate max-w-[160px]">{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                            <Phone className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full",
                        u.isActive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", u.isActive ? "bg-emerald-500" : "bg-neutral-400")} />
                        {u.isActive ? (language === "ar" ? "نشط" : "Active") : (language === "ar" ? "موقف" : "Inactive")}
                      </span>
                    </td>
                    <td className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(u.createdAt).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US")}
                    </td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => toggleStatus(u.id, u.isActive)}
                          className={cn("p-1.5 rounded-lg transition-colors",
                            u.isActive ? "text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" : "text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30")}>
                          {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteUser(u.id)}
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

      {/* Add User Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl-soft w-full max-w-md border border-neutral-100 dark:border-neutral-800 scale-in" dir={dir}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                  <UserCog className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="font-bold text-neutral-900 dark:text-white text-sm">
                  {language === "ar" ? "إضافة مستخدم جديد" : "Add New User"}
                </h2>
              </div>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                      {language === "ar" ? "الاسم الأول" : "First Name"}
                    </label>
                    <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                      {language === "ar" ? "اسم العائلة" : "Last Name"}
                    </label>
                    <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                    {language === "ar" ? "البريد الإلكتروني" : "Email"}
                  </label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} dir="ltr"
                    className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                      {language === "ar" ? "كلمة المرور" : "Password"}
                    </label>
                    <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} dir="ltr"
                      placeholder="••••••••"
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                      {language === "ar" ? "رقم الهاتف" : "Phone"}
                    </label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} dir="ltr"
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                    {language === "ar" ? "الدور" : "Role"}
                  </label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                    className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none">
                    <option value="ADMIN">{language === "ar" ? "مدير النظام" : "System Admin"}</option>
                    <option value="OWNER">{language === "ar" ? "المالك" : "Owner"}</option>
                    <option value="ACCOUNTANT">{language === "ar" ? "محاسب" : "Accountant"}</option>
                  </select>
                </div>

                {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {language === "ar" ? "إضافة" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
