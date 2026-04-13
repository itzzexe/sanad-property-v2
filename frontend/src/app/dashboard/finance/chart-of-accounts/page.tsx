"use client";

import { useState, useEffect } from "react";
import { financeApi, Account } from "@/lib/api/finance";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Plus, Loader2, Clock } from "lucide-react";
import { AccountDialog } from "@/components/finance/AccountDialog";
import { useLanguage } from "@/context/language-context";

const TYPE_COLORS: Record<string, string> = {
  ASSET:     "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  LIABILITY: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
  EQUITY:    "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400",
  REVENUE:   "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  EXPENSE:   "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",
};

function AccountRow({ account, level = 0, onAddChild }: {
  account: Account & { children?: Account[] };
  level?: number;
  onAddChild: (a: Account) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = (account.children?.length ?? 0) > 0;

  return (
    <>
      <tr className={cn("border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 group transition-colors", !account.isActive && "opacity-50")}>
        <td className="py-2.5 px-4" style={{ paddingInlineStart: `${16 + level * 20}px` }}>
          <div className="flex items-center gap-1.5">
            {hasChildren ? (
              <button onClick={() => setOpen(!open)} className="text-neutral-400 hover:text-blue-600 transition-colors flex-shrink-0">
                {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : <div className="w-3.5 flex-shrink-0" />}
            <code className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">{account.code}</code>
          </div>
        </td>
        <td className="py-2.5 px-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{account.name}</span>
            <button onClick={() => onAddChild(account)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all flex-shrink-0">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </td>
        <td className="py-2.5 px-4">
          <span className={cn("inline-block text-[10px] font-bold px-2 py-0.5 rounded-full", TYPE_COLORS[account.type] ?? "bg-neutral-100 text-neutral-500")}>
            {account.type}
          </span>
        </td>
        <td className="py-2.5 px-4 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          {account.currencyCode || "USD"}
        </td>
        <td className="py-2.5 px-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("inline-block text-[10px] font-bold px-2 py-0.5 rounded-full",
              account.isActive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400")}>
              {account.isActive ? "نشط" : "متوقف"}
            </span>
            {(account as any).pendingApproval && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                <Clock className="w-2.5 h-2.5" />
                انتظار الموافقة
              </span>
            )}
          </div>
        </td>
      </tr>
      {open && hasChildren && account.children!.map(child => (
        <AccountRow key={child.id} account={child as any} level={level + 1} onAddChild={onAddChild} />
      ))}
    </>
  );
}

export default function ChartOfAccountsPage() {
  const { language, dir } = useLanguage();
  const [accounts,      setAccounts]      = useState<Account[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [parentAccount, setParentAccount] = useState<Account | null>(null);

  const fetchAccounts = () => {
    setLoading(true);
    financeApi.getAccounts()
      .then(setAccounts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAccounts(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
    </div>
  );

  // Build tree
  const map = new Map<string, Account & { children: Account[] }>();
  accounts.forEach(a => map.set(a.id, { ...a, children: [] }));
  const roots: Account[] = [];
  map.forEach(a => {
    if (a.parentId && map.has(a.parentId)) map.get(a.parentId)!.children.push(a);
    else roots.push(a);
  });

  return (
    <div className={cn("space-y-5 page-enter pb-8", language === "ar" ? "text-right" : "")} dir={dir}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {language === "ar" ? "شجرة الحسابات" : "Chart of Accounts"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {accounts.length} {language === "ar" ? "حساب" : "accounts"}
          </p>
        </div>
        <button onClick={() => { setParentAccount(null); setDialogOpen(true); }}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
          <Plus className="w-4 h-4" />
          {language === "ar" ? "إضافة حساب رئيسي" : "Add Account"}
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/30">
              <th className="py-3 px-4 text-start text-[10px] font-black text-neutral-500 uppercase tracking-widest w-32">
                {language === "ar" ? "الرمز" : "Code"}
              </th>
              <th className="py-3 px-4 text-start text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                {language === "ar" ? "اسم الحساب" : "Account Name"}
              </th>
              <th className="py-3 px-4 text-start text-[10px] font-black text-neutral-500 uppercase tracking-widest w-28">
                {language === "ar" ? "النوع" : "Type"}
              </th>
              <th className="py-3 px-4 text-start text-[10px] font-black text-neutral-500 uppercase tracking-widest w-20">
                {language === "ar" ? "العملة" : "Currency"}
              </th>
              <th className="py-3 px-4 text-start text-[10px] font-black text-neutral-500 uppercase tracking-widest w-20">
                {language === "ar" ? "الحالة" : "Status"}
              </th>
            </tr>
          </thead>
          <tbody>
            {roots.map(a => <AccountRow key={a.id} account={a as any} onAddChild={pa => { setParentAccount(pa); setDialogOpen(true); }} />)}
          </tbody>
        </table>
      </div>

      <AccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchAccounts}
        parentAccount={parentAccount}
      />
    </div>
  );
}
