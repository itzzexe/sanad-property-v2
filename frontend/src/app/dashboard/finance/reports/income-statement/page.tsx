"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2, Calendar, FileDown,
  TrendingUp, TrendingDown, RefreshCcw,
  ArrowUpRight, ArrowDownRight, Printer
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { financeApi } from "@/lib/api/finance";
import { ReportHeader } from "@/components/finance/ReportHeader";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";

export default function IncomeStatementPage() {
  const { format } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [compare, setCompare] = useState(false);

  useEffect(() => {
    load();
  }, [startDate, endDate, compare]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getIncomeStatement({ 
        startDate, 
        endDate, 
        compareWithPriorPeriod: compare 
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    const id = toast.loading(format === 'pdf' ? "جاري تصدير PDF..." : "جاري تصدير Excel...");
    try {
      const res = await financeApi.exportReport('income-statement', format, { startDate, endDate } as any) as any;
      const url = res?.url ?? res?.data?.url;
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = res?.filename ?? res?.data?.filename ?? `income-statement.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        toast.success(format === 'pdf' ? "تم تصدير PDF" : "تم تصدير Excel", { id });
      } else {
        toast.error("لم يتم إرجاع رابط التحميل", { id });
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e.message ?? "فشل التصدير", { id });
    }
  };

  const netIncome = data?.netIncome || 0;
  const isProfit = netIncome >= 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
         <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
               <Label className="text-[10px] font-bold text-neutral-400 uppercase">From</Label>
               <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40 h-10 font-bold" />
            </div>
            <div className="space-y-1">
               <Label className="text-[10px] font-bold text-neutral-400 uppercase">To</Label>
               <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40 h-10 font-bold" />
            </div>
            <div className="flex items-center gap-2 mb-2 ml-4">
              <Switch checked={compare} onCheckedChange={setCompare} id="compare" />
              <Label htmlFor="compare" className="text-xs font-bold text-neutral-600 dark:text-neutral-400 cursor-pointer">Compare with prior</Label>
            </div>
         </div>
         <Button variant="ghost" size="sm" onClick={load} className="text-primary-500 font-bold">
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
         </Button>
      </div>

      <ReportHeader 
        title="Income Statement" 
        dateRange={`Period: ${startDate} to ${endDate}`}
        onExportPdf={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          <p className="font-bold text-neutral-400">Calculating Profit & Loss...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Statement Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Card */}
            <Card noPadding className="overflow-hidden border-accent-100 shadow-sm">
               <div className="bg-accent-50/50 dark:bg-accent-500/5 px-6 py-4 border-b border-accent-100 flex items-center justify-between">
                  <h3 className="text-accent-700 font-black uppercase tracking-wider text-xs">Revenue & Operating Income</h3>
                  <TrendingUp className="w-4 h-4 text-accent-500" />
               </div>
               <div className="p-0">
                  <table className="w-full">
                     <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900/40">
                        {(data?.sections?.find((s: any) => s.title.toLowerCase().includes('revenue'))?.accounts || []).map((a: any, i: number) => (
                           <tr key={i} className="hover:bg-accent-50/20 transition-colors">
                              <td className="p-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">{a.code} — {a.name}</td>
                              <td className="p-4 text-right font-mono font-bold text-accent-600 tabular-nums">
                                 {format(a.amount)}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  <div className="bg-accent-50/30 p-6 flex items-center justify-between border-t border-accent-100">
                     <span className="font-bold text-neutral-900 dark:text-neutral-50">Total Revenue</span>
                     <span className="font-black text-xl text-accent-700 underline decoration-double decoration-accent-300">
                        {format(data?.sections?.find((s: any) => s.title.toLowerCase().includes('revenue'))?.subtotal || 0)}
                     </span>
                  </div>
               </div>
            </Card>

            {/* Expenses Card */}
            <Card noPadding className="overflow-hidden border-danger/10 shadow-sm">
               <div className="bg-danger/5 px-6 py-4 border-b border-danger/10 flex items-center justify-between">
                  <h3 className="text-danger font-black uppercase tracking-wider text-xs">Operating Expenses</h3>
                  <TrendingDown className="w-4 h-4 text-danger" />
               </div>
               <div className="p-0">
                  <table className="w-full">
                     <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900/40">
                        {(data?.sections?.find((s: any) => s.title.toLowerCase().includes('expense'))?.accounts || []).map((a: any, i: number) => (
                           <tr key={i} className="hover:bg-danger/5 transition-colors">
                              <td className="p-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">{a.code} — {a.name}</td>
                              <td className="p-4 text-right font-mono font-bold text-danger tabular-nums">
                                 {format(a.amount)}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  <div className="bg-danger/5 p-6 flex items-center justify-between border-t border-danger/10 mt-auto">
                     <span className="font-bold text-neutral-900 dark:text-neutral-50">Total Expenses</span>
                     <span className="font-black text-xl text-danger underline underline-offset-4 decoration-2">
                        {format(data?.sections?.find((s: any) => s.title.toLowerCase().includes('expense'))?.subtotal || 0)}
                     </span>
                  </div>
               </div>
            </Card>
          </div>

          {/* Large Net Income Card */}
          <Card className={cn(
            "p-10 text-center transition-all shadow-xl",
            isProfit ? "bg-accent-500 text-white shadow-accent-500/20" : "bg-danger text-white shadow-danger/20"
          )}>
            <div className="flex flex-col items-center gap-4">
               <div className="bg-white/20 p-4 rounded-full">
                  {isProfit ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
               </div>
               <div>
                  <h4 className="text-white/80 font-bold uppercase tracking-widest text-sm">
                     {isProfit ? "Net Profit" : "Net Loss"} for the Period
                  </h4>
                  <div className="text-[52px] font-black tracking-tighter mt-2 leading-none flex items-center justify-center gap-4">
                     {format(netIncome)}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-white/90 font-bold justify-center">
                     {isProfit ? (
                        <>
                           <ArrowUpRight className="w-5 h-5" /> Efficiency: 100%
                        </>
                     ) : (
                        <>
                           <ArrowDownRight className="w-5 h-5" /> Profit Margin: 0%
                        </>
                     )}
                  </div>
               </div>
            </div>
          </Card>

          {/* Optional: Detail Sections for Other things */}
          {data?.sections?.filter((s: any) => !s.title.toLowerCase().includes('revenue') && !s.title.toLowerCase().includes('expense')).map((section: any, idx: number) => (
             <Card key={idx} noPadding className="overflow-hidden border-neutral-100">
                <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-neutral-600 font-black uppercase tracking-wider text-xs">{section.title}</h3>
                </div>
                <div className="p-0">
                   <table className="w-full text-sm">
                      <tbody className="divide-y divide-neutral-50">
                        {section.accounts.map((a: any, ai: number) => (
                           <tr key={ai}>
                              <td className="p-4">{a.name}</td>
                              <td className="p-4 text-right font-mono font-bold">{format(a.amount)}</td>
                           </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </Card>
          ))}
        </div>
      )}
    </div>
  );
}
