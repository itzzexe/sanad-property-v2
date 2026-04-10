"use client";

import { ArrowUpToLine, CreditCard, Building, Hammer } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function AccountsPayablePage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Accounts Payable"
        description="Manage vendor payments, utility bills, and maintenance costs."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-danger-bg rounded-lg"><CreditCard className="w-5 h-5 text-danger" /></div>
               <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Unpaid Bills</span>
            </div>
            <h3 className="text-3xl font-black text-neutral-900 dark:text-neutral-50">$0.00</h3>
         </div>
         <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-blue-50 rounded-lg"><Hammer className="w-5 h-5 text-blue-500" /></div>
               <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Maintenance</span>
            </div>
            <h3 className="text-3xl font-black text-neutral-900 dark:text-neutral-50">$0.00</h3>
         </div>
         <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-neutral-100 rounded-lg"><Building className="w-5 h-5 text-neutral-600" /></div>
               <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Fixed Costs</span>
            </div>
            <h3 className="text-3xl font-black text-neutral-900 dark:text-neutral-50">$0.00</h3>
         </div>
      </div>

      <EmptyState 
        icon={ArrowUpToLine}
        title="No pending bills"
        description="You are all caught up with your vendors. When maintenance requests are filed or utilities arrive, they will appear here."
        actionLabel="Record New Bill"
        onAction={() => alert("Bill recording coming soon!")}
      />
    </div>
  );
}
