"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, Search, Plus, Filter, 
  ArrowUpRight, ArrowDownRight, 
  Clock, CheckCircle2, AlertCircle,
  FileText, Download, MoreVertical,
  Calendar, Building2, User
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";

const MOCK_PAYMENTS = [
  { id: "PAY-1001", date: "2025-01-15", tenant: "حيدر علي", unit: "شقة 402", amount: 1250000, status: "Paid", method: "Cash" },
  { id: "PAY-1002", date: "2025-01-16", tenant: "سارة محمود", unit: "مكتب 12", amount: 800000, status: "Pending", method: "Transfer" },
  { id: "PAY-1003", date: "2025-01-10", tenant: "عمر خالد", unit: "شقة 104", amount: 1250000, status: "Overdue", method: "ZainCash" },
];

export default function PaymentsPage() {
  const { language, dir, t } = useLanguage();
  const { format } = useCurrency();
  const [loading, setLoading] = useState(false);

  const columns = [
    { header: language === 'ar' ? "المرجع" : "Ref", accessorKey: "id" },
    { header: language === 'ar' ? "التاريخ" : "Date", accessorKey: "date" },
    { header: language === 'ar' ? "المستأجر" : "Tenant", accessorKey: "tenant", cell: (item: any) => (
      <div className="flex items-center gap-2">
        <User className="w-3.5 h-3.5 text-neutral-400" />
        <span className="font-bold">{item.tenant}</span>
      </div>
    )},
    { header: language === 'ar' ? "الوحدة" : "Unit", accessorKey: "unit" },
    { header: language === 'ar' ? "المبلغ" : "Amount", accessorKey: "amount", cell: (item: any) => (
      <span className="font-black text-neutral-900 dark:text-neutral-50">{format(item.amount)}</span>
    )},
    { header: language === 'ar' ? "الحالة" : "Status", accessorKey: "status", cell: (item: any) => (
      <Badge 
        variant={item.status === "Paid" ? "success" : item.status === "Pending" ? "warning" : "danger"}
        size="sm"
      >
        {item.status}
      </Badge>
    )},
    { header: language === 'ar' ? "الإجراءات" : "Actions", accessorKey: "actions", cell: () => (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><FileText className="w-4 h-4" /></Button>
    )},
  ];

  return (
    <div className="space-y-8 pb-12 font-arabic" dir={dir}>
      <PageHeader 
        title={language === 'ar' ? "التحصيلات والمدفوعات" : "Collections & Payments"}
        description={language === 'ar' ? "تتبع الإيجارات المحصلة، الدفعات المعلقة، وإدارة التدفق النقدي من الوحدات." : "Track collected rents, pending payments, and manage unit cash flow."}
        actions={
          <Button className="bg-primary-600">
             <Plus className="w-4 h-4 mr-2" /> {language === 'ar' ? "تسجيل دفعة" : "Record Payment"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">{language === 'ar' ? "إجمالي المحصل" : "Total Collected"}</p>
            <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-50">{format(45000000)}</h3>
         </div>
         <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">{language === 'ar' ? "قيد المعالجة" : "Pending"}</p>
            <h3 className="text-2xl font-black text-amber-600">{format(5200000)}</h3>
         </div>
         <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">{language === 'ar' ? "متأخرات" : "Overdue"}</p>
            <h3 className="text-2xl font-black text-rose-600">{format(2100000)}</h3>
         </div>
         <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">{language === 'ar' ? "نسبة التحصيل" : "Collection %"}</p>
            <h3 className="text-2xl font-black text-accent-600">92%</h3>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input placeholder={language === 'ar' ? "بحث في المدفوعات..." : "Search payments..."} className="pl-10 h-12 rounded-xl" />
         </div>
         <Button variant="outline" className="h-12 px-6 rounded-xl border-neutral-200">
            <Filter className="w-4 h-4 mr-2" /> {language === 'ar' ? "تصفية" : "Filter"}
         </Button>
      </div>

      <DataTable columns={columns} data={MOCK_PAYMENTS} />
    </div>
  );
}
