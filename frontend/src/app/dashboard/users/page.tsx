"use client";

import { useState, useEffect } from "react";
import {
  Users, UserPlus, Search, Shield, ShieldCheck, Mail, Phone,
  Trash2, ToggleRight, ToggleLeft, Loader2, X, Check, UserCog,
  KeyRound, ChevronDown, ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { toast } from "sonner";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

function avatarColor(name: string) {
  const colors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-cyan-500","bg-indigo-500","bg-pink-500"];
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

const roleInfo: Record<string, { ar: string; en: string; color: string }> = {
  ADMIN:      { ar: "مدير النظام", en: "System Admin", color: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400" },
  OWNER:      { ar: "المالك",      en: "Owner",        color: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400" },
  ACCOUNTANT: { ar: "محاسب",      en: "Accountant",   color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" },
};

// ── Permission catalogue ─────────────────────────────────
const PERM_GROUPS = [
  {
    group: "العقارات",
    color: "blue",
    perms: [
      { key: "PROPERTY_VIEW",   label: "مشاهدة العقارات" },
      { key: "PROPERTY_CREATE", label: "إضافة عقار" },
      { key: "PROPERTY_EDIT",   label: "تعديل عقار" },
      { key: "PROPERTY_DELETE", label: "حذف عقار" },
    ],
  },
  {
    group: "الوحدات",
    color: "indigo",
    perms: [
      { key: "UNIT_VIEW",   label: "مشاهدة الوحدات" },
      { key: "UNIT_CREATE", label: "إضافة وحدة" },
      { key: "UNIT_EDIT",   label: "تعديل وحدة" },
    ],
  },
  {
    group: "المستأجرون",
    color: "cyan",
    perms: [
      { key: "TENANT_VIEW",   label: "مشاهدة المستأجرين" },
      { key: "TENANT_CREATE", label: "إضافة مستأجر" },
      { key: "TENANT_EDIT",   label: "تعديل مستأجر" },
    ],
  },
  {
    group: "العقود",
    color: "violet",
    perms: [
      { key: "CONTRACT_VIEW",   label: "مشاهدة العقود" },
      { key: "CONTRACT_CREATE", label: "إضافة عقد" },
      { key: "CONTRACT_EDIT",   label: "تعديل عقد" },
    ],
  },
  {
    group: "المدفوعات",
    color: "emerald",
    perms: [
      { key: "PAYMENT_VIEW",   label: "مشاهدة المدفوعات" },
      { key: "PAYMENT_CREATE", label: "إضافة دفعة" },
    ],
  },
  {
    group: "الحسابات المالية",
    color: "amber",
    perms: [
      { key: "ACCOUNT_VIEW",   label: "مشاهدة الحسابات" },
      { key: "ACCOUNT_CREATE", label: "إضافة حساب" },
    ],
  },
  {
    group: "قيود اليومية",
    color: "orange",
    perms: [
      { key: "JOURNAL_VIEW",   label: "مشاهدة القيود" },
      { key: "JOURNAL_CREATE", label: "إنشاء قيد" },
      { key: "JOURNAL_POST",   label: "ترحيل قيد مباشرةً (دون موافقة)" },
    ],
  },
  {
    group: "التقارير",
    color: "teal",
    perms: [
      { key: "REPORT_VIEW", label: "إصدار التقارير" },
    ],
  },
  {
    group: "الموافقات",
    color: "rose",
    perms: [
      { key: "APPROVE_JOURNALS", label: "الموافقة على القيود" },
      { key: "APPROVE_ACCOUNTS", label: "الموافقة على الحسابات" },
      { key: "APPROVE_ALL",      label: "الموافقة على كل شيء" },
    ],
  },
  {
    group: "إدارة المستخدمين",
    color: "purple",
    perms: [
      { key: "USER_MANAGE", label: "إدارة المستخدمين" },
    ],
  },
];

const groupColors: Record<string, string> = {
  blue:   "border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900/40",
  indigo: "border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-900/40",
  cyan:   "border-cyan-200 bg-cyan-50 dark:bg-cyan-950/20 dark:border-cyan-900/40",
  violet: "border-violet-200 bg-violet-50 dark:bg-violet-950/20 dark:border-violet-900/40",
  emerald:"border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/40",
  amber:  "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40",
  orange: "border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900/40",
  teal:   "border-teal-200 bg-teal-50 dark:bg-teal-950/20 dark:border-teal-900/40",
  rose:   "border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900/40",
  purple: "border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-900/40",
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

  // Permissions modal
  const [permModal,    setPermModal]    = useState(false);
  const [permUser,     setPermUser]     = useState<any>(null);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [savingPerms,  setSavingPerms]  = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(PERM_GROUPS.map(g => g.group)));

  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  const load = async () => {
    setLoading(true);
    try { const res = await api.get("/users"); setUsers(res.data ?? res ?? []); }
    catch { setUsers([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await api.post("/users", form);
      setModal(false); setForm({ ...emptyForm }); load();
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? t("فشلت العملية", "Operation failed"));
    } finally { setSaving(false); }
  };

  const toggleStatus = async (id: string, cur: boolean) => {
    try { await api.patch(`/users/${id}/status`, { isActive: !cur }); load(); } catch {}
  };

  const deleteUser = async (id: string) => {
    if (!confirm(t("هل أنت متأكد من الحذف؟", "Are you sure you want to delete?"))) return;
    try { await api.delete(`/users/${id}`); load(); } catch {}
  };

  const openPerms = async (u: any) => {
    setPermUser(u);
    const existing: string[] = u.permissions ?? [];
    setSelectedPerms(new Set(existing));
    setPermModal(true);
  };

  const togglePerm = (key: string) => {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  };

  const selectGroupAll = (perms: { key: string }[], checked: boolean) => {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      perms.forEach(p => checked ? next.add(p.key) : next.delete(p.key));
      return next;
    });
  };

  const savePerms = async () => {
    if (!permUser) return;
    setSavingPerms(true);
    try {
      await api.put(`/users/${permUser.id}/permissions`, { permissions: Array.from(selectedPerms) });
      setPermModal(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t("فشل الحفظ", "Save failed"));
    } finally { setSavingPerms(false); }
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">{t("المستخدمون","Users")}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${users.length} ${t("مستخدم","users")}`}
          </p>
        </div>
        <button onClick={() => { setModal(true); setForm({ ...emptyForm }); setErr(""); }}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
          <UserPlus className="w-4 h-4" /> {t("مستخدم جديد","New User")}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t("بحث...","Search...")}
          className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <Sk key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">{t("لا يوجد مستخدمون","No users found")}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{t("المستخدم","User")}</th>
                <th>{t("الدور","Role")}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{t("بريد / هاتف","Email / Phone")}</th>
                <th>{t("الصلاحيات","Permissions")}</th>
                <th>{t("الحالة","Status")}</th>
                <th>{t("الانضمام","Joined")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => {
                const initials = `${(u.firstName??""[0]??"") }${(u.lastName??"")[0]??""}`.toUpperCase();
                const bg = avatarColor(`${u.firstName}${u.lastName}`);
                const role = roleInfo[u.role] ?? { ar: u.role, en: u.role, color: "bg-neutral-100 text-neutral-600" };
                const permCount = u.permissions?.length ?? 0;
                const isAdmin = u.role === "ADMIN";
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
                      {isAdmin ? (
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                          {t("كل الصلاحيات","All Permissions")}
                        </span>
                      ) : (
                        <button onClick={() => openPerms(u)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                          <KeyRound className="w-3 h-3" />
                          {permCount > 0 ? `${permCount} ${t("صلاحية","perms")}` : t("لا صلاحيات","No perms")}
                        </button>
                      )}
                    </td>
                    <td>
                      <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full",
                        u.isActive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", u.isActive ? "bg-emerald-500" : "bg-neutral-400")} />
                        {u.isActive ? t("نشط","Active") : t("موقف","Inactive")}
                      </span>
                    </td>
                    <td className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(u.createdAt).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US")}
                    </td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => toggleStatus(u.id, u.isActive)}
                          className={cn("p-1.5 rounded-lg transition-colors",
                            u.isActive ? "text-neutral-400 hover:text-rose-600 hover:bg-rose-50" : "text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50")}>
                          {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteUser(u.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
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

      {/* ── Add User Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 dark:border-neutral-800" dir={dir}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                  <UserCog className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="font-bold text-neutral-900 dark:text-white text-sm">{t("إضافة مستخدم جديد","Add New User")}</h2>
              </div>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("الاسم الأول","First Name")}</label>
                    <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("اسم العائلة","Last Name")}</label>
                    <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("البريد الإلكتروني","Email")}</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} dir="ltr" className={inp} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("كلمة المرور","Password")}</label>
                    <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} dir="ltr" placeholder="••••••••" className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("رقم الهاتف","Phone")}</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} dir="ltr" className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("الدور","Role")}</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={inp}>
                    <option value="ADMIN">{t("مدير النظام","System Admin")}</option>
                    <option value="OWNER">{t("المالك","Owner")}</option>
                    <option value="ACCOUNTANT">{t("محاسب","Accountant")}</option>
                  </select>
                </div>
                {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  {t("إلغاء","Cancel")}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {t("إضافة","Add User")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Permissions Modal ── */}
      {permModal && permUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPermModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-2xl border border-neutral-100 dark:border-neutral-800 flex flex-col" style={{ maxHeight: "88vh" }} dir={dir}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <h2 className="font-black text-neutral-900 dark:text-white text-base">{t("إدارة الصلاحيات","Manage Permissions")}</h2>
                  <p className="text-[11px] text-neutral-400">{permUser.firstName} {permUser.lastName} · {permUser.email}</p>
                </div>
              </div>
              <button onClick={() => setPermModal(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info banner */}
            <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs font-semibold text-amber-700 dark:text-amber-400 flex-shrink-0">
              {t(
                "الصلاحيات تُطبق على المستخدمين من غير المدراء. مدير النظام يملك جميع الصلاحيات تلقائياً.",
                "Permissions apply to non-admin users. System admins have all permissions by default."
              )}
            </div>

            {/* Scrollable permissions */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {PERM_GROUPS.map(({ group, color, perms }) => {
                const allChecked = perms.every(p => selectedPerms.has(p.key));
                const someChecked = perms.some(p => selectedPerms.has(p.key));
                const isExpanded = expandedGroups.has(group);
                const gc = groupColors[color] ?? groupColors.blue;
                return (
                  <div key={group} className={cn("rounded-xl border overflow-hidden", gc)}>
                    {/* Group header */}
                    <div className="flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none"
                      onClick={() => toggleGroup(group)}>
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                        onChange={e => { e.stopPropagation(); selectGroupAll(perms, e.target.checked); }}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 rounded accent-blue-600 flex-shrink-0"
                      />
                      <span className="flex-1 text-sm font-black text-neutral-800 dark:text-neutral-200">{group}</span>
                      <span className="text-xs text-neutral-400">{perms.filter(p => selectedPerms.has(p.key)).length}/{perms.length}</span>
                      {isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />}
                    </div>
                    {/* Individual permissions */}
                    {isExpanded && (
                      <div className="border-t border-white/50 dark:border-black/20 bg-white/60 dark:bg-black/10 divide-y divide-white/40 dark:divide-black/10">
                        {perms.map(p => (
                          <label key={p.key} className="flex items-center gap-3 px-5 py-2 cursor-pointer hover:bg-white/70 dark:hover:bg-white/5 transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedPerms.has(p.key)}
                              onChange={() => togglePerm(p.key)}
                              className="w-4 h-4 rounded accent-blue-600 flex-shrink-0"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{p.label}</p>
                              <p className="text-[10px] font-mono text-neutral-400">{p.key}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex-shrink-0 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-2xl">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {selectedPerms.size} {t("صلاحية محددة","permissions selected")}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPermModal(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  {t("إلغاء","Cancel")}
                </button>
                <button onClick={savePerms} disabled={savingPerms}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors">
                  {savingPerms ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {t("حفظ الصلاحيات","Save Permissions")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
