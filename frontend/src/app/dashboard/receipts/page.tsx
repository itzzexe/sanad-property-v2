"use client";

import { useState } from "react";
import { 
  Receipt, Plus, Download, Search, 
  User, Calendar, Landmark, CheckCircle2,
  FileText, Share2, Printer
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";

const MOCK_RECEIPTS = [
  { id: "REC-2501", date: "2025-01-20", tenant: "ياسين جاسم", unit: "شقة 501", amount: 950000, reference: "PAY-1004" },
  { id: "REC-2502", date: "2025-01-22", tenant: "نور الهدى", unit: "شقة 203", amount: 1100000, reference: "PAY-1005" },
];

export default function ReceiptsPage() {
  const { language, dir } = useLanguage();
  const { format } = useCurrency();

  const columns = [
    { header: language === 'ar' ? "رقم السند" : "Receipt ID", accessorKey: "id" },
    { header: language === 'ar' ? "التاريخ" : "Date", accessorKey: "date" },
    { header: language === 'ar' ? "المستلم منه" : "Received From", accessorKey: "tenant" },
    { header: language === 'ar' ? "الوحدة" : "Unit", accessorKey: "unit" },
    { header: language === 'ar' ? "المبلغ" : "Amount", accessorKey: "amount", cell: (item: any) => (
      <span className="font-black">{format(item.amount)}</span>
    )},
    { header: language === 'ar' ? "الإجراءات" : "Actions", accessorKey: "actions", cell: () => (
      <div className="flex items-center gap-1">
         <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Printer className="w-4 h-4" /></Button>
         <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Download className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-8 pb-12 font-arabic" dir={dir}>
      <PageHeader 
        title={language === 'ar' ? "سندات القبض" : "Receipts"}
        description={language === 'ar' ? "إصدار وإدارة سندات القبض الرسمية للعمليات المالية." : "Issue and manage formal receipts for financial transactions."}
        actions={
          <Button className="bg-primary-600">
             <Plus className="w-4 h-4 mr-2" /> {language === 'ar' ? "سند جديد" : "New Receipt"}
          </Button>
        }
      />

      <div className="relative mb-6">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
         <Input placeholder={language === 'ar' ? "البحث برقم السند أو المستأجر..." : "Search receipts..."} className="pl-10 h-12 rounded-xl" />
      </div>

      <DataTable columns={columns} data={MOCK_RECEIPTS} />
    </div>
  );
}
