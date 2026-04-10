"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Send, RotateCcw, 
  FileDown, Printer, Loader2, 
  AlertTriangle, CheckCircle2, Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { financeApi } from "@/lib/api/finance";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";

export default function JournalEntryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { format } = useCurrency();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getJournalEntry(id as string);
      setEntry(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    try {
      await financeApi.postJournalEntry(entry.id);
      loadEntry();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      <p className="font-bold text-neutral-400">Loading details...</p>
    </div>
  );

  if (!entry) return (
    <div className="text-center py-20">
      <AlertTriangle className="w-16 h-16 text-danger mx-auto mb-4" />
      <h3 className="text-xl font-bold">Entry Not Found</h3>
      <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
      </Button>
    </div>
  );

  const totalDebit = (entry.lines || []).reduce((sum: number, l: any) => sum + Number(l.debit), 0);
  const totalCredit = (entry.lines || []).reduce((sum: number, l: any) => sum + Number(l.credit), 0);
  const isUnbalanced = Math.abs(totalDebit - totalCredit) > 0.01;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title={`Entry #${entry.entryNumber}`}
        description={entry.description}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            {entry.status === 'POSTED' && (
              <Button variant="outline" size="sm" className="text-warning-600 border-warning-200 hover:bg-warning-50">
                <RotateCcw className="w-4 h-4 mr-2" /> Reverse
              </Button>
            )}
            {entry.status === 'DRAFT' && (
              <Button size="sm" onClick={handlePost}>
                <Send className="w-4 h-4 mr-2" /> Post Entry
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card noPadding className="lg:col-span-3">
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
             <h3 className="font-bold text-neutral-900 dark:text-neutral-50 uppercase tracking-wider text-xs">Transaction Lines</h3>
             {isUnbalanced && (
               <Badge variant="danger" className="animate-pulse">Unbalanced Entry</Badge>
             )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
                  <th className="text-left p-4 font-bold text-neutral-400 text-[10px] uppercase">Account Code</th>
                  <th className="text-left p-4 font-bold text-neutral-400 text-[10px] uppercase">Account Name</th>
                  <th className="text-right p-4 font-bold text-neutral-400 text-[10px] uppercase">Debit</th>
                  <th className="text-right p-4 font-bold text-neutral-400 text-[10px] uppercase">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {(entry.lines || []).map((line: any, idx: number) => (
                  <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-primary-600">{line.account?.code}</td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-300">
                      <div>
                        {line.account?.name}
                        {line.description && <p className="text-[10px] text-neutral-400 mt-0.5">{line.description}</p>}
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono tabular-nums font-bold">
                      {line.debit > 0 ? format(line.debit) : '—'}
                    </td>
                    <td className="p-4 text-right font-mono tabular-nums text-neutral-400 italic">
                      {line.credit > 0 ? format(line.credit) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-t-2 border-primary-100 dark:border-primary-900/30">
                  <td colSpan={2} className="p-5 text-right font-black uppercase text-xs">Total Ledger Impact</td>
                  <td className="p-5 text-right font-mono font-black text-lg text-neutral-900 dark:text-neutral-50">
                    {format(totalDebit)}
                  </td>
                  <td className="p-5 text-right font-mono font-black text-lg text-neutral-900 dark:text-neutral-50">
                    {format(totalCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {isUnbalanced && (
             <div className="m-6 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-danger" />
                <div>
                   <h4 className="text-danger font-black uppercase text-xs">Accounting Errors Detected</h4>
                   <p className="text-xs text-danger/80 mt-1">This entry is out of balance by {format(Math.abs(totalDebit - totalCredit))}. Journal entries must have equal debits and credits before they can be posted.</p>
                </div>
             </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-neutral-400">Entry Status</span>
                     <Badge 
                       variant={entry.status === 'POSTED' ? 'success' : 'neutral'}
                       size="sm"
                       className="gap-1.5"
                     >
                       {entry.status === 'POSTED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                       {entry.status}
                     </Badge>
                  </div>
                  <div className="h-[1px] w-full bg-neutral-100 dark:bg-neutral-800" />
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Entry Date</p>
                     <p className="text-sm font-black">{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Source Type</p>
                     <p className="text-sm font-black">{entry.sourceType}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Currency</p>
                     <p className="text-sm font-black">USD/IQD (Mixed)</p>
                  </div>
                  {entry.reference && (
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Reference</p>
                       <p className="text-sm font-bold text-primary-500 overflow-hidden text-ellipsis">{entry.reference}</p>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-50/50 dark:bg-primary-950/10 border-primary-100 dark:border-primary-900/30">
             <CardContent className="p-6">
                <div className="flex items-start gap-4 text-xs font-bold text-primary-900/80 dark:text-primary-400">
                   <AlertTriangle className="w-5 h-5 text-primary-500" />
                   <div>
                      Audit Notice
                      <p className="text-[10px] font-normal mt-1 opacity-80 leading-relaxed">
                        This entry was automatically generated via the {entry.sourceType} module and follows standard GAAP principles.
                      </p>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
