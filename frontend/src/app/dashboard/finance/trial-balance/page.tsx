"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, Calendar, FileDown, 
  CheckCircle2, AlertTriangle, Printer,
  Filter, ChevronDown, Download
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/ui/page-header";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { financeApi } from "@/lib/api/finance";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";

export default function TrialBalancePage() {
  const { format } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [isAdjusted, setIsAdjusted] = useState(false);
  const [includeZeros, setIncludeZeros] = useState(false);

  useEffect(() => {
    load();
  }, [asOfDate]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getTrialBalance({ endDate: asOfDate });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const variance = data ? Math.abs(data.totalDebit - data.totalCredit) : 0;
  const isBalanced = variance < 0.01;

  const getFilteredRows = () => {
    if (!data?.rows) return [];
    if (includeZeros) return data.rows;
    return data.rows.filter((r: any) => Math.abs(r.debit) > 0.01 || Math.abs(r.credit) > 0.01);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Trial Balance"
        description="Verify the mathematical accuracy of the ledger. Debits must equal credits."
        actions={
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" /> Print
             </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" /> Export <ChevronDown className="w-4 h-4 ml-2" />
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   <DropdownMenuItem className="gap-2"><FileDown className="w-4 h-4" /> Export as PDF</DropdownMenuItem>
                   <DropdownMenuItem className="gap-2"><FileDown className="w-4 h-4" /> Export as Excel</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
             <Button size="sm" onClick={load}>Generate</Button>
          </div>
        }
      />

      {/* Controls Bar */}
      <Card noPadding className="shadow-sm">
        <div className="p-4 flex flex-col md:flex-row gap-8 items-center">
           <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <Input 
                type="date" 
                value={asOfDate} 
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-44 h-10 font-bold"
              />
           </div>
           
           <div className="flex gap-8 items-center border-l border-neutral-100 dark:border-neutral-800 pl-8">
              <div className="flex items-center space-x-2">
                <Switch id="adjusted" checked={isAdjusted} onCheckedChange={setIsAdjusted} />
                <label htmlFor="adjusted" className="text-xs font-bold text-neutral-600 dark:text-neutral-400 cursor-pointer">
                  Adjusted Trial Balance
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="zeros" checked={includeZeros} onCheckedChange={setIncludeZeros} />
                <label htmlFor="zeros" className="text-xs font-bold text-neutral-600 dark:text-neutral-400 cursor-pointer">
                  Include Zero Balances
                </label>
              </div>
           </div>
        </div>
      </Card>

      {/* Status Banner */}
      {data && !loading && (
        <div className={cn(
          "p-4 border-l-4 rounded-r-xl transition-all animate-in fade-in slide-in-from-left-4",
          isBalanced 
            ? "bg-accent-50/50 border-accent-500 text-accent-700" 
            : "bg-danger/10 border-danger text-danger"
        )}>
          <div className="flex items-center gap-3">
            {isBalanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-bold text-sm">
              {isBalanced 
                ? "Trial Balance is Balanced — Total Debits equal Total Credits" 
                : `Out of Balance — Variance: ${format(variance)} — Investigate immediately`}
            </span>
          </div>
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <Card className="p-20 flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
           <p className="font-bold text-neutral-400">Generating Report...</p>
        </Card>
      ) : (
        <Card noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
                  <th className="text-left p-4 font-bold text-neutral-400 text-[10px] uppercase w-24">Code</th>
                  <th className="text-left p-4 font-bold text-neutral-400 text-[10px] uppercase">Account Name</th>
                  <th className="text-left p-4 font-bold text-neutral-400 text-[10px] uppercase w-32">Type</th>
                  <th className="text-right p-4 font-bold text-neutral-400 text-[10px] uppercase w-32">Debits</th>
                  <th className="text-right p-4 font-bold text-neutral-400 text-[10px] uppercase w-32">Credits</th>
                  <th className="text-right p-4 font-bold text-neutral-400 text-[10px] uppercase w-32">Net Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {getFilteredRows().map((row: any, i: number) => {
                  const net = row.debit - row.credit;
                  const isRevenue = row.accountType === 'REVENUE';
                  const isExpense = row.accountType === 'EXPENSE';
                  
                  return (
                    <tr key={i} className={cn(
                      "hover:bg-neutral-50/50 transition-colors",
                      isRevenue && "bg-accent-50/30 dark:bg-accent-500/5",
                      isExpense && "bg-danger/5 dark:bg-danger/5"
                    )}>
                      <td className="p-4 font-mono text-xs font-bold text-primary-600">{row.accountCode}</td>
                      <td className="p-4 font-bold text-neutral-900 dark:text-neutral-50">{row.accountName}</td>
                      <td className="p-4">
                         <Badge 
                           variant="neutral" 
                           size="sm" 
                           className="text-[9px] uppercase font-bold"
                         >
                            {row.accountType || "OTHER"}
                         </Badge>
                      </td>
                      <td className="p-4 text-right font-mono tabular-nums text-primary-700 font-medium">
                        {row.debit > 0 ? format(row.debit) : '—'}
                      </td>
                      <td className="p-4 text-right font-mono tabular-nums text-neutral-400">
                        {row.credit > 0 ? format(row.credit) : '—'}
                      </td>
                      <td className={cn(
                        "p-4 text-right font-mono tabular-nums font-black",
                        net < 0 ? "text-danger" : "text-neutral-800 dark:text-neutral-200"
                      )}>
                        {format(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                 <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-t-2 border-neutral-900 dark:border-neutral-50">
                    <td colSpan={3} className="p-6 text-right font-black uppercase text-xs">Total Balance Controls</td>
                    <td className="p-6 text-right font-mono font-black text-lg">
                       {format(data?.totalDebit || 0)}
                    </td>
                    <td className="p-6 text-right font-mono font-black text-lg">
                       {format(data?.totalCredit || 0)}
                    </td>
                    <td className="p-6 text-right font-mono font-black text-lg text-primary-500">
                       {format((data?.totalDebit || 0) - (data?.totalCredit || 0))}
                    </td>
                 </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
