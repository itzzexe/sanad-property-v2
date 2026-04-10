"use client";

import { useState } from "react";
import { 
  History, Calendar, Filter, Search, 
  ArrowUpRight, Clock, CheckCircle2,
  AlertTriangle, DollarSign, Building, User
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

const MOCK_INSTALLMENTS = [
  { id: "INST-900", dueDate: "2025-02-01", tenant: "مصطفى حسن", unit: "شقة 102", amount: 1200000, status: "Upcoming" },
  { id: "INST-901", dueDate: "2025-01-01", tenant: "علي محمود", unit: "محل 4", amount: 3500000, status: "Paid" },
  { id: "INST-902", dueDate: "2024-12-01", tenant: "زينب كمال", unit: "شقة 305", amount: 1200000, status: "Overdue" },
];

export default function InstallmentsPage() {
  const { language, dir } = useLanguage();
  const { format } = useCurrency();

  const columns = [
    { header: language === 'ar' ? "الاستحقاق" : "Due Date", accessorKey: "dueDate", cell: (item: any) => (
      <div className="flex items-center gap-2">
         <Calendar className="w-4 h-4 text-neutral-400" />
         <span className="font-bold">{item.dueDate}</span>
      </div>
    )},
    { header: language === 'ar' ? "المستأجر" : "Tenant", accessorKey: "tenant" },
    { header: language === 'ar' ? "الوحدة" : "Unit", accessorKey: "unit" },
    { header: language === 'ar' ? "المبلغ" : "Amount", accessorKey: "amount", cell: (item: any) => (
      <span className="font-black">{format(item.amount)}</span>
    )},
    { header: language === 'ar' ? "الحالة" : "Status", accessorKey: "status", cell: (item: any) => (
      <Badge 
        variant={item.status === 'Paid' ? 'success' : item.status === 'Upcoming' ? 'warning' : 'danger'}
        className="rounded-full px-3"
      >
        {item.status}
      </Badge>
    )},
    { header: language === 'ar' ? "الإجراءات" : "Actions", accessorKey: "actions", cell: () => (
      <Button variant="outline" size="sm" className="rounded-lg">{language === 'ar' ? "سداد" : "Pay"}</Button>
    )},
  ];

  return (
    <div className="space-y-8 pb-12 font-arabic" dir={dir}>
      <PageHeader 
        title={language === 'ar' ? "جدولة الأقساط" : "Installment Schedule"}
        description={language === 'ar' ? "متابعة المواعيد القادمة، المتأخرات، وتاريخ السداد لكل عقد." : "Monitor upcoming dues, arrears, and payment history for each contract."}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <Card className="p-6 border-l-4 border-l-amber-500">
            <p className="text-[10px] font-black uppercase text-neutral-400 mb-1">{language === 'ar' ? "أقساط هذا الشهر" : "Dues This Month"}</p>
            <h3 className="text-2xl font-black">{format(18500000)}</h3>
         </Card>
         <Card className="p-6 border-l-4 border-l-rose-500">
            <p className="text-[10px] font-black uppercase text-neutral-400 mb-1">{language === 'ar' ? "إجمالي المتأخرات" : "Total Overdue"}</p>
            <h3 className="text-2xl font-black">{format(4200000)}</h3>
         </Card>
         <Card className="p-6 border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-black uppercase text-neutral-400 mb-1">{language === 'ar' ? "نسبة الالتزام" : "Compliance Rate"}</p>
            <h3 className="text-2xl font-black">94.5%</h3>
         </Card>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input placeholder={language === 'ar' ? "بحث في الأقساط..." : "Search installments..."} className="pl-10 h-12 rounded-xl" />
         </div>
      </div>

      <DataTable columns={columns} data={MOCK_INSTALLMENTS} />
    </div>
  );
}
