"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, Calendar, FileDown, 
  RefreshCcw, Printer, ShieldCheck, 
  AlertTriangle, CheckCircle2, ChevronDown 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { financeApi } from "@/lib/api/finance";
import { ReportHeader } from "@/components/finance/ReportHeader";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";

export default function BalanceSheetPage() {
  const { format } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    load();
  }, [asOf]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getBalanceSheet({ endDate: asOf });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, items: any[], total: number) => (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2 px-2">{title}</h3>
      <div className="space-y-px">
        {(items || []).map((a: any, i: number) => (
          <div key={i} className="flex justify-between items-center px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors group">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600 transition-colors">{a.name}</span>
              <span className="text-[10px] text-neutral-400 font-mono italic">{a.code}</span>
            </div>
            <span className="font-mono text-sm font-medium tabular-nums">{format(a.balance)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between px-3 py-3 border-t-2 border-dashed border-neutral-100 dark:border-neutral-800 mt-2 font-black text-xs uppercase tracking-wider text-neutral-900 dark:text-neutral-50">
        <span>Subtotal {title}</span>
        <span className="font-mono text-sm">{format(total)}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
       <div className="flex flex-col md:flex-row gap-4 items-end justify-between bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
         <div className="flex items-center gap-4">
            <div className="space-y-1">
               <Label className="text-[10px] font-bold text-neutral-400 uppercase">Statement As Of</Label>
               <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="w-52 h-10 font-bold pl-10" />
               </div>
            </div>
         </div>
         <Button variant="ghost" size="sm" onClick={load} className="text-primary-500 font-bold">
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh Data
         </Button>
      </div>

      <ReportHeader 
        title="Balance Sheet" 
        dateRange={`As of: ${asOf}`}
        onExportPdf={() => alert("Exporting PDF...")}
        onExportExcel={() => alert("Exporting Excel...")}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          <p className="font-bold text-neutral-400">Balancing Accounts...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: ASSETS */}
            <Card noPadding className="overflow-hidden border-primary-100 shadow-lg">
               <div className="bg-primary-50 dark:bg-primary-500/5 px-6 py-5 border-b-2 border-primary-200 flex items-center justify-between">
                  <h2 className="text-primary-800 dark:text-primary-400 font-black uppercase tracking-widest text-sm">Assets</h2>
                  <ShieldCheck className="w-5 h-5 text-primary-500" />
               </div>
               <div className="p-6 space-y-10">
                  {renderSection("Current Assets", data?.assets?.currentAssets, data?.assets?.currentAssets?.reduce((s: number, a: any) => s + a.balance, 0))}
                  {renderSection("Fixed Assets", data?.assets?.fixedAssets, data?.assets?.fixedAssets?.reduce((s: number, a: any) => s + a.balance, 0))}
                  
                  <div className="flex justify-between px-6 py-6 bg-primary-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-500/20 border-t-4 border-primary-600">
                    <span className="uppercase tracking-tighter">Total Assets</span>
                    <span className="font-mono tabular-nums">{format(data?.assets?.totalAssets || 0)}</span>
                  </div>
               </div>
            </Card>

            {/* Right Column: LIABILITIES & EQUITY */}
            <Card noPadding className="overflow-hidden border-neutral-200 shadow-lg">
               <div className="bg-neutral-50 dark:bg-neutral-800 px-6 py-5 border-b-2 border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <h2 className="text-neutral-600 dark:text-neutral-400 font-black uppercase tracking-widest text-sm">Liabilities & Equity</h2>
                  <Printer className="w-4 h-4 text-neutral-400" />
               </div>
               <div className="p-6 space-y-10">
                  {renderSection("Current Liabilities", data?.liabilities?.currentLiabilities, data?.liabilities?.currentLiabilities?.reduce((s: number, a: any) => s + a.balance, 0))}
                  {renderSection("Equity", data?.equity?.lines, data?.equity?.totalEquity)}
                  
                  <div className="flex justify-between px-6 py-6 bg-neutral-900 dark:bg-neutral-800 text-white rounded-2xl font-black text-lg border-t-4 border-black dark:border-neutral-700">
                    <span className="uppercase tracking-tighter">Total L + E</span>
                    <span className="font-mono tabular-nums">{format(data?.totalLiabilitiesAndEquity || 0)}</span>
                  </div>
               </div>
            </Card>
          </div>

          {/* Balance Check Banner */}
          <div className={cn(
            "p-6 rounded-3xl flex items-center justify-between border-2 transition-all",
            data?.isBalanced 
              ? "bg-accent-50/50 border-accent-200 text-accent-700" 
              : "bg-danger/10 border-danger text-danger animate-pulse"
          )}>
            <div className="flex items-center gap-4">
               {data?.isBalanced ? (
                 <CheckCircle2 className="w-8 h-8 text-accent-500" />
               ) : (
                 <AlertTriangle className="w-8 h-8 text-danger" />
               )}
               <div>
                  <h4 className="font-black text-sm uppercase tracking-widest">
                    {data?.isBalanced ? "Equation Balanced" : "Financial Discrepancy Found"}
                  </h4>
                  <p className="text-xs font-bold opacity-80 mt-0.5">
                    {data?.isBalanced 
                      ? "The accounting equation (Assets = Liabilities + Equity) is perfectly maintained." 
                      : `Warning: Total Assets do not match Total L+E. Variance found: ${format(data?.variance)}`}
                  </p>
               </div>
            </div>
            {data?.isBalanced && (
               <Badge variant="success" className="px-4 py-1 text-xs font-black">STABLE ✓</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const Label = ({ children, className, htmlFor }: any) => (
  <label htmlFor={htmlFor} className={cn("text-xs font-bold text-neutral-500", className)}>{children}</label>
);
