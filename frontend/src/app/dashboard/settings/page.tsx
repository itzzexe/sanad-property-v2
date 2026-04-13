"use client";

import { useState, useEffect } from "react";
import {
  Building2, Globe, DollarSign,
  Save, Loader2, CheckCircle2, Bell, Shield
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useTheme } from "@/context/theme-context";
import { toast } from "sonner";

const inp = "w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

const TABS = [
  { id: "company",       icon: Building2, ar: "الشركة",       en: "Company"       },
  { id: "localization",  icon: Globe,     ar: "اللغة والعملة", en: "Localization"  },
  { id: "finance",       icon: DollarSign,ar: "المالية",       en: "Finance"       },
  { id: "notifications", icon: Bell,      ar: "الإشعارات",     en: "Notifications" },
  { id: "security",      icon: Shield,    ar: "الأمان",        en: "Security"      },
];

export default function SettingsPage() {
  const { language, setLanguage, dir } = useLanguage();
  const { theme, toggleTheme }         = useTheme();

  const [activeTab,  setActiveTab]  = useState("company");
  const [settings,   setSettings]   = useState<any>({});
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [savedMsg,   setSavedMsg]   = useState(false);

  useEffect(() => {
    api.get("/settings")
      .then(res => setSettings(res ?? {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/settings", settings);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (err: any) { toast.error(err?.response?.data?.message ?? err.message); }
    finally { setSaving(false); }
  };

  const field = (key: string, label: string, type = "text", placeholder = "") => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{label}</label>
      <input
        type={type}
        value={settings[key] ?? ""}
        onChange={e => setSettings({ ...settings, [key]: type === "number" ? +e.target.value : e.target.value })}
        placeholder={placeholder}
        className={inp}
      />
    </div>
  );

  const toggle = (key: string, label: string, desc?: string) => (
    <div className="flex items-center justify-between py-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
      <div>
        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-neutral-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => setSettings({ ...settings, [key]: !settings[key] })}
        className={cn(
          "relative w-10 h-5 rounded-full transition-colors",
          settings[key] ? "bg-blue-600" : "bg-neutral-200 dark:bg-neutral-700"
        )}
      >
        <span className={cn(
          "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all",
          settings[key] ? "left-[22px]" : "left-0.5"
        )} />
      </button>
    </div>
  );

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {language === "ar" ? "الإعدادات" : "Settings"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === "ar" ? "إدارة إعدادات النظام والتطبيق" : "Manage system and application settings"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4" />
              {language === "ar" ? "تم الحفظ" : "Saved"}
            </span>
          )}
          <button onClick={handleSave} disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar tabs */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-2 space-y-0.5">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all text-start",
                  activeTab === tab.id
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                )}>
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {tab[language as "ar"|"en"]}
              </button>
            ))}
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_,i) => <div key={i} className="skeleton-shimmer h-10 rounded-lg" />)}
            </div>
          ) : (
            <>
              {activeTab === "company" && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
                    {language === "ar" ? "بيانات الشركة" : "Company Information"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {field("companyName",    language==="ar"?"اسم الشركة":"Company Name",       "text", "سَنَد للعقارات")}
                    {field("companyPhone",   language==="ar"?"هاتف الشركة":"Company Phone")}
                    {field("companyEmail",   language==="ar"?"بريد الشركة":"Company Email",    "email")}
                    {field("companyAddress", language==="ar"?"عنوان الشركة":"Company Address")}
                    {field("companyCity",    language==="ar"?"المدينة":"City")}
                    {field("companyCountry", language==="ar"?"الدولة":"Country")}
                    {field("taxId",          language==="ar"?"الرقم الضريبي":"Tax ID")}
                    {field("licenseNumber",  language==="ar"?"رقم الرخصة":"License Number")}
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      {language==="ar"?"عن الشركة":"About Company"}
                    </label>
                    <textarea value={settings.companyDescription ?? ""} rows={3} className={inp + " h-auto resize-none py-2"}
                      onChange={e => setSettings({ ...settings, companyDescription: e.target.value })} />
                  </div>
                </div>
              )}

              {activeTab === "localization" && (
                <div className="space-y-6">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    {language === "ar" ? "اللغة والعملة" : "Language & Currency"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        {language==="ar"?"لغة الواجهة":"Interface Language"}
                      </label>
                      <select value={language} onChange={e => setLanguage(e.target.value as "ar"|"en")} className={inp}>
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        {language==="ar"?"العملة الافتراضية":"Default Currency"}
                      </label>
                      <select value={settings.defaultCurrency ?? "USD"} onChange={e => setSettings({ ...settings, defaultCurrency: e.target.value })} className={inp}>
                        <option value="USD">USD — دولار أمريكي</option>
                        <option value="IQD">IQD — دينار عراقي</option>
                        <option value="EUR">EUR — يورو</option>
                        <option value="SAR">SAR — ريال سعودي</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        {language==="ar"?"سعر صرف IQD/USD":"IQD/USD Exchange Rate"}
                      </label>
                      <input type="number" min="0" value={settings.exchangeRateIQD ?? 1460}
                        onChange={e => setSettings({ ...settings, exchangeRateIQD: +e.target.value })} className={inp} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        {language==="ar"?"التنسيق الزمني":"Date Format"}
                      </label>
                      <select value={settings.dateFormat ?? "DD/MM/YYYY"} onChange={e => setSettings({ ...settings, dateFormat: e.target.value })} className={inp}>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "finance" && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
                    {language === "ar" ? "الإعدادات المالية" : "Financial Settings"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {field("defaultLateFeePercent", language==="ar"?"نسبة الغرامة الافتراضية %":"Default Late Fee %",    "number")}
                    {field("defaultGraceDays",      language==="ar"?"أيام السماح الافتراضية":"Default Grace Days",      "number")}
                    {field("fiscalYearStartMonth",  language==="ar"?"شهر بداية السنة المالية":"Fiscal Year Start Month","number")}
                    {field("invoicePrefix",         language==="ar"?"بادئة رقم الفاتورة":"Invoice Prefix", "text", "INV-")}
                  </div>
                  <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden mt-4">
                    {toggle("autoGenerateReceipts", language==="ar"?"إنشاء سندات تلقائياً":"Auto-generate receipts", language==="ar"?"عند تسجيل كل دفعة":"On every payment record")}
                    {toggle("autoPostJournals",     language==="ar"?"ترحيل القيود تلقائياً":"Auto-post journal entries")}
                    {toggle("allowNegativeBalance", language==="ar"?"السماح بالرصيد السالب":"Allow negative balance")}
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
                    {language === "ar" ? "إعدادات الإشعارات" : "Notification Settings"}
                  </h2>
                  <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                    {toggle("notifyOverduePayments",  language==="ar"?"إشعار المدفوعات المتأخرة":"Notify overdue payments",   language==="ar"?"قبل الاستحقاق بيوم":"1 day before due date")}
                    {toggle("notifyLeaseExpiry",      language==="ar"?"إشعار انتهاء العقود":"Notify lease expiry",           language==="ar"?"قبل 30 يوم من الانتهاء":"30 days before expiry")}
                    {toggle("notifyNewPayment",       language==="ar"?"إشعار عند استلام دفعة":"Notify on new payment")}
                    {toggle("emailNotifications",     language==="ar"?"إشعارات البريد الإلكتروني":"Email notifications")}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {field("notificationEmail",    language==="ar"?"بريد الإشعارات":"Notification Email", "email")}
                    {field("overdueReminderDays",  language==="ar"?"أيام تذكير التأخير":"Overdue Reminder Days", "number")}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
                    {language === "ar" ? "إعدادات الأمان" : "Security Settings"}
                  </h2>
                  <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                    {toggle("requireTwoFactor",     language==="ar"?"المصادقة الثنائية":"Two-factor authentication",    language==="ar"?"تعزيز أمان تسجيل الدخول":"Enhance login security")}
                    {toggle("logAllActions",        language==="ar"?"تسجيل جميع الإجراءات":"Log all user actions")}
                    {toggle("sessionTimeout",       language==="ar"?"انتهاء الجلسة التلقائي":"Auto session timeout")}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {field("sessionTimeoutMinutes", language==="ar"?"مهلة الجلسة (دقيقة)":"Session Timeout (minutes)", "number")}
                    {field("maxLoginAttempts",      language==="ar"?"أقصى محاولات الدخول":"Max Login Attempts", "number")}
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      {language === "ar"
                        ? "⚠ تأكد من استخدام JWT secrets قوية في ملف .env قبل النشر في الإنتاج"
                        : "⚠ Ensure strong JWT secrets are set in .env before deploying to production"}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
