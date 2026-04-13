"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { toast } from "sonner";
import {
  ClipboardCheck, CheckCircle2, XCircle, Clock, BookOpen,
  PenLine, Loader2, Search, RefreshCcw, AlertTriangle
} from "lucide-react";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const typeInfo: Record<string, { ar: string; en: string; icon: any; color: string }> = {
  JOURNAL_ENTRY: {
    ar: "قيد يومية", en: "Journal Entry",
    icon: PenLine,
    color: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  },
  ACCOUNT: {
    ar: "حساب جديد", en: "New Account",
    icon: BookOpen,
    color: "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400",
  },
};

const statusInfo: Record<string, { ar: string; en: string; color: string }> = {
  PENDING:  { ar: "بانتظار الموافقة", en: "Pending",  color: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" },
  APPROVED: { ar: "موافق عليه",       en: "Approved", color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" },
  REJECTED: { ar: "مرفوض",            en: "Rejected", color: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400" },
};

export default function ApprovalsPage() {
  const { language, dir } = useLanguage();
  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  const [requests, setRequests] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<"ALL"|"PENDING"|"APPROVED"|"REJECTED">("PENDING");
  const [search,   setSearch]   = useState("");
  const [acting,   setActing]   = useState<string | null>(null);

  // Rejection note modal
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectNote,   setRejectNote]   = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== "ALL" ? `?status=${filter}` : "";
      const res = await api.get(`/approvals${params}`);
      setRequests(res.data ?? res ?? []);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]);

  const handleApprove = async (id: string) => {
    setActing(id);
    try { await api.post(`/approvals/${id}/approve`, {}); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message ?? t("فشلت الموافقة","Approval failed")); }
    finally { setActing(null); }
  };

  const openReject = (req: any) => {
    setRejectTarget(req); setRejectNote(""); setRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActing(rejectTarget.id);
    try {
      await api.post(`/approvals/${rejectTarget.id}/reject`, { note: rejectNote });
      setRejectModal(false); load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? t("فشل الرفض","Rejection failed")); }
    finally { setActing(null); }
  };

  const filtered = requests.filter(r => {
    if (!search) return true;
    return r.entityLabel?.toLowerCase().includes(search.toLowerCase()) ||
           r.requester?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
           r.requester?.email?.toLowerCase().includes(search.toLowerCase());
  });

  const pending  = requests.filter(r => r.status === "PENDING").length;
  const approved = requests.filter(r => r.status === "APPROVED").length;
  const rejected = requests.filter(r => r.status === "REJECTED").length;

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            {t("طلبات الموافقة","Approval Requests")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${pending} ${t("بانتظار الموافقة","pending")}`}
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 h-9 px-4 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          {t("تحديث","Refresh")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t("بانتظار الموافقة","Pending"),  value: pending,  color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30", icon: Clock },
          { label: t("موافق عليها","Approved"),       value: approved, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30", icon: CheckCircle2 },
          { label: t("مرفوضة","Rejected"),            value: rejected, color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30", icon: XCircle },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl border p-4 flex items-center gap-3", s.bg)}>
            <s.icon className={cn("w-5 h-5 flex-shrink-0", s.color)} />
            <div>
              <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("بحث...","Search...")}
            className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["ALL","PENDING","APPROVED","REJECTED"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn("h-10 px-4 rounded-lg text-xs font-bold transition-all border",
                filter === s
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800")}>
              {s === "ALL" ? t("الكل","All") :
               s === "PENDING" ? t("بانتظار","Pending") :
               s === "APPROVED" ? t("موافق","Approved") : t("مرفوض","Rejected")}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <Sk key={i} className="h-24" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <ClipboardCheck className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {t("لا توجد طلبات","No requests found")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req: any) => {
            const ti = typeInfo[req.type] ?? typeInfo.JOURNAL_ENTRY;
            const si = statusInfo[req.status] ?? statusInfo.PENDING;
            const Icon = ti.icon;
            const isActing = acting === req.id;
            return (
              <div key={req.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card p-4 flex items-start gap-4">
                {/* Type icon */}
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", ti.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", ti.color)}>{ti[language as "ar"|"en"]}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", si.color)}>{si[language as "ar"|"en"]}</span>
                  </div>
                  <p className="font-bold text-neutral-900 dark:text-white text-sm line-clamp-1">
                    {req.entityLabel ?? req.entityId}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{t("بواسطة","By")}: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{req.requester?.firstName} {req.requester?.lastName}</span></span>
                    <span>{new Date(req.createdAt).toLocaleDateString(language === "ar" ? "ar-IQ" : "en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    {req.status === "REJECTED" && req.note && (
                      <span className="text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {req.note}
                      </span>
                    )}
                    {req.reviewer && req.status !== "PENDING" && (
                      <span>{t("راجعه","Reviewed by")}: <span className="font-semibold">{req.reviewer?.firstName} {req.reviewer?.lastName}</span></span>
                    )}
                  </div>
                </div>
                {/* Actions (only for PENDING) */}
                {req.status === "PENDING" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={!!isActing}
                      className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                    >
                      {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {t("موافقة","Approve")}
                    </button>
                    <button
                      onClick={() => openReject(req)}
                      disabled={!!isActing}
                      className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {t("رفض","Reject")}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRejectModal(false)} />
          <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 dark:border-neutral-800 p-6" dir={dir}>
            <h3 className="font-black text-neutral-900 dark:text-white text-lg mb-1">{t("رفض الطلب","Reject Request")}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              {rejectTarget.entityLabel ?? rejectTarget.entityId}
            </p>
            <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">{t("سبب الرفض (اختياري)","Reason (optional)")}</label>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder={t("أدخل سبب الرفض...","Enter rejection reason...")}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 resize-none transition-all mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(false)}
                className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                {t("إلغاء","Cancel")}
              </button>
              <button onClick={handleReject} disabled={acting === rejectTarget?.id}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-colors disabled:opacity-60">
                {acting === rejectTarget?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {t("تأكيد الرفض","Confirm Reject")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
