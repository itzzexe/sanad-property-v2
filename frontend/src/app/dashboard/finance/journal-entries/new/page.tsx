"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Save, Send,
  Loader2, AlertTriangle, CheckCircle2,
  Calendar, Info, FileText, Clock, Paperclip, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { financeApi, Account } from "@/lib/api/finance";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { toast } from "sonner";

interface JournalLineForm {
  accountId: string; 
  debit: string; 
  credit: string; 
  description: string;
}

export default function NewJournalEntryPage() {
  const router = useRouter();
  const { format } = useCurrency();
  const { language, dir } = useLanguage();
  const t = (ar: string, en: string) => language === "ar" ? ar : en;
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sourceType, setSourceType] = useState("MANUAL");
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<JournalLineForm[]>([
    { accountId: '', debit: '', credit: '', description: '' },
    { accountId: '', debit: '', credit: '', description: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    financeApi.getAccounts().then(setAccounts).catch(console.error);
  }, []);

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff < 0.01 && totalDebit > 0;

  const addLine = () => {
    setLines([...lines, { accountId: '', debit: '', credit: '', description: '' }]);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: keyof JournalLineForm, value: string) => {
    const next = [...lines];
    // Rule: Debit disables Credit if it has value, and vice versa
    if (field === 'debit' && value !== '') next[idx].credit = '';
    if (field === 'credit' && value !== '') next[idx].debit = '';
    
    next[idx][field] = value;
    setLines(next);
  };

  const submit = async (andPost: boolean) => {
    if (!description) { toast.error(t("الوصف مطلوب", "Description is required")); return; }
    setSubmitting(true);
    try {
      const entryData = {
        date,
        description,
        notes,
        sourceType,
        lines: lines
          .filter(l => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0))
          .map(l => ({
            accountId: l.accountId,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
            description: l.description,
          })),
      };

      const entry = await financeApi.createJournalEntry(entryData) as any;

      // Upload pending files
      for (const file of pendingFiles) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('entityType', 'JOURNAL_ENTRY');
        fd.append('entityId', entry.id);
        await api.post('/attachments/upload', fd);
      }

      if (entry.requiresApproval) {
        // Entry needs admin approval before posting — stay on a "pending" state
        setPendingApproval(true);
        setSubmitting(false);
        return;
      }

      if (andPost) await financeApi.postJournalEntry(entry.id);
      router.push('/dashboard/finance/journal-entries');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (pendingApproval) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center" dir={dir}>
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
          <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
            {t("القيد بانتظار الموافقة", "Entry Awaiting Approval")}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
            {t(
              "تم إرسال القيد إلى المدير للمراجعة والموافقة قبل ترحيله إلى دفتر الأستاذ.",
              "The journal entry has been submitted to an admin for review before it is posted to the ledger."
            )}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/finance/journal-entries')}
          className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
        >
          {t("العودة إلى القيود", "Back to Journal Entries")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20" dir={dir}>
      <PageHeader
        title={t("إنشاء قيد يومية", "Create Journal Entry")}
        description={t("تسجيل معاملة جديدة في دفتر الأستاذ العام.", "Record a new transaction in the general ledger.")}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Metadata Info */}
        <div className="w-full lg:w-1/3 order-2 lg:order-1 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4 text-primary-500" />
                Entry Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-xs font-bold text-neutral-400 uppercase">Transaction Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <Input 
                    id="date"
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source" className="text-xs font-bold text-neutral-400 uppercase">Source Type</Label>
                <Select value={sourceType} onValueChange={setSourceType}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual Journal</SelectItem>
                    <SelectItem value="ADJUSTMENT">Year-end Adjustment</SelectItem>
                    <SelectItem value="CLOSING">Closing Entry</SelectItem>
                    <SelectItem value="OPENING">Opening Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc" className="text-xs font-bold text-neutral-400 uppercase">Description</Label>
                <Textarea 
                  id="desc"
                  placeholder="What is this transaction for?" 
                  rows={3} 
                  className="resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs font-bold text-neutral-400 uppercase">Internal Notes (Optional)</Label>
                <Textarea 
                  id="notes"
                  placeholder="Audit trail notes..." 
                  rows={2} 
                  className="resize-none opacity-80"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-50/30 border-primary-100 dark:bg-primary-950/10 dark:border-primary-900/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-xs font-bold text-primary-700 dark:text-primary-400 mb-3">
                <FileText className="w-4 h-4" />
                Bookkeeping Guide
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Ensure that the total debits exactly match the total credits. Unbalanced entries cannot be posted to the ledger to maintain data integrity.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Lines Editor */}
        <div className="w-full lg:w-2/3 order-1 lg:order-2 space-y-6">
          <Card noPadding className="overflow-hidden">
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Transaction Lines</h3>
              <Badge variant={isBalanced ? "success" : "neutral"} className="gap-1.5">
                {isBalanced ? <CheckCircle2 className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                {isBalanced ? "Balanced" : "Waiting for balance"}
              </Badge>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase">
                    <th className="text-left p-4 w-1/3">Account</th>
                    <th className="text-left p-4">Description</th>
                    <th className="text-right p-4 w-32">Debit</th>
                    <th className="text-right p-4 w-32">Credit</th>
                    <th className="p-4 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {lines.map((line, idx) => (
                    <tr key={idx} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20 transition-colors">
                      <td className="p-2">
                        <Select
                          value={line.accountId}
                          onValueChange={(val) => updateLine(idx, 'accountId', val)}
                        >
                          <SelectTrigger className="border-none shadow-none bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:ring-0 text-xs font-bold">
                            <SelectValue placeholder="Select account..." />
                          </SelectTrigger>
                          <SelectContent>
                             {accounts.map(a => (
                               <SelectItem key={a.id} value={a.id} className="text-xs">
                                 {a.code} — {a.name}
                               </SelectItem>
                             ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input 
                          placeholder="..." 
                          className="border-none shadow-none bg-transparent focus-visible:ring-0 text-xs h-9"
                          value={line.description}
                          onChange={(e) => updateLine(idx, 'description', e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-right">
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          className="border-none shadow-none bg-transparent focus-visible:ring-0 text-xs text-right font-mono font-bold h-9 bg-primary-50/0 focus:bg-primary-50/20"
                          value={line.debit}
                          onChange={(e) => updateLine(idx, 'debit', e.target.value)}
                          disabled={line.credit !== '' && parseFloat(line.credit) > 0}
                        />
                      </td>
                      <td className="p-2 text-right">
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          className="border-none shadow-none bg-transparent focus-visible:ring-0 text-xs text-right font-mono h-9 bg-accent-50/0 focus:bg-accent-50/20"
                          value={line.credit}
                          onChange={(e) => updateLine(idx, 'credit', e.target.value)}
                          disabled={line.debit !== '' && parseFloat(line.debit) > 0}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-danger hover:bg-danger/10 group-hover:opacity-100 transition-all"
                          onClick={() => removeLine(idx)}
                          disabled={lines.length <= 2}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/30 border-t border-neutral-100 dark:border-neutral-800">
               <Button 
                 variant="outline" 
                 size="sm" 
                 className="w-full border-dashed border-2 py-6 text-neutral-500 hover:text-primary-600 hover:border-primary-300 transition-all font-bold gap-2"
                 onClick={addLine}
               >
                 <Plus className="w-4 h-4" /> Add Transaction Line
               </Button>
            </div>

            <div className="p-6 flex flex-col items-end gap-2 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
               <div className="flex gap-12 text-sm">
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Debits</span>
                     <span className="text-xl font-black font-mono mt-1">{format(totalDebit)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Credits</span>
                     <span className="text-xl font-black font-mono mt-1 text-neutral-400">{format(totalCredit)}</span>
                  </div>
               </div>
               
               {isBalanced ? (
                 <div className="mt-4 px-4 py-2 bg-accent-50 text-accent-700 rounded-lg text-xs font-bold flex items-center gap-2 border border-accent-200">
                    <CheckCircle2 className="w-4 h-4" /> Balanced & Ready to Post
                 </div>
               ) : (
                 <div className="mt-4 px-4 py-2 bg-danger/10 text-danger rounded-lg text-xs font-bold flex items-center gap-2 border border-danger/20">
                    <AlertTriangle className="w-4 h-4" /> 
                    Unbalanced — Difference: {format(diff)}
                 </div>
               )}
            </div>
          </Card>

          {/* File Attachments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                {t("المرفقات", "Attachments")}
                <span className="text-xs font-normal text-muted-foreground">{t("(صور وPDF فقط)", "(images & PDF only)")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {pendingFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-sm font-medium">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="max-w-[140px] truncate">{f.name}</span>
                    <button type="button" onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input type="file" className="hidden" accept="image/*,application/pdf"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setPendingFiles(prev => [...prev, f]); e.target.value = ''; } }} />
                <Button type="button" variant="outline" size="sm" className="gap-2 pointer-events-none">
                  <Plus className="w-4 h-4" /> {t("إضافة ملف", "Add File")}
                </Button>
              </label>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
             <Button
               variant="outline"
               className="h-11 px-8 font-bold"
               onClick={() => submit(false)}
               disabled={submitting}
             >
               <Save className="w-4 h-4 me-2" /> {t("حفظ كمسودة", "Save as Draft")}
             </Button>
             <Button
               className="h-11 px-10 font-black shadow-lg shadow-primary-500/20"
               disabled={submitting || !isBalanced}
               onClick={() => submit(true)}
             >
               {submitting ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Send className="w-4 h-4 me-2" />}
               {t("حفظ وترحيل", "Save and Post to Ledger")}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
