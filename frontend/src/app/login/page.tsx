"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Building2, Eye, EyeOff, Loader2, ArrowLeft,
  CheckCircle2, Shield, BarChart3, Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: BarChart3, text: "تقارير مالية متكاملة", sub: "ميزانية، دخل، تدفق نقدي" },
  { icon: Users,     text: "إدارة المستأجرين",   sub: "عقود، دفعات، سندات قبض"  },
  { icon: Shield,    text: "أمان وموثوقية",       sub: "تشفير بنكي المستوى"        },
  { icon: CheckCircle2, text: "محاسبة دقيقة",   sub: "قيد مزدوج متكامل"          },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [companyName, setCompanyName] = useState("سَنَد");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) router.replace("/dashboard");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    fetch(`${apiUrl}/settings`)
      .then(r => r.ok ? r.json() : null)
      .then(s => { if (s?.companyName) setCompanyName(s.companyName); })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "بيانات الدخول غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* ── Left Panel: Form ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-neutral-950">
        <div className="w-full max-w-[400px] space-y-8 page-enter">
          {/* Logo */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">{companyName}</span>
            </div>
            <h1 className="text-3xl font-black text-neutral-900 dark:text-white leading-tight">
              مرحباً بك مجدداً
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
              سجّل دخولك للوصول إلى لوحة إدارة العقارات
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in duration-200">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                dir="ltr"
                className={cn(
                  "w-full h-11 rounded-xl border border-neutral-200 dark:border-neutral-700",
                  "bg-neutral-50 dark:bg-neutral-800 px-4 text-sm font-medium",
                  "placeholder:text-neutral-400 text-left",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400",
                  "transition-all duration-150"
                )}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  كلمة المرور
                </label>
                <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  dir="ltr"
                  className={cn(
                    "w-full h-11 rounded-xl border border-neutral-200 dark:border-neutral-700",
                    "bg-neutral-50 dark:bg-neutral-800 px-4 pr-11 text-sm font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400",
                    "transition-all duration-150"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                تذكّرني لمدة 7 أيام
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-11 rounded-xl font-bold text-sm text-white",
                "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]",
                "shadow-md shadow-blue-600/25",
                "flex items-center justify-center gap-2",
                "transition-all duration-150",
                loading && "opacity-75 pointer-events-none"
              )}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحقق...</>
              ) : (
                <><ArrowLeft className="w-4 h-4" /> تسجيل الدخول</>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-neutral-400 font-medium pt-4 border-t border-neutral-100 dark:border-neutral-800">
            {companyName} — نظام إدارة العقارات © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* ── Right Panel: Branding ─────────────────────── */}
      <div className="hidden lg:flex w-[520px] relative overflow-hidden flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        {/* BG pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px"
          }}
        />
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-900/30 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 text-right space-y-8 w-full max-w-sm">
          {/* Icon */}
          <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white leading-snug tracking-tight">
              إدارة عقاراتك<br />
              <span className="text-blue-200">بكل احترافية</span>
            </h2>
            <p className="text-blue-100/80 text-base leading-relaxed font-medium">
              نظام متكامل للمحاسبة العقارية، إدارة المستأجرين، والتقارير المالية الشاملة.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3.5 p-3.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{f.text}</p>
                  <p className="text-blue-200/70 text-xs font-medium">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
