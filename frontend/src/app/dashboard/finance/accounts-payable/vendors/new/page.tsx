"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { financeApi } from "@/lib/api/finance";
import { api } from "@/lib/api";
import { Loader2, Save, Paperclip, Plus, X, FileText } from "lucide-react";
import { toast } from "sonner";

export default function NewVendorPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', contactEmail: '', phone: '', address: '', taxId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const vendor = await financeApi.createVendor(form) as any;
      for (const file of pendingFiles) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('entityType', 'VENDOR');
        fd.append('entityId', vendor.id);
        await api.post('/attachments/upload', fd);
      }
      router.push('/dashboard/finance/accounts-payable/vendors');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-black text-[#242424]">مورّد <span className="text-[#6264A7]">جديد</span></h1>
      <Card className="bg-white border-[#999999] shadow-sm rounded-md">
        <CardContent className="p-6 space-y-4">
          <div><Label className="text-xs font-bold text-[#222222]">الاسم</Label>
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1 border-[#999999] text-sm" /></div>
          <div><Label className="text-xs font-bold text-[#222222]">البريد الإلكتروني</Label>
            <Input value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} className="mt-1 border-[#999999] text-sm" /></div>
          <div><Label className="text-xs font-bold text-[#222222]">الهاتف</Label>
            <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="mt-1 border-[#999999] text-sm" /></div>
          <div><Label className="text-xs font-bold text-[#222222]">العنوان</Label>
            <Input value={form.address} onChange={(e) => update('address', e.target.value)} className="mt-1 border-[#999999] text-sm" /></div>
          <div><Label className="text-xs font-bold text-[#222222]">الرقم الضريبي</Label>
            <Input value={form.taxId} onChange={(e) => update('taxId', e.target.value)} className="mt-1 border-[#999999] text-sm" /></div>
        </CardContent>
      </Card>

      <Card className="bg-white border-[#999999] shadow-sm rounded-md">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-bold text-[#222222] flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5" /> المرفقات <span className="font-normal text-[#999999]">(صور وPDF فقط)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F0F0F0] text-xs font-medium text-[#242424]">
                <FileText className="w-3.5 h-3.5 text-[#999999] flex-shrink-0" />
                <span className="max-w-[140px] truncate">{f.name}</span>
                <button type="button" onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))} className="text-[#999999] hover:text-red-500 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input type="file" className="hidden" accept="image/*,application/pdf"
              onChange={e => { const f = e.target.files?.[0]; if (f) { setPendingFiles(prev => [...prev, f]); e.target.value = ''; } }} />
            <Button type="button" variant="outline" size="sm" className="gap-2 pointer-events-none border-[#999999] text-xs">
              <Plus className="w-3.5 h-3.5" /> إضافة ملف
            </Button>
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={submitting || !form.name} className="bg-[#6264A7] hover:bg-[#5254A0] text-white text-xs font-bold gap-1.5">
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} حفظ
        </Button>
      </div>
    </div>
  );
}
