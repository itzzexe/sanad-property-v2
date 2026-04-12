"use client";

import { useState, useEffect } from "react";
import {
  History, User as UserIcon, Search, Activity,
  ArrowLeftRight, FileCode, CheckCircle2, XCircle, Terminal, RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { formatDistanceToNow, format } from "date-fns";
import { ar } from "date-fns/locale";

const Sk = ({ className }: { className?: string }) => (
  <div className={cn("skeleton-shimmer rounded-lg", className)} />
);

const actionStyle: Record<string, string> = {
  CREATE: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  UPDATE: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  DELETE: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",
};

export default function AuditLogsPage() {
  const { language, dir } = useLanguage();
  const [logs,    setLogs]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/settings/audit?limit=50");
      setLogs((res as any).data ?? res ?? []);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = logs.filter(l =>
    `${l.user?.firstName} ${l.user?.lastName} ${l.user?.email} ${l.entity} ${l.action}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const t = (ar: string, en: string) => language === "ar" ? ar : en;

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {t("سجل التدقيق", "Audit Log")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? "..." : `${logs.length} ${t("عملية", "entries")}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t("بحث...","Search...")}
              className="h-10 w-64 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ps-9 pe-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
          </div>
          <button onClick={load}
            className="flex items-center gap-2 h-10 px-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            {t("تحديث","Refresh")}
          </button>
        </div>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t("إجمالي العمليات","Total"), value: logs.length, color: "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300", icon: Terminal },
            { label: t("إضافة","Create"),           value: logs.filter(l => l.action === "CREATE").length, color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
            { label: t("تعديل","Update"),            value: logs.filter(l => l.action === "UPDATE").length, color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400", icon: ArrowLeftRight },
            { label: t("حذف","Delete"),              value: logs.filter(l => l.action === "DELETE").length, color: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400", icon: XCircle },
          ].map((s, i) => (
            <div key={i} className={cn("px-4 py-3 rounded-xl flex items-center gap-2.5", s.color)}>
              <s.icon className="w-4 h-4 opacity-60 flex-shrink-0" />
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
        <div className="space-y-3">{[...Array(6)].map((_,i) => <Sk key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <History className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">
            {t("لا توجد سجلات","No logs found")}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className={language === "ar" ? "text-right" : "text-left"}>{t("المستخدم","User")}</th>
                <th>{t("النوع","Action")}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{t("الكيان","Entity")}</th>
                <th className={language === "ar" ? "text-right" : "text-left"}>{t("المعرف","ID")}</th>
                <th>{t("التوقيت","Time")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log: any) => (
                <tr key={log.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-3.5 h-3.5 text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {log.user?.firstName} {log.user?.lastName}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono">{log.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={cn("inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide", actionStyle[log.action] ?? "bg-neutral-100 text-neutral-600")}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                      <FileCode className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      <span className="font-semibold">{log.entity}</span>
                    </div>
                  </td>
                  <td>
                    <code className="text-[10px] bg-neutral-50 dark:bg-neutral-800 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-700 text-neutral-500 font-mono">
                      {(log.entityId ?? "").split("-")[0]}…
                    </code>
                  </td>
                  <td>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: language === "ar" ? ar : undefined })}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {format(new Date(log.createdAt), "HH:mm:ss")}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
