"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Plus, Search, Users, Loader2, Trash2, Mail, Phone, MapPin, UserCheck, Paperclip, Eye, FileText, Download, Upload } from "lucide-react";
import { AttachmentManager } from "@/components/shared/attachment-manager";

import { useLanguage } from "@/context/language-context";
import { cn } from "@/lib/utils";

export default function TenantsPage() {
  const { language, t, dir } = useLanguage();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", idType: "بطاقة وطنية", idNumber: "", nationality: "عراقي", address: "" });
  const [saving, setSaving] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [showTenantDetails, setShowTenantDetails] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [creationFiles, setCreationFiles] = useState<File[]>([]);
  const creationFilesInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post("/tenants/import", formData);
      alert(language === 'ar' ? `تم استيراد ${res.successCount || 0} سجل بنجاح.` : `Imported ${res.successCount || 0} tenants.`);
      load();
    } catch (err: any) {
      alert(err.message || "Error uploading file");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  useEffect(() => { load(); }, [search]);
  
  async function load() {
    try {
      const res = await api.get(`/tenants?search=${search}&limit=50`);
      setTenants(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post("/tenants", form);
      const tenantId = res.id;

      if (creationFiles.length > 0) {
        for (const file of creationFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('entityType', 'TENANT');
          formData.append('entityId', tenantId);
          await api.post("/attachments/upload", formData);
        }
      }

      setShowCreate(false);
      setCreationFiles([]);
      setForm({ firstName: "", lastName: "", email: "", phone: "", idType: "بطاقة وطنية", idNumber: "", nationality: "عراقي", address: "" });
      load();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(language === 'ar' ? "هل أنت متأكد من حذف هذا المستأجر؟" : "Are you sure you want to delete this tenant?")) return;
    try { await api.delete(`/tenants/${id}`); load(); }
    catch (err: any) { alert(err.message); }
  }

  return (
    <div className={cn("space-y-10 page-enter p-2 md:p-6 pb-20 font-arabic", language === 'ar' ? "text-right" : "")} dir={dir}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 mb-2 leading-tight">
             {t('tenants_registry').split(' ')[0]} <span className="text-primary-500">{t('tenants_registry').split(' ')[1]}</span>
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            {t('tenants_description')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleImport} />
          <Button disabled={importing} onClick={() => fileInputRef.current?.click()} variant="outline" className="font-bold h-14 px-6 rounded-2xl gap-2 transition-all">
            {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />} 
            {t('import_excel')}
          </Button>
          <Button onClick={() => setShowCreate(true)} className="bg-primary-600 text-white hover:bg-primary-700 font-bold h-14 px-8 rounded-2xl shadow-lg shadow-primary-600/20 gap-3 border-none hover:scale-105 transition-all">
            <Plus className="w-5 h-5" /> {t('add_tenant')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-end">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            placeholder={t('search_tenants_placeholder')} 
            className="w-full pr-12 h-14 bg-white border border-slate-100 shadow-premium rounded-2xl text-lg font-bold placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
          <p className="font-bold text-slate-600 animate-pulse">{t('loading_tenants')}</p>
        </div>
      ) : tenants.length === 0 ? (
        <Card className="py-24 text-center border-none shadow-premium bg-white rounded-[40px]">
          <Users className="w-20 h-20 mx-auto text-slate-600 mb-6" />
          <h3 className="text-2xl font-black text-slate-900">{t('no_tenants_title')}</h3>
          <p className="text-slate-600 mt-2 font-medium">{t('no_tenants_desc')}</p>
        </Card>
      ) : (
        <Card className="border-none shadow-premium bg-white rounded-[32px] overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-right py-6 text-slate-900 font-black">{t('tenant')}</TableHead>
                <TableHead className="text-right py-6 text-slate-900 font-black">{t('contact_info')}</TableHead>
                <TableHead className="text-right py-6 text-slate-900 font-black">{t('legal_docs')}</TableHead>
                <TableHead className="text-right py-6 text-slate-900 font-black text-center">{t('leases')}</TableHead>
                <TableHead className="text-left py-6 text-slate-900 font-black pl-8">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant: any) => (
                <TableRow key={tenant.id} className="hover:bg-slate-50/40 transition-colors border-slate-50 group">
                  <TableCell className="py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg font-black group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        {tenant.firstName[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors">{tenant.firstName} {tenant.lastName}</p>
                        <p className="text-xs text-slate-600 font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {tenant.address || t('address_not_available')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 font-bold">
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" /> {tenant.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700 font-mono">
                        <Phone className="w-3.5 h-3.5 text-indigo-400" /> {tenant.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tenant.idType ? (
                       <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 inline-flex flex-col items-start gap-1">
                         <span className="text-[9px] text-slate-600 font-black uppercase text-right w-full">{tenant.idType}</span>
                         <span className="font-mono font-black text-slate-900 text-xs">{tenant.idNumber}</span>
                       </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                       <UserCheck className="w-4 h-4 text-emerald-500" />
                       <span className="font-black text-slate-900">{tenant.leases?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="pl-8 text-left">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600" onClick={() => {
                          setSelectedTenant(tenant);
                          setShowTenantDetails(true);
                        }}>
                        <Eye className="w-4.5 h-4.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors" onClick={() => {
                          setSelectedTenant(tenant);
                          setShowAttachments(true);
                        }}>
                        <Paperclip className="w-4.5 h-4.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors" onClick={() => handleDelete(tenant.id)}>
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[550px] border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[32px] overflow-hidden p-0">
          <form onSubmit={handleCreate} dir={dir}>
            <div className="p-8 space-y-6">
              <DialogHeader className={cn("text-right", language === 'en' ? "text-left" : "")}>
                <DialogTitle className="text-3xl font-black text-slate-900 dark:text-neutral-50 leading-tight">{t('register_tenant')}</DialogTitle>
                <DialogDescription className="text-slate-700 dark:text-neutral-400 font-bold">{t('portfolio_description')}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-5 pt-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-neutral-400 font-bold px-1">{t('first_name')}</Label>
                  <Input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="..." className="h-12 bg-slate-50/50 dark:bg-neutral-800 border-slate-100 dark:border-neutral-700 rounded-xl font-bold focus:ring-indigo-500/10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-neutral-400 font-bold px-1">{t('last_name')}</Label>
                  <Input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="..." className="h-12 bg-slate-50/50 dark:bg-neutral-800 border-slate-100 dark:border-neutral-700 rounded-xl font-bold focus:ring-indigo-500/10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-neutral-400 font-bold px-1">{t('email')}</Label>
                <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="..." className="h-12 bg-slate-50/50 dark:bg-neutral-800 border-slate-100 dark:border-neutral-700 rounded-xl text-left font-mono font-bold" />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-neutral-400 font-bold px-1">{t('phone')}</Label>
                <Input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="..." className="h-12 bg-slate-50/50 dark:bg-neutral-800 border-slate-100 dark:border-neutral-700 rounded-xl text-left font-mono font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-neutral-400 font-bold px-1">{t('id_type')}</Label>
                  <Input value={form.idType} onChange={e => setForm({ ...form, idType: e.target.value })} placeholder="..." className="h-12 bg-slate-50/50 dark:bg-neutral-800 border-slate-100 dark:border-neutral-700 rounded-xl font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-neutral-400 font-bold px-1">{t('id_number')}</Label>
                  <Input value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} className="h-12 bg-slate-50/50 dark:bg-neutral-800 border-slate-100 dark:border-neutral-700 rounded-xl font-mono font-bold" />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-slate-700 dark:text-neutral-400 font-bold px-1 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-indigo-500" /> {t('tenant_attachments')}
                </Label>
                <div className="bg-slate-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-neutral-700">
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    ref={creationFilesInputRef}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setCreationFiles(prev => [...prev, ...files]);
                    }}
                    accept="image/*,application/pdf"
                  />
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <Button 
                      type="button" 
                      onClick={() => creationFilesInputRef.current?.click()}
                      variant="ghost"
                      className="text-indigo-600 font-bold hover:bg-white dark:hover:bg-neutral-900"
                    >
                      <Plus className="w-4 h-4 ml-1" /> {t('add_documents')}
                    </Button>
                  </div>

                  {creationFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {creationFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-xl border border-slate-100 dark:border-neutral-700">
                          <span className="text-xs font-bold truncate text-slate-600 max-w-[150px]">{file.name}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setCreationFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="text-rose-500 h-7 w-7"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-neutral-800/80 flex gap-4 mt-4">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="flex-1 h-12 rounded-xl font-bold text-slate-600 dark:text-neutral-400">{t('cancel')}</Button>
              <Button type="submit" disabled={saving} className="flex-1 h-12 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-black shadow-lg shadow-indigo-600/20">
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                {t('save_tenant_data')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tenant Details Dialog */}
      <Dialog open={showTenantDetails} onOpenChange={setShowTenantDetails}>
        <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[32px] overflow-hidden p-0">
           <div className="p-8 space-y-8" dir={dir}>
              <DialogHeader className={cn("text-right", language === 'en' ? "text-left" : "")}>
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                     <Users className="w-8 h-8" />
                   </div>
                   <div>
                     <DialogTitle className="text-3xl font-black text-slate-900 dark:text-neutral-50 leading-tight">{t('tenant_profile')}</DialogTitle>
                     <p className="text-indigo-600 font-black text-sm">{selectedTenant?.firstName} {selectedTenant?.lastName}</p>
                   </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-2xl border border-slate-100 dark:border-neutral-700 text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('first_name')}</p>
                    <p className="font-black text-slate-900 dark:text-neutral-50">{selectedTenant?.firstName}</p>
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-2xl border border-slate-100 dark:border-neutral-700 text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('last_name')}</p>
                    <p className="font-black text-slate-900 dark:text-neutral-50">{selectedTenant?.lastName}</p>
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-2xl border border-slate-100 dark:border-neutral-700 text-center col-span-2">
                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('phone')}</p>
                    <p className="font-black text-slate-900 dark:text-neutral-50 text-lg">{selectedTenant?.phone}</p>
                 </div>
              </div>

              <div className="space-y-4">
                  <div className="p-5 bg-white dark:bg-neutral-800 rounded-3xl border border-slate-100 dark:border-neutral-700 shadow-sm flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-600 dark:text-neutral-400">{t('email')}:</span>
                     <span className="font-bold text-slate-900 dark:text-neutral-50">{selectedTenant?.email}</span>
                  </div>
                  <div className="p-5 bg-white dark:bg-neutral-800 rounded-3xl border border-slate-100 dark:border-neutral-700 shadow-sm flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-600 dark:text-neutral-400">{t('id_number')} ({selectedTenant?.idType}):</span>
                     <span className="font-black text-indigo-600 font-mono">{selectedTenant?.idNumber}</span>
                  </div>
                  <div className="p-5 bg-white dark:bg-neutral-800 rounded-3xl border border-slate-100 dark:border-neutral-700 shadow-sm">
                     <p className="text-[10px] text-slate-500 font-black uppercase mb-2">{t('address')}:</p>
                     <p className="font-bold text-slate-800 dark:text-neutral-200">{selectedTenant?.address || t('address_not_available')}</p>
                  </div>
              </div>

              <div className="p-5 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100/50">
                 <p className="text-[10px] text-indigo-600 font-black uppercase mb-1 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> {t('contract_activity')}
                 </p>
                 <p className="font-bold text-slate-900 dark:text-neutral-50">
                   {language === 'ar' 
                     ? `لدى هذا المستأجر عدد (${selectedTenant?.leases?.length || 0}) عقود مسجلة في النظام.`
                     : `This tenant has (${selectedTenant?.leases?.length || 0}) active leases registered.`
                   }
                 </p>
              </div>
           </div>
           
           <div className="p-8 bg-slate-50 dark:bg-neutral-800/80 flex gap-4">
              <Button variant="ghost" onClick={() => setShowTenantDetails(false)} className="flex-1 h-12 rounded-xl font-bold text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-800">إغلاق</Button>
              <Button className="flex-1 h-12 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-black gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                <FileText className="w-5 h-5" /> {t('export_profile_pdf')}
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Attachments Dialog */}
      <Dialog open={showAttachments} onOpenChange={setShowAttachments}>
        <DialogContent className="sm:max-w-[700px] border-none shadow-2xl bg-white dark:bg-neutral-900 rounded-[32px] p-8">
          <div dir={dir}>
          <DialogHeader className={cn("text-right mb-4", language === 'en' ? "text-left" : "")}>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-neutral-50 leading-tight flex items-center gap-3">
              <Paperclip className="w-6 h-6 text-indigo-600" />
              {t('tenant_attachments')}: {selectedTenant?.firstName} {selectedTenant?.lastName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTenant && (
            <AttachmentManager 
              entityType="TENANT" 
              entityId={selectedTenant.id} 
              title={t('legal_docs')}
            />
          )}

          <div className="mt-8 flex justify-end">
            <Button 
              type="button"
              onClick={() => setShowAttachments(false)} 
              className="bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-neutral-50 hover:bg-slate-200 dark:hover:bg-neutral-700 font-bold px-8 rounded-xl"
            >
              {t('cancel')}
            </Button>
          </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
