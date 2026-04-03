"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Plus, Search, Building2, MapPin, Loader2, Edit, Trash2, Eye, ChevronRight, LayoutGrid, Paperclip, FileText, Upload, Map, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AttachmentManager } from "@/components/shared/attachment-manager";
import { useRef } from "react";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    address: "", 
    city: "بغداد", 
    state: "", 
    country: "العراق", 
    zipCode: "", 
    description: "", 
    mapUrl: "",
    issuer: "",
    registrationDirectorate: "",
    formType: "",
    governorate: "بغداد",
    district: "",
    subDistrict: "",
    street: "",
    recordNumber: "",
    recordDate: "",
    recordVolume: "",
    prevRecordNumber: "",
    prevRecordDate: "",
    prevRecordVolume: "",
    propertySequence: "",
    neighborhoodName: "",
    doorNumber: "",
    plotNumber: "",
    sectionNumber: "",
    sectionName: "",
    ownerNationality: "",
    boundaries: "كما في الخارطة",
    propertyGender: "",
    propertyTypeDetailed: "",
    contents: "",
    easements: "",
    areaSqm: 0,
    areaOlk: 0,
    areaDonum: 0,
    registrationNature: "",
    insuranceNotes: "",
    deedRuling: "",
    requestingEntity: "",
    certificationDate: ""
  });
  const [creationFiles, setCreationFiles] = useState<File[]>([]);
  const creationFilesInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<any>({});
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post("/properties/import", formData);
      alert(`تم استيراد ${res.successCount || 0} سجل بنجاح.\n\n${res.errorsCount > 0 ? `أخطاء (${res.errorsCount}):\n` + res.errors.join('\n') : ''}`);
      load();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء رفع الملف");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  useEffect(() => { load(); }, [search]);

  async function load() {
    try {
      const res = await api.get(`/properties?search=${search}&include=units&limit=20`);
      setProperties(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post("/properties", form);
      const propertyId = res.id;

      // Handle attachments if any
      if (creationFiles.length > 0) {
        for (const file of creationFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('entityType', 'PROPERTY');
          formData.append('entityId', propertyId);
          try {
            await api.post("/attachments/upload", formData);
          } catch (uploadErr) {
            console.error("Failed to upload file:", file.name, uploadErr);
          }
        }
      }

      setShowCreate(false);
      setCreationFiles([]);
      setForm({ 
        name: "", 
        address: "", 
        city: "بغداد", 
        state: "", 
        country: "العراق", 
        zipCode: "", 
        description: "", 
        mapUrl: "",
        issuer: "",
        registrationDirectorate: "",
        formType: "",
        governorate: "بغداد",
        district: "",
        subDistrict: "",
        street: "",
        recordNumber: "",
        recordDate: "",
        recordVolume: "",
        prevRecordNumber: "",
        prevRecordDate: "",
        prevRecordVolume: "",
        propertySequence: "",
        neighborhoodName: "",
        doorNumber: "",
        plotNumber: "",
        sectionNumber: "",
        sectionName: "",
        ownerNationality: "",
        boundaries: "كما في الخارطة",
        propertyGender: "",
        propertyTypeDetailed: "",
        contents: "",
        easements: "",
        areaSqm: 0,
        areaOlk: 0,
        areaDonum: 0,
        registrationNature: "",
        insuranceNotes: "",
        deedRuling: "",
        requestingEntity: "",
        certificationDate: ""
      });
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا العقار؟")) return;
    try {
      await api.delete(`/properties/${id}`);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function exportPropertyReport(property: any) {
    alert("جاري تحضير ملف تقرير العقار (PDF)... سيظهر في التنزيلات قريباً.");
  }

  return (
    <div className="space-y-10 page-enter p-2 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2 leading-tight">
            المحفظة <span className="text-gradient-indigo">العقارية</span>
          </h1>
          <p className="text-slate-700 text-lg font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            إدارة كافة الأصول العقارية المركزية بذكاء وكفاءة
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleImport} />
          <Button disabled={importing} onClick={() => fileInputRef.current?.click()} variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold h-14 px-6 rounded-2xl gap-2 transition-all">
            {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />} رفع إكسل
          </Button>
          <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold h-14 px-8 rounded-2xl shadow-lg shadow-indigo-600/20 gap-3 border-none hover:scale-105 transition-all">
            <Plus className="w-5 h-5" /> إضافة عقار جديد
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-end">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
          <Input 
            placeholder="بحث عن عقار بالاسم أو العنوان..." 
            className="pr-12 h-14 bg-white border-slate-100 shadow-premium rounded-2xl text-lg font-bold placeholder:text-slate-600 focus:ring-indigo-500/10 focus:border-indigo-500/30" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-premium flex flex-col justify-center min-w-[140px]">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">إجمالي العقارات</span>
              <span className="text-2xl font-black text-slate-900">{meta.total || properties.length}</span>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
          <p className="font-bold text-slate-600 animate-pulse">جاري جلب المحفظة العقارية...</p>
        </div>
      ) : properties.length === 0 ? (
        <Card className="py-24 text-center border-none shadow-premium bg-white rounded-[40px]">
          <Building2 className="w-20 h-20 mx-auto text-slate-600 mb-6" />
          <h3 className="text-2xl font-black text-slate-900">المحفظة خالية حالياً</h3>
          <p className="text-slate-600 mt-2 max-w-sm mx-auto font-medium">ابدأ بتوثيق عقاراتك لبناء نظام إدارة متكامل ومحترف.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property: any) => (
            <Card key={property.id} className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 border-none bg-white shadow-premium rounded-[32px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-500 shadow-sm">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors" onClick={() => handleDelete(property.id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{property.name}</h3>
                   <p className="text-slate-700 font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    {property.address}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 my-8 p-4 rounded-3xl bg-slate-50/50 border border-slate-100/50">
                   <div className="text-right">
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">الوحدات</p>
                      <p className="text-lg font-black text-slate-900">{property._count?.units || 0}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">الشركاء</p>
                      <p className="text-lg font-black text-slate-900">{property._count?.shareholders || 0}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">الحالة</p>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none shadow-none font-black text-[9px] rounded-lg p-0 h-auto">نشط</Badge>
                   </div>
                </div>

                <Button 
                   onClick={() => {
                     setSelectedProperty(property);
                     setShowPropertyDetails(true);
                   }}
                   className="w-full h-12 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold rounded-xl gap-2 transition-all border-none shadow-sm"
                >
                  عرض التفاصيل
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button 
                  variant="outline"
                  className="w-full h-11 border-slate-200 text-slate-600 font-bold rounded-xl gap-2 mt-3 hover:bg-slate-50 transition-all shadow-sm"
                  onClick={() => {
                    setSelectedProperty(property);
                    setShowAttachments(true);
                  }}
                >
                  <Paperclip className="w-4 h-4 text-indigo-500" />
                  المرفقات (صور/PDF)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[1000px] max-h-[95vh] flex flex-col border-none shadow-2xl bg-white rounded-[40px] overflow-hidden p-0" dir="rtl">
          <form onSubmit={handleCreate} className="flex flex-col h-full overflow-hidden">
            <div className="p-10 pb-6 border-b border-slate-100 shrink-0 flex items-center justify-between">
               <DialogHeader className="text-right">
                <DialogTitle className="text-4xl font-black text-slate-900 leading-tight flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                    <Plus className="w-8 h-8" />
                  </div>
                  توثيق سند عقاري جديد
                </DialogTitle>
                <DialogDescription className="text-slate-700 text-lg font-bold mt-2 pr-20">أدخل كافة البيانات الرسمية للسند العقاري وفقاً للمعايير القانونية</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-end gap-2">
                <Button 
                  type="button" 
                  disabled={importing} 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="border-dashed border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-black h-12 px-6 rounded-2xl gap-2 transition-all shadow-premium"
                >
                  {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />} تزويد بالبيانات عبر إكسل
                </Button>
                <span className="text-[10px] text-slate-500 font-bold ml-1 italic opacity-80">يدعم كافة حقول السند العقاري (41 حقل)</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              {/* General Information Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-r-4 border-indigo-600 pr-4">
                   <h3 className="text-2xl font-black text-slate-900">معلومات عامة</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">اسم العقار (للنظام)</Label>
                    <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: بناية المنصور" className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1 flex items-center gap-1 group">
                      الجهة المصدرة <span className="text-rose-500">*</span>
                    </Label>
                    <Input required value={form.issuer} onChange={e => setForm({ ...form, issuer: e.target.value })} placeholder="اسم الجهة المصدرة للسند" className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">مديرية التسجيل العقاري في <span className="text-rose-500">*</span></Label>
                    <Input required value={form.registrationDirectorate} onChange={e => setForm({ ...form, registrationDirectorate: e.target.value })} placeholder="المكان" className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">نوع النموذج <span className="text-rose-500">*</span></Label>
                    <Input required value={form.formType} onChange={e => setForm({ ...form, formType: e.target.value })} placeholder="مثال: نموذج 23" className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                </div>
              </section>

              {/* Current Record Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-r-4 border-emerald-600 pr-4">
                   <h3 className="text-2xl font-black text-slate-900">وصف السجل العقاري الدائمي الحالي</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">المحافظة <span className="text-rose-500">*</span></Label>
                    <Input required value={form.governorate} onChange={e => setForm({ ...form, governorate: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">القضاء <span className="text-rose-500">*</span></Label>
                    <Input required value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">الناحية</Label>
                    <Input value={form.subDistrict} onChange={e => setForm({ ...form, subDistrict: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">الشارع</Label>
                    <Input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">العدد <span className="text-rose-500">*</span></Label>
                    <Input required value={form.recordNumber} onChange={e => setForm({ ...form, recordNumber: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">التاريخ <span className="text-rose-500">*</span></Label>
                    <Input required type="date" value={form.recordDate} onChange={e => setForm({ ...form, recordDate: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">رقم المجلد <span className="text-rose-500">*</span></Label>
                    <Input required value={form.recordVolume} onChange={e => setForm({ ...form, recordVolume: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                </div>
              </section>

              {/* Transferred From Record Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-r-4 border-amber-600 pr-4">
                   <h3 className="text-2xl font-black text-slate-900">وصف السجل العقاري الدائمي المنقول منه</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">العدد <span className="text-rose-500">*</span></Label>
                    <Input required value={form.prevRecordNumber} onChange={e => setForm({ ...form, prevRecordNumber: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">التاريخ <span className="text-rose-500">*</span></Label>
                    <Input required type="date" value={form.prevRecordDate} onChange={e => setForm({ ...form, prevRecordDate: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">رقم المجلد <span className="text-rose-500">*</span></Label>
                    <Input required value={form.prevRecordVolume} onChange={e => setForm({ ...form, prevRecordVolume: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">تسلس العقار <span className="text-rose-500">*</span></Label>
                    <Input required value={form.propertySequence} onChange={e => setForm({ ...form, propertySequence: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">اسم المحلة <span className="text-rose-500">*</span></Label>
                    <Input required value={form.neighborhoodName} onChange={e => setForm({ ...form, neighborhoodName: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">رقم الباب</Label>
                    <Input value={form.doorNumber} onChange={e => setForm({ ...form, doorNumber: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">رقم القطعة</Label>
                    <Input value={form.plotNumber} onChange={e => setForm({ ...form, plotNumber: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">رقم المقاطعة</Label>
                    <Input value={form.sectionNumber} onChange={e => setForm({ ...form, sectionNumber: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                   <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">اسم المقاطعة</Label>
                    <Input value={form.sectionName} onChange={e => setForm({ ...form, sectionName: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                </div>
              </section>

              {/* Ownership & Details Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-r-4 border-rose-600 pr-4">
                   <h3 className="text-2xl font-black text-slate-900">تفاصيل الملكية والعقار</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">المالك أو المتصرف وتابعيته <span className="text-rose-500">*</span></Label>
                    <Input required value={form.ownerNationality} onChange={e => setForm({ ...form, ownerNationality: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">الحدود</Label>
                    <Input value={form.boundaries} onChange={e => setForm({ ...form, boundaries: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">جنس العقار <span className="text-rose-500">*</span></Label>
                    <Input required value={form.propertyGender} onChange={e => setForm({ ...form, propertyGender: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">نوع العقار (الصنف) <span className="text-rose-500">*</span></Label>
                    <Input required value={form.propertyTypeDetailed} onChange={e => setForm({ ...form, propertyTypeDetailed: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">المشتملات</Label>
                    <Input value={form.contents} onChange={e => setForm({ ...form, contents: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">حقوق الارتفاق والعقر</Label>
                    <Input value={form.easements} onChange={e => setForm({ ...form, easements: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                </div>
                
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-4">
                  <Label className="text-lg font-black text-slate-900 block pr-2">المساحة النهائية <span className="text-rose-500">*</span></Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 text-right">
                       <Label className="text-slate-700 font-bold px-1">متر مربع</Label>
                       <Input required type="number" step="0.01" value={form.areaSqm} onChange={e => setForm({ ...form, areaSqm: parseFloat(e.target.value) })} className="h-14 bg-white border-slate-100 rounded-2xl font-bold" />
                    </div>
                    <div className="space-y-2 text-right">
                       <Label className="text-slate-700 font-bold px-1">اولك</Label>
                       <Input type="number" step="0.01" value={form.areaOlk} onChange={e => setForm({ ...form, areaOlk: parseFloat(e.target.value) })} className="h-14 bg-white border-slate-100 rounded-2xl font-bold" />
                    </div>
                    <div className="space-y-2 text-right">
                       <Label className="text-slate-700 font-bold px-1">دونم</Label>
                       <Input type="number" step="0.01" value={form.areaDonum} onChange={e => setForm({ ...form, areaDonum: parseFloat(e.target.value) })} className="h-14 bg-white border-slate-100 rounded-2xl font-bold" />
                    </div>
                  </div>
                </div>
              </section>

               {/* Registration Details Section */}
               <section className="space-y-6">
                <div className="flex items-center gap-3 border-r-4 border-purple-600 pr-4">
                   <h3 className="text-2xl font-black text-slate-900">تفاصيل التسجيل</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">ماهية التسجيل ومستنداته <span className="text-rose-500">*</span></Label>
                    <Input required value={form.registrationNature} onChange={e => setForm({ ...form, registrationNature: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">اشارات التأمينات العينية والحجز ومواقع التسجيل</Label>
                    <Input value={form.insuranceNotes} onChange={e => setForm({ ...form, insuranceNotes: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">حكم السند</Label>
                    <Input value={form.deedRuling} onChange={e => setForm({ ...form, deedRuling: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                </div>
              </section>

              {/* Certifications Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-r-4 border-slate-400 pr-4">
                   <h3 className="text-2xl font-black text-slate-900">التصديقات (أسفل الوثيقة)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1">الجهة الطالبة للصورة <span className="text-rose-500">*</span></Label>
                    <Input required value={form.requestingEntity} onChange={e => setForm({ ...form, requestingEntity: e.target.value })} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold px-1 text-rose-600 font-black">تاريخ التصديق <span className="text-rose-500">*</span></Label>
                    <Input required type="date" value={form.certificationDate} onChange={e => setForm({ ...form, certificationDate: e.target.value })} className="h-14 bg-rose-50 border-rose-100 rounded-2xl font-bold text-rose-900" />
                  </div>
                </div>
              </section>

              {/* Attachments Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-r-4 border-indigo-400 pr-4">
                   <h3 className="text-2xl font-black text-slate-900">المرفقات (صور / PDF)</h3>
                </div>
                <div className="bg-slate-50 p-8 rounded-[32px] border border-dashed border-slate-300">
                   <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm">
                         <Paperclip className="w-8 h-8" />
                      </div>
                      <div>
                         <p className="text-lg font-bold text-slate-900">إضافة وثائق العقار</p>
                         <p className="text-slate-500 font-medium">سند الملكية، صور العقار، الخرائط (يسمح بـ JPG, PNG, PDF)</p>
                      </div>
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
                      <Button 
                        type="button" 
                        onClick={() => creationFilesInputRef.current?.click()}
                        variant="outline"
                        className="bg-white border-slate-200 text-indigo-600 font-bold px-8 rounded-xl h-12 hover:bg-slate-100"
                      >
                         <Plus className="w-5 h-5 ml-2" /> اختيار ملفات
                      </Button>
                   </div>

                   {creationFiles.length > 0 && (
                     <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {creationFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                             <div className="flex items-center gap-3 overflow-hidden">
                                <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                <span className="text-sm font-bold truncate text-slate-700">{file.name}</span>
                             </div>
                             <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setCreationFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="text-rose-500 hover:bg-rose-50 rounded-lg h-8 w-8"
                             >
                                <Trash2 className="w-4 h-4" />
                             </Button>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              </section>

              {/* Old Fields kept for backup / display */}
              <section className="space-y-6 pt-10 border-t border-slate-100 opacity-60">
                 <h4 className="text-lg font-bold text-slate-500">معلومات الموقع والتقنية</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold px-1">العنوان التفصيلي (للنظام)</Label>
                      <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="المنطقة، الشارع، المحلة" className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold px-1 flex items-center gap-2 font-black">
                        <Map className="w-4 h-4 text-indigo-500" /> رابط Google Maps
                      </Label>
                      <Input value={form.mapUrl} onChange={e => setForm({ ...form, mapUrl: e.target.value })} placeholder="https://maps.app.goo.gl/..." className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold" />
                    </div>
                 </div>
              </section>
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 shrink-0 flex gap-6">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="h-16 px-10 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-all text-xl">إلغاء</Button>
              <Button type="submit" disabled={saving} className="flex-1 h-16 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all text-xl gap-3">
                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                اعتماد وتوثيق العقار
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPropertyDetails} onOpenChange={setShowPropertyDetails}>
        <DialogContent className="sm:max-w-[700px] border-none shadow-2xl bg-white rounded-[32px] overflow-hidden p-0" dir="rtl">
           <div className="p-8 space-y-8">
              <DialogHeader className="text-right">
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                     <Building2 className="w-8 h-8" />
                   </div>
                   <div>
                     <DialogTitle className="text-3xl font-black text-slate-900 leading-tight">{selectedProperty?.name}</DialogTitle>
                     <DialogDescription className="text-indigo-600 font-black flex items-center gap-1 mt-1">
                       <MapPin className="w-4 h-4" /> {selectedProperty?.address}, {selectedProperty?.city}
                     </DialogDescription>
                   </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-600 font-black uppercase mb-1">إجمالي الوحدات</p>
                    <p className="text-xl font-black text-slate-900">{selectedProperty?._count?.units || 0}</p>
                 </div>
                 <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-600 font-black uppercase mb-1">الحالة التشغيلية</p>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-xs">نشط</Badge>
                 </div>
                 <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-600 font-black uppercase mb-1">المنطقة</p>
                    <p className="text-xl font-black text-slate-900">{selectedProperty?.city}</p>
                 </div>
                  <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-600 font-black uppercase mb-1">تاريخ التسجيل</p>
                    <p className="text-xs font-black text-slate-900">{selectedProperty?.createdAt ? new Date(selectedProperty.createdAt).toLocaleDateString('ar-IQ') : '—'}</p>
                 </div>
              </div>

              {selectedProperty?.issuer && (
                <div className="space-y-6 bg-indigo-50/30 p-8 rounded-[36px] border border-indigo-100/50">
                   <h4 className="text-xl font-black text-indigo-900 flex items-center gap-2">
                     <FileText className="w-6 h-6 text-indigo-600" />
                     بيانات السجل العقاري الرسمي
                   </h4>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">الجهة المصدرة</p>
                        <p className="font-bold text-slate-900">{selectedProperty.issuer}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">مديرية التسجيل في</p>
                        <p className="font-bold text-slate-900">{selectedProperty.registrationDirectorate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">نوع النموذج</p>
                        <p className="font-bold text-slate-900">{selectedProperty.formType}</p>
                      </div>
                   </div>

                   <hr className="border-indigo-100" />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <h5 className="text-sm font-black text-indigo-700 underline underline-offset-4">السجل الدائمي الحالي</h5>
                         <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-slate-500 font-bold ml-2">المحافظة:</span> <span className="font-black">{selectedProperty.governorate}</span></div>
                            <div><span className="text-slate-500 font-bold ml-2">القضاء:</span> <span className="font-black">{selectedProperty.district}</span></div>
                            <div><span className="text-slate-500 font-bold ml-2">العدد:</span> <span className="font-black">{selectedProperty.recordNumber}</span></div>
                            <div><span className="text-slate-500 font-bold ml-2">التاريخ:</span> <span className="font-black">{selectedProperty.recordDate ? new Date(selectedProperty.recordDate).toLocaleDateString('ar-IQ') : '—'}</span></div>
                            <div><span className="text-slate-500 font-bold ml-2">المجلد:</span> <span className="font-black">{selectedProperty.recordVolume}</span></div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h5 className="text-sm font-black text-amber-700 underline underline-offset-4">السجل المنقول منه</h5>
                         <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-slate-500 font-bold ml-2">العدد:</span> <span className="font-black">{selectedProperty.prevRecordNumber}</span></div>
                            <div><span className="text-slate-500 font-bold ml-2">التاريخ:</span> <span className="font-black">{selectedProperty.prevRecordDate ? new Date(selectedProperty.prevRecordDate).toLocaleDateString('ar-IQ') : '—'}</span></div>
                            <div><span className="text-slate-500 font-bold ml-2">المجلد:</span> <span className="font-black">{selectedProperty.prevRecordVolume}</span></div>
                            <div><span className="text-slate-500 font-bold ml-2">التسلسل:</span> <span className="font-black">{selectedProperty.propertySequence}</span></div>
                         </div>
                      </div>
                   </div>

                   <hr className="border-indigo-100" />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                      <div className="space-y-2">
                        <p className="text-[10px] text-indigo-600 font-black uppercase">المالك والتابعية</p>
                        <p className="font-black text-slate-900">{selectedProperty.ownerNationality}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-indigo-600 font-black uppercase">المساحة</p>
                        <p className="font-black text-slate-900">
                          {selectedProperty.areaSqm && <span>{selectedProperty.areaSqm} م٢ </span>}
                          {selectedProperty.areaOlk && <span> / {selectedProperty.areaOlk} اولك </span>}
                          {selectedProperty.areaDonum && <span> / {selectedProperty.areaDonum} دونم </span>}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-indigo-600 font-black uppercase">جنس ونوع العقار</p>
                        <p className="font-black text-slate-900">{selectedProperty.propertyGender} - {selectedProperty.propertyTypeDetailed}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-indigo-600 font-black uppercase">الجهة الطالبة</p>
                        <p className="font-black text-slate-900">{selectedProperty.requestingEntity} ({selectedProperty.certificationDate ? new Date(selectedProperty.certificationDate).toLocaleDateString('ar-IQ') : '—'})</p>
                      </div>
                   </div>
                </div>
              )}

              <div className="space-y-4">
                 <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                   <Users className="w-5 h-5 text-indigo-600" />
                   الشركاء والمالكين (توزيع النسب)
                 </h4>
                 <div className="max-h-[200px] overflow-y-auto rounded-3xl border border-slate-50 bg-slate-50/30 p-2 custom-scrollbar">
                    {selectedProperty?.shareholders?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedProperty.shareholders.map((sh: any) => (
                          <div key={sh.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-200">
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{sh.name}</span>
                                <span className="text-[10px] text-slate-500">{sh.phone || 'بدون هاتف'}</span>
                             </div>
                             <Badge className="bg-indigo-600 text-white font-black rounded-lg">%{sh.sharePercent}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 font-bold italic">لا يوجد شركاء مسجلين لهذا العقار.</div>
                    )}
                 </div>
                 
                 <div className="flex gap-4 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex-1 space-y-1">
                       <Label className="text-[10px] font-black mr-1">اسم الشريك</Label>
                       <Input id="newShName" placeholder="الاسم الكامل" className="h-10 text-sm font-bold bg-white" />
                    </div>
                    <div className="w-24 space-y-1">
                       <Label className="text-[10px] font-black mr-1">النسبة %</Label>
                       <Input id="newShPercent" type="number" placeholder="25" className="h-10 text-sm font-bold bg-white" />
                    </div>
                    <Button 
                      onClick={async () => {
                        const name = (document.getElementById('newShName') as HTMLInputElement).value;
                        const percent = parseFloat((document.getElementById('newShPercent') as HTMLInputElement).value);
                        if (!name || isNaN(percent)) return alert("يرجى إكمال البيانات");
                        try {
                          await api.post(`/financial/shareholders`, { name, sharePercent: percent, propertyId: selectedProperty.id });
                          // Refresh data
                          const res = await api.get(`/properties/${selectedProperty.id}`);
                          setSelectedProperty(res);
                          (document.getElementById('newShName') as HTMLInputElement).value = '';
                          (document.getElementById('newShPercent') as HTMLInputElement).value = '';
                        } catch (err: any) { alert(err.message); }
                      }}
                      className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg px-4"
                    >
                      إضافة
                    </Button>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                   <LayoutGrid className="w-5 h-5 text-indigo-600" />
                   قائمة الوحدات المرتبطة
                 </h4>
                 <div className="max-h-[250px] overflow-y-auto rounded-3xl border border-slate-50 bg-slate-50/30 p-2 custom-scrollbar">
                    {selectedProperty?.units?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedProperty.units.map((unit: any) => (
                           <div key={unit.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 font-black text-sm">{unit.unitNumber}</div>
                                <div>
                                   <p className="font-bold text-slate-900">{unit.unitNumber}</p>
                                   <p className="text-[10px] text-slate-600 font-bold uppercase">{unit.type}</p>
                                </div>
                              </div>
                              <Badge className={cn(
                                "font-black text-[10px]",
                                unit.status === 'AVAILABLE' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                              )}>{unit.status}</Badge>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 font-bold italic">لا توجد وحدات مضافة بعد لهذا العقار.</div>
                    )}
                 </div>
              </div>
           </div>
           
            <div className="p-8 bg-slate-50 flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-4">
               <Button variant="ghost" onClick={() => setShowPropertyDetails(false)} className="flex-1 h-12 items-center rounded-xl font-bold text-slate-600 transition-all hover:bg-slate-200">إغلاق</Button>
               {selectedProperty?.mapUrl && (
                  <Button asChild className="flex-1 h-12 bg-emerald-600 text-white hover:bg-emerald-700 items-center justify-center rounded-xl font-black gap-2 shadow-lg shadow-emerald-600/20 transition-all">
                    <a href={selectedProperty.mapUrl} target="_blank" rel="noopener noreferrer">
                      <Map className="w-5 h-5" /> موقع العقار
                    </a>
                  </Button>
               )}
              </div>
              <Button onClick={() => exportPropertyReport(selectedProperty)} className="flex-1 h-12 bg-indigo-600 text-white hover:bg-indigo-700 items-center justify-center rounded-xl font-black gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                <FileText className="w-5 h-5" /> استخراج تقرير العقار
              </Button>
            </div>
         </DialogContent>
       </Dialog>

      <Dialog open={showAttachments} onOpenChange={setShowAttachments}>
        <DialogContent className="sm:max-w-[700px] border-none shadow-2xl bg-white rounded-[32px] p-8" dir="rtl">
          <DialogHeader className="text-right mb-4">
            <DialogTitle className="text-2xl font-black text-slate-900 leading-tight flex items-center gap-3">
              <Paperclip className="w-6 h-6 text-indigo-600" />
              مرفقات: {selectedProperty?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProperty && (
            <AttachmentManager 
              entityType="PROPERTY" 
              entityId={selectedProperty.id} 
              title="وثائق العقار وصوره"
            />
          )}

          <div className="mt-8 flex justify-end">
            <Button 
              type="button"
              onClick={() => setShowAttachments(false)} 
              className="bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold px-8 rounded-xl"
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
