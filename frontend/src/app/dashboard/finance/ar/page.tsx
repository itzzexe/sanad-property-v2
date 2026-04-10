"use client";

import { ArrowDownToLine, Receipt, Clock, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function AccountsReceivablePage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Accounts Receivable"
        description="Track pending tenant payments, aging invoices, and collection status."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-primary-50 rounded-lg"><Wallet className="w-5 h-5 text-primary-500" /></div>
               <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Total Outstanding</span>
            </div>
            <h3 className="text-3xl font-black text-neutral-900 dark:text-neutral-50">$0.00</h3>
         </div>
         <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-5 h-5 text-amber-500" /></div>
               <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Overdue</span>
            </div>
            <h3 className="text-3xl font-black text-neutral-900 dark:text-neutral-50">$0.00</h3>
         </div>
         <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-accent-50 rounded-lg"><Receipt className="w-5 h-5 text-accent-500" /></div>
               <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Next Due</span>
            </div>
            <h3 className="text-3xl font-black text-neutral-900 dark:text-neutral-50">$0.00</h3>
         </div>
      </div>

      <EmptyState 
        icon={ArrowDownToLine}
        title="No pending receivables"
        description="Every tenant seems up to date. New invoices will appear here automatically when monthly rent is generated."
        actionLabel="Generate Invoices"
        onAction={() => alert("Invoice generation coming soon!")}
      />
    </div>
  );
}
