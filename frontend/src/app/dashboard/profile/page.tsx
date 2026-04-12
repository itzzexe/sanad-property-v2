"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Save, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const roleLabel: Record<string, { ar: string; en: string; color: string }> = {
  ADMIN:       { ar: "مدير النظام",  en: "System Admin",  color: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400" },
  OWNER:       { ar: "المالك",       en: "Owner",          color: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400" },
  ACCOUNTANT:  { ar: "محاسب",        en: "Accountant",     color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" },
};

function avatarColor(name: string) {
  const colors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-cyan-500","bg-indigo-500","bg-pink-500"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export default function ProfilePage() {
  const { language, dir } = useLanguage();

  const [profile, setProfile]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [saveErr, setSaveErr]   = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");

  const [curPw,     setCurPw]     = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confPw,    setConfPw]    = useState("");
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwSaved,   setPwSaved]   = useState(false);
  const [pwErr,     setPwErr]     = useState("");

  useEffect(() => {
    api.get("/auth/profile")
      .then((res: any) => {
        const d = res.data ?? res;
        setProfile(d);
        setFirstName(d.firstName ?? "");
        setLastName(d.lastName  ?? "");
        setPhone(d.phone        ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true); setSaved(false); setSaveErr("");
    try {
      await api.patch("/auth/profile", { firstName, lastName, phone });
      setProfile((p: any) => ({ ...p, firstName, lastName, phone }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setSaveErr(e?.response?.data?.message ?? (language === "ar" ? "حدث خطأ" : "An error occurred"));
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    setPwErr(""); setPwSaved(false);
    if (newPw !== confPw) {
      setPwErr(language === "ar" ? "كلمتا المرور غير متطابقتان" : "Passwords do not match");
      return;
    }
    if (newPw.length < 8) {
      setPwErr(language === "ar" ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    try {
      await api.patch("/auth/change-password", { currentPassword: curPw, newPassword: newPw });
      setPwSaved(true);
      setCurPw(""); setNewPw(""); setConfPw("");
      setTimeout(() => setPwSaved(false), 3000);
    } catch (e: any) {
      setPwErr(e?.response?.data?.message ?? (language === "ar" ? "كلمة المرور الحالية غير صحيحة" : "Current password is incorrect"));
    } finally { setPwSaving(false); }
  };

  const initials = profile
    ? `${(profile.firstName ?? "")[0] ?? ""}${(profile.lastName ?? "")[0] ?? ""}`.toUpperCase()
    : "";
  const fullName = profile ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() : "";
  const avatarBg = fullName ? avatarColor(fullName) : "bg-blue-500";
  const role     = roleLabel[profile?.role ?? ""] ?? { ar: profile?.role, en: profile?.role, color: "bg-neutral-100 text-neutral-600" };

  return (
    <div className={cn("space-y-6 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          {language === "ar" ? "الملف الشخصي" : "Profile"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {language === "ar" ? "إدارة معلوماتك الشخصية وإعدادات الأمان" : "Manage your personal information and security settings"}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Sk className="h-64" />
          <div className="lg:col-span-2 space-y-5">
            <Sk className="h-52" />
            <Sk className="h-52" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Avatar Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-blue-600 to-blue-800" />
            <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
              <div className={cn("w-24 h-24 rounded-2xl border-4 border-white dark:border-neutral-900 flex items-center justify-center text-white text-3xl font-black shadow-md", avatarBg)}>
                {initials || <User className="w-10 h-10" />}
              </div>
              <h2 className="mt-3 text-lg font-black text-neutral-900 dark:text-white">{fullName || "—"}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{profile?.email}</p>
              <span className={cn("mt-3 inline-block text-[11px] font-bold px-3 py-1 rounded-full", role.color)}>
                {role[language as "ar"|"en"]}
              </span>

              <div className="mt-5 w-full space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400" />
                  <span className="truncate">{profile?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                  <Shield className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400" />
                  <span>{role[language as "ar"|"en"]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forms Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Personal Info */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card">
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white text-sm">
                      {language === "ar" ? "المعلومات الشخصية" : "Personal Information"}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {language === "ar" ? "تحديث بيانات الهوية والاتصال" : "Update your identity and contact details"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                      {language === "ar" ? "الاسم الأول" : "First Name"}
                    </label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                      {language === "ar" ? "اسم العائلة" : "Last Name"}
                    </label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)}
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                      {language === "ar" ? "رقم الهاتف" : "Phone Number"}
                    </label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} dir="ltr"
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                      {language === "ar" ? "البريد الإلكتروني" : "Email"}
                      <span className="ms-1 text-[10px] font-normal opacity-60">
                        ({language === "ar" ? "للقراءة فقط" : "read only"})
                      </span>
                    </label>
                    <input value={profile?.email ?? ""} disabled dir="ltr"
                      className="w-full h-10 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 px-3 text-sm text-neutral-400 cursor-not-allowed" />
                  </div>
                </div>

                {saveErr && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {saveErr}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  {saved && (
                    <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      {language === "ar" ? "تم الحفظ" : "Saved successfully"}
                    </div>
                  )}
                  <button onClick={saveProfile} disabled={saving}
                    className={cn("ms-auto flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60", saving && "cursor-not-allowed")}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card">
              <div className="flex items-center gap-2.5 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white text-sm">
                    {language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {language === "ar" ? "استخدم كلمة مرور قوية لحماية حسابك" : "Use a strong password to protect your account"}
                  </p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                    {language === "ar" ? "كلمة المرور الحالية" : "Current Password"}
                  </label>
                  <input type="password" value={curPw} onChange={e => setCurPw(e.target.value)} dir="ltr"
                    placeholder="••••••••"
                    className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                      {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                    </label>
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} dir="ltr"
                      placeholder="••••••••"
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                      {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                    </label>
                    <input type="password" value={confPw} onChange={e => setConfPw(e.target.value)} dir="ltr"
                      placeholder="••••••••"
                      className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                  </div>
                </div>

                {pwErr && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {pwErr}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  {pwSaved && (
                    <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      {language === "ar" ? "تم تغيير كلمة المرور" : "Password changed successfully"}
                    </div>
                  )}
                  <button onClick={changePassword} disabled={pwSaving || !curPw || !newPw || !confPw}
                    className={cn("ms-auto flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50", pwSaving && "cursor-not-allowed")}>
                    {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {language === "ar" ? "تحديث كلمة المرور" : "Update Password"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
