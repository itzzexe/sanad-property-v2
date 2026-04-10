"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Loader2, CheckCircle2, Link2, 
  Wand2, CheckCheck, Landmark, 
  ArrowUpRight, ArrowDownRight, 
  Search, X, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription 
} from "@/components/ui/modal";
import { financeApi } from "@/lib/api/finance";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";

export default function ReconciliationWorkspacePage() {
  const { bankAccountId, statementId } = useParams();
  const { format } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  
  // Custom Modal for Manual Match
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedBankTxn, setSelectedBankTxn] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const load = () => {
    setLoading(true);
    financeApi.getReconciliation(statementId as string)
      .then(setData).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statementId]);

  const handleAutoMatch = async () => {
    setMatching(true);
    try {
      await financeApi.autoMatch(statementId as string);
      load();
    } catch (e) { console.error(e); }
    finally { setMatching(false); }
  };

  const handleManualMatch = async (journalLineId: string) => {
    if (!selectedBankTxn) return;
    try {
      await financeApi.manualMatch(selectedBankTxn.id, journalLineId);
      setShowMatchModal(false);
      load();
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      <p className="font-bold text-neutral-400">Loading workspace...</p>
    </div>
  );

  const bankTxns = data?.bankTransactions || [];
  const unmatchedJL = data?.unmatchedJournalLines || [];
  const matchedTxns = bankTxns.filter((t: any) => t.matched);
  const unmatchedTxns = bankTxns.filter((t: any) => !t.matched);
  
  const computedClosing = (data?.openingBalance || 0) + (data?.totalCredits || 0) - (data?.totalDebits || 0);
  const difference = computedClosing - (data?.expectedClosingBalance || 0);
  const isBalanced = Math.abs(difference) < 0.01;

  return (
    <div className="space-y-6">
      {/* Black Status Bar */}
      <div className="sticky top-[64px] z-20 bg-neutral-900 text-white rounded-xl shadow-2xl p-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs font-bold">
          <div className="flex flex-col gap-0.5">
             <span className="text-white/40 uppercase tracking-widest text-[9px]">Opening Balance</span>
             <span className="font-mono text-sm">{format(data?.openingBalance || 0)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
             <span className="text-white/40 uppercase tracking-widest text-[9px]">+ Total Credits</span>
             <span className="font-mono text-sm text-accent-400">+{format(data?.totalCredits || 0)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
             <span className="text-white/40 uppercase tracking-widest text-[9px]">- Total Debits</span>
             <span className="font-mono text-sm text-danger-400">-{format(data?.totalDebits || 0)}</span>
          </div>
          <div className="h-8 w-px bg-white/10 hidden md:block" />
          <div className="flex flex-col gap-0.5">
             <span className="text-white/40 uppercase tracking-widest text-[9px]">= Computed Value</span>
             <span className="font-mono text-sm">{format(computedClosing)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
             <span className="text-white/40 uppercase tracking-widest text-[9px]">Expected Closing</span>
             <span className="font-mono text-sm underline decoration-white/20">{format(data?.expectedClosingBalance || 0)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
             <span className="text-white/40 uppercase tracking-widest text-[9px]">Current Difference</span>
             <span className={cn(
               "font-mono text-sm font-black px-2 py-0.5 rounded",
               isBalanced ? "text-accent-400 bg-accent-400/10" : "text-danger-400 bg-danger-400/10"
             )}>
                {isBalanced ? "BALANCED ✓" : format(difference)}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
           <Button 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-white/20 text-white hover:bg-white/10 h-10 px-6 gap-2"
            onClick={handleAutoMatch}
            disabled={matching}
           >
              {matching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Auto-Match
           </Button>
           <Button 
            size="sm" 
            className="bg-white text-neutral-900 border-none hover:bg-white/90 font-black h-10 px-8"
            disabled={!isBalanced || unmatchedTxns.length > 0}
           >
              Complete Reconciliation
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Bank Statement */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-widest">Bank Statement</h2>
                <Badge variant="neutral" size="sm" className="bg-primary-50 text-primary-600 font-black">{bankTxns.length}</Badge>
             </div>
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-accent-600">Matched: {matchedTxns.length}</span>
                <span className="text-[10px] font-bold text-danger">Unmatched: {unmatchedTxns.length}</span>
             </div>
          </div>
          
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
            {bankTxns.map((txn: any) => (
              <Card 
                key={txn.id} 
                className={cn(
                  "relative border-l-[3px] transition-all",
                  txn.matched ? "bg-accent-50/20 opacity-80" : "hover:-translate-x-1",
                  txn.amount >= 0 ? "border-l-accent-500" : "border-l-danger"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                          <h4 className="font-bold text-neutral-900 dark:text-neutral-50 truncate">{txn.description}</h4>
                          {txn.matched && (
                            <Badge variant="success" size="sm" className="bg-accent-100 text-accent-700 font-bold border-none text-[9px] gap-1 shrink-0">
                               <CheckCheck className="w-2.5 h-2.5" /> Matched to {txn.matchedRef || 'Journal'}
                            </Badge>
                          )}
                       </div>
                       <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-neutral-400 italic">
                          <span>{new Date(txn.date).toLocaleDateString()}</span>
                          <span>Ref: {txn.reference || '—'}</span>
                          <span className="uppercase">{txn.type || 'Transaction'}</span>
                       </div>
                    </div>
                    <div className="text-right shrink-0">
                       <p className={cn(
                         "text-lg font-black font-mono tracking-tighter tabular-nums",
                         txn.amount >= 0 ? "text-accent-600" : "text-danger"
                       )}>
                          {txn.amount >= 0 ? '+' : ''}{format(txn.amount)}
                       </p>
                       {!txn.matched && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[10px] font-bold mt-2"
                            onClick={() => {
                              setSelectedBankTxn(txn);
                              setShowMatchModal(true);
                            }}
                          >
                             Apply Match
                          </Button>
                       )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: GL Journal Lines */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2 h-7">
             <h2 className="text-sm font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-widest">GL Journal Lines</h2>
             <Badge variant="neutral" size="sm" className="bg-neutral-100 text-neutral-500 font-black">{unmatchedJL.length}</Badge>
          </div>
          
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
            {unmatchedJL.map((l: any) => (
              <Card key={l.id} className="hover:bg-neutral-50/50 transition-colors border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                       <span className="font-mono font-bold text-primary-600 text-sm">
                          {l.journalEntry?.entryNumber || 'JE-DRAFT'}
                       </span>
                       <span className="ml-3 text-[10px] font-bold text-neutral-400">
                          {new Date(l.journalEntry?.date || l.createdAt).toLocaleDateString()}
                       </span>
                       <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{l.description || l.account?.name}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black font-mono">
                          {format(Math.abs(Number(l.debit) - Number(l.credit)))}
                       </p>
                       <p className="text-[9px] uppercase font-bold text-neutral-400 mt-0.5">
                          {Number(l.debit) > 0 ? 'Debit' : 'Credit'}
                       </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {unmatchedJL.length === 0 && (
               <div className="py-20 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-accent-500/20 mx-auto" />
                  <p className="text-neutral-400 font-bold italic text-sm">All entries accounted for.</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Match Modal */}
      <Modal open={showMatchModal} onOpenChange={setShowMatchModal}>
        <ModalContent className="sm:max-w-[600px] overflow-hidden p-0">
          <div className="p-8 bg-neutral-900 text-white relative">
             <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
             <ModalTitle className="text-2xl font-black flex items-center gap-3 z-10 relative">
                <Landmark className="w-7 h-7 text-primary-400" /> Match Bank Transaction
             </ModalTitle>
             <div className="mt-6 flex items-center justify-between z-10 relative bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div>
                   <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Bank Transaction</p>
                   <p className="font-black text-sm">{selectedBankTxn?.description}</p>
                   <p className="text-xs text-white/40 mt-1">{selectedBankTxn?.date && new Date(selectedBankTxn.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                   <p className={cn(
                     "text-2xl font-black font-mono tracking-tighter",
                     selectedBankTxn?.amount >= 0 ? "text-accent-400" : "text-danger"
                   )}>
                      {selectedBankTxn?.amount >= 0 ? '+' : ''}{format(selectedBankTxn?.amount || 0)}
                   </p>
                </div>
             </div>
          </div>
          
          <div className="p-8 space-y-6">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input 
                  placeholder="Search ledger entries by JE# or description..." 
                  className="pl-10 h-11"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
             </div>
             
             <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1 mb-2">Suggested Ledger Matches</h4>
                {unmatchedJL.filter((l: any) => 
                  l.journalEntry?.entryNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  l.description?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((l: any) => {
                  const amt = Math.abs(Number(l.debit) - Number(l.credit));
                  const isClose = Math.abs(amt - Math.abs(selectedBankTxn?.amount || 0)) < 1;
                  
                  return (
                    <div 
                      key={l.id} 
                      className={cn(
                        "group p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-primary-500 hover:bg-primary-50/10 cursor-pointer transition-all flex items-center justify-between",
                        isClose && "border-accent-200 bg-accent-50/20"
                      )}
                      onClick={() => handleManualMatch(l.id)}
                    >
                       <div className="flex-1">
                          <div className="flex items-center gap-2">
                             <span className="font-mono font-black text-xs text-primary-600">{l.journalEntry?.entryNumber || 'JE-DRAFT'}</span>
                             {isClose && <Badge variant="success" size="sm" className="text-[8px] h-4">Perfect Match</Badge>}
                          </div>
                          <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mt-1">{l.description || l.account?.name}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black font-mono">{format(amt)}</p>
                          <Button size="sm" className="h-7 text-[10px] mt-2 group-hover:bg-primary-600 transition-colors">Select</Button>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
