"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, Filter, RotateCcw, 
  MoreVertical, Eye, Share2, Trash2, 
  CheckCircle2, AlertCircle, FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { FloatingAction } from "@/components/ui/floating-action";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { financeApi } from "@/lib/api/finance";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";

export default function JournalEntriesPage() {
  const { format } = useCurrency();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    sourceType: "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadEntries();
  }, [filters]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getJournalEntries({
        status: filters.status === 'all' ? undefined : filters.status,
        sourceType: filters.sourceType === 'all' ? undefined : filters.sourceType,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setEntries(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      sourceType: "all",
      startDate: "",
      endDate: "",
    });
  };

  const columns = [
    { 
      header: "Entry #", 
      accessorKey: "entryNumber",
      cell: (item: any) => (
        <Link 
          href={`/dashboard/finance/journal-entries/${item.id}`}
          className="font-mono font-bold text-primary-600 hover:text-primary-700 hover:underline"
        >
          {item.entryNumber}
        </Link>
      )
    },
    { 
      header: "Date", 
      accessorKey: "date",
      cell: (item: any) => (
        <span className="text-neutral-500 text-xs">
          {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
        </span>
      )
    },
    { header: "Description", accessorKey: "description" },
    { 
      header: "Source", 
      accessorKey: "sourceType",
      cell: (item: any) => (
        <Badge 
          variant="neutral" 
          size="sm"
          className={cn(
            "text-[10px] uppercase font-bold",
            item.sourceType === 'PAYMENT' && "bg-emerald-50 text-emerald-600",
            item.sourceType === 'INVOICE' && "bg-blue-50 text-blue-600",
            item.sourceType === 'MANUAL' && "bg-neutral-100 text-neutral-600"
          )}
        >
          {item.sourceType}
        </Badge>
      )
    },
    { 
      header: "Debits", 
      accessorKey: "totalDebit",
      cell: (item: any) => {
        const total = (item.lines || []).reduce((sum: number, line: any) => sum + Number(line.debit), 0);
        return <span className="font-mono font-bold text-right block">{format(total)}</span>;
      }
    },
    { 
      header: "Credits", 
      accessorKey: "totalCredit",
      cell: (item: any) => {
        const total = (item.lines || []).reduce((sum: number, line: any) => sum + Number(line.credit), 0);
        return <span className="font-mono font-medium text-neutral-400 text-right block">{format(total)}</span>;
      }
    },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (item: any) => (
        <Badge 
          variant={item.status === 'POSTED' ? 'success' : item.status === 'DRAFT' ? 'neutral' : 'warning'} 
          size="sm"
        >
          {item.status}
        </Badge>
      )
    },
    { 
      header: "Actions", 
      accessorKey: "actions",
      cell: (item: any) => (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      )
    },
  ];

  const stats = {
    posted: entries.filter(e => e.status === 'POSTED').length,
    draft: entries.filter(e => e.status === 'DRAFT').length,
    thisMonth: entries.length, 
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Journal Entries"
        description="General Ledger — manage and review all financial transactions across the system."
        actions={
          <Link href="/dashboard/finance/journal-entries/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" /> New Entry
            </Button>
          </Link>
        }
      />

      {/* Summary Strip */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-50 text-accent-600 rounded-full text-xs font-bold border border-accent-400/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Posted Entries: {stats.posted}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-400/20">
          <FileText className="w-3.5 h-3.5" />
          Draft Entries: {stats.draft}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-full text-xs font-bold border border-neutral-200">
          <RotateCcw className="w-3.5 h-3.5" />
          This Month: {stats.thisMonth} entries
        </div>
      </div>

      {/* Filter Bar */}
      <Card noPadding className="shadow-sm">
        <div className="p-4 flex flex-col xl:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full xl:w-auto">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
             <Input 
               placeholder="Search by Description or Entry #..." 
               className="pl-10 h-10" 
               value={filters.search}
               onChange={e => setFilters({...filters, search: e.target.value})}
             />
          </div>
          <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
            <Select value={filters.status} onValueChange={(val) => setFilters({...filters, status: val})}>
              <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="POSTED">Posted</SelectItem>
                <SelectItem value="REVERSED">Reversed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sourceType} onValueChange={(val) => setFilters({...filters, sourceType: val})}>
              <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder="Source Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
                <SelectItem value="PAYMENT">Payment</SelectItem>
                <SelectItem value="INVOICE">Invoice</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
               <Input 
                 type="date" 
                 className="h-10 w-36 text-xs" 
                 value={filters.startDate}
                 onChange={e => setFilters({...filters, startDate: e.target.value})}
               />
               <span className="text-neutral-400 text-xs">to</span>
               <Input 
                 type="date" 
                 className="h-10 w-36 text-xs" 
                 value={filters.endDate}
                 onChange={e => setFilters({...filters, endDate: e.target.value})}
               />
            </div>

            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-neutral-500 hover:text-primary-600">
               <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <DataTable 
        columns={columns} 
        data={entries} 
        isLoading={loading}
      />

      <FloatingAction href="/dashboard/finance/journal-entries/new" label="New Entry" />
    </div>
  );
}
