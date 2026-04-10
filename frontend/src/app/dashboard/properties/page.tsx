"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Building2, Plus, Search, MapPin, 
  LayoutGrid, List, MoreVertical, 
  Edit, Archive, Trash2, Eye, 
  ChevronRight, Upload, Loader2,
  FileText, Paperclip, Map, Users
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingAction } from "@/components/ui/floating-action";
import { DataTable } from "@/components/ui/data-table";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription, 
  ModalFooter 
} from "@/components/ui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useLanguage } from "@/context/language-context";

export default function PropertiesPage() {
  const { language, t, dir } = useLanguage();
  const { format } = useCurrency();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreate, setShowCreate] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [form, setForm] = useState({ 
    name: "", address: "", city: "Baghdad", country: "Iraq", description: "",
    issuer: "", registrationDirectorate: "", formType: "", governorate: "Baghdad",
    district: "", subDistrict: "", street: "", recordNumber: "", recordDate: "",
    recordVolume: "", prevRecordNumber: "", prevRecordDate: "", prevRecordVolume: "",
    propertySequence: "", neighborhoodName: "", doorNumber: "", plotNumber: "",
    sectionNumber: "", sectionName: "", ownerNationality: "", boundaries: "كما في الخارطة",
    propertyGender: "", propertyTypeDetailed: "", contents: "", easements: "",
    areaSqm: 0, areaOlk: 0, areaDonum: 0, registrationNature: "",
    insuranceNotes: "", deedRuling: "", requestingEntity: "", certificationDate: "",
    seals: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [search, statusFilter]);

  async function load() {
    setLoading(true);
    try {
      const statusParam = statusFilter === "all" ? "" : `&status=${statusFilter}`;
      const res = await api.get(`/properties?search=${search}${statusParam}&include=units&limit=50`);
      setProperties(res.data || []);
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
      // Ensure numeric values are numbers
      const payload = {
        ...form,
        areaSqm: Number(form.areaSqm),
        areaOlk: Number(form.areaOlk),
        areaDonum: Number(form.areaDonum),
      };
      await api.post("/properties", payload);
      setShowCreate(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(language === 'ar' ? "هل أنت متأكد من حذف هذا العقار؟" : "Are you sure you want to delete this property?")) return;
    try {
      await api.delete(`/properties/${id}`);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post("/properties/import", formData);
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const columns = [
    { header: t('property_name'), accessorKey: "name", cell: (item: any) => (
      <div className={cn("flex items-center gap-3", language === 'ar' ? "flex-row-reverse" : "")}>
        <div className="w-8 h-8 rounded bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-500">
          <Building2 className="w-4 h-4" />
        </div>
        <span className="font-bold text-neutral-900 dark:text-neutral-50">{item.name}</span>
      </div>
    )},
    { header: t('location'), accessorKey: "address", cell: (item: any) => (
      <span className="text-neutral-500 text-xs">{item.address}, {t(item.city) || item.city}</span>
    )},
    { header: t('units'), accessorKey: "units", cell: (item: any) => (
      <span className="font-medium">{item._count?.units || 0} {t('units').toLowerCase()}</span>
    )},
    { header: t('occupancy'), accessorKey: "occupancy", cell: (item: any) => {
      const rented = item.units?.filter((u: any) => u.status === 'RENTED').length || 0;
      const total = item._count?.units || item.units?.length || 0;
      const pct = total > 0 ? (rented / total) * 100 : 0;
      return (
        <div className="flex items-center gap-2">
           <div className="w-16 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-accent-500" style={{ width: `${pct}%` }} />
           </div>
           <span className="text-xs font-bold">{pct.toFixed(0)}%</span>
        </div>
      );
    }},
    { header: t('status'), accessorKey: "status", cell: (item: any) => (
      <Badge variant={item.deletedAt ? "danger" : "success"} size="sm">{item.deletedAt ? t('inactive') : t('active')}</Badge>
    )},
    { header: t('revenue'), accessorKey: "revenue", cell: (item: any) => (
      <span className="font-black text-neutral-900 dark:text-neutral-50">{format(0)}</span>
    )},
    { header: t('actions'), accessorKey: "actions", cell: (item: any) => (
      <div className="flex items-center gap-1">
         <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="w-4 h-4" /></Button>
         <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-danger" /></Button>
      </div>
    )},
  ];

  return (
    <div className={cn("space-y-8 pb-12", language === 'ar' ? "font-arabic text-right" : "")} dir={dir}>
      <PageHeader 
        title={t('properties_portfolio')}
        description={t('properties_description')}
        actions={
          <div className="flex items-center gap-3">
             <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx,.xls" />
             <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} isLoading={importing}>
                <Upload className="w-4 h-4 mr-2" /> {t('import_excel')}
             </Button>
             <Button size="sm" onClick={() => setShowCreate(true)} className="bg-primary-600">
                <Plus className="w-4 h-4 mr-2" /> {t('add_property')}
             </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <Card noPadding className="shadow-sm">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-col md:flex-row gap-4 w-full">
            <div className="relative w-full md:w-80">
               <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400", language === 'ar' ? "right-3" : "left-3")} />
               <Input 
                 placeholder={t('search_properties')} 
                 className={cn("h-10", language === 'ar' ? "pr-10" : "pl-10")} 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
               />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} dir={dir}>
              <SelectTrigger className="w-full md:w-40 h-10 font-medium">
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_status')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all" dir={dir}>
              <SelectTrigger className="w-full md:w-40 h-10 font-medium">
                <SelectValue placeholder={t('city')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? "كل المدن" : "All Cities"}</SelectItem>
                <SelectItem value="Baghdad">{t('Baghdad')}</SelectItem>
                <SelectItem value="Erbil">{t('Erbil')}</SelectItem>
                <SelectItem value="Basra">{t('Basra')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
             <button 
               onClick={() => setViewMode("grid")}
               className={cn(
                 "p-1.5 rounded-md transition-all", 
                 viewMode === "grid" ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500" : "text-neutral-400"
               )}
             >
               <LayoutGrid className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setViewMode("list")}
               className={cn(
                 "p-1.5 rounded-md transition-all", 
                 viewMode === "list" ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500" : "text-neutral-400"
               )}
             >
               <List className="w-4 h-4" />
             </button>
          </div>
        </div>
      </Card>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Array.from({ length: 6 }).map((_, i) => (
             <Card key={i} className="h-80 animate-pulse bg-neutral-50 dark:bg-neutral-900/50" />
           ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} noPadding className="overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-950/20 relative">
                 <div className={cn("absolute top-4", language === 'ar' ? "left-4" : "right-4")}>
                    <Badge variant="success" size="sm" className="shadow-lg">{t('active')}</Badge>
                 </div>
                 <Building2 className={cn("absolute bottom-[-20px] w-24 h-24 text-white/20", language === 'ar' ? "right-4" : "left-4")} />
              </div>
              <div className="p-5 space-y-4">
                 <div className="flex items-start justify-between">
                    <div className={cn(language === 'ar' ? "text-right" : "text-left")}>
                       <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-primary-500 transition-colors">
                          {property.name}
                       </h3>
                       <p className="flex items-center text-xs text-neutral-400 mt-1">
                          <MapPin className="w-3 h-3 mx-1" /> {property.address}, {t(property.city) || property.city}
                       </p>
                    </div>
                    <DropdownMenu dir={dir}>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                             <MoreVertical className="w-4 h-4" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align={language === 'ar' ? "start" : "end"}>
                          <DropdownMenuItem className="gap-2"><Edit className="w-4 h-4" /> {t('edit')}</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><Archive className="w-4 h-4" /> {t('archive')}</DropdownMenuItem>
                          <DropdownMenuItem className="text-danger gap-2" onClick={() => handleDelete(property.id)}>
                             <Trash2 className="w-4 h-4" /> {t('delete')}
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                 </div>

                 <div className="h-[1px] w-full bg-neutral-100 dark:bg-neutral-800" />

                 <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                       <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t('units')}</p>
                       <p className="text-sm font-bold mt-0.5">{property._count?.units || 0}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t('occupancy')}</p>
                       <p className="text-sm font-bold mt-0.5 text-accent-600">
                          {((property.units?.filter((u: any) => u.status === 'RENTED').length || 0) / (property._count?.units || property.units?.length || 1) * 100).toFixed(0)}%
                       </p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t('revenue')}</p>
                       <p className="text-sm font-bold mt-0.5">{format(0)}</p>
                    </div>
                 </div>

                 <div className="h-[1px] w-full bg-neutral-100 dark:bg-neutral-800" />

                 <Button 
                   variant="outline" 
                   className="w-full text-xs font-bold gap-2 group-hover:bg-primary-500 group-hover:text-white transition-all"
                  >
                   {t('view_details')} <ChevronRight className={cn("w-4 h-4", language === 'ar' ? "rotate-180" : "")} />
                 </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={properties} />
      )}

      {/* Mobile FAB */}
      <FloatingAction href="#" label={t('add_property')} />

      {/* Property Creation Modal (Sanad Overhaul) */}
      <Modal open={showCreate} onOpenChange={setShowCreate}>
        <ModalContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-neutral-50 dark:bg-neutral-900 border-none rounded-[32px] p-0" dir={dir}>
          <form onSubmit={handleCreate}>
            <div className="p-8 space-y-12">
              <ModalHeader className={cn(language === 'ar' ? "text-right" : "text-left")}>
                <ModalTitle className="text-3xl font-black text-neutral-900 dark:text-neutral-50">{t('add_property')}</ModalTitle>
                <ModalDescription className="text-base font-medium text-neutral-500">{t('properties_description')}</ModalDescription>
              </ModalHeader>

              {/* General Property Info (Internal usage) */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-50 dark:border-neutral-700 pb-4 mb-2">
                   <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
                      <Building2 className="w-5 h-5" />
                   </div>
                   <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-tight">{t('general_info')} (النظام)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-1">
                        {t('property_name')} <span className="text-danger">*</span>
                      </Label>
                      <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 dark:bg-neutral-900/50 dark:border-neutral-700 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-1">
                        {t('location')} <span className="text-danger">*</span>
                      </Label>
                      <Input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 dark:bg-neutral-900/50 dark:border-neutral-700 rounded-xl font-bold" />
                   </div>
                </div>
              </div>

              {/* Sanad: General legal Info */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-50 dark:border-neutral-700 pb-4 mb-2">
                   <div className="w-10 h-10 rounded-2xl bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center text-accent-500">
                      <FileText className="w-5 h-5" />
                   </div>
                   <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-tight">{t('general_info')} (السند)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">
                        {t('issuer')} <span className="text-danger">({t('mandatory')})</span>
                      </Label>
                      <Input required value={form.issuer} onChange={e => setForm({...form, issuer: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">
                        {t('registration_directorate')} <span className="text-danger">({t('mandatory')})</span>
                      </Label>
                      <Input required value={form.registrationDirectorate} onChange={e => setForm({...form, registrationDirectorate: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">
                        {t('form_type')} <span className="text-danger">({t('mandatory')})</span>
                      </Label>
                      <Input required value={form.formType} onChange={e => setForm({...form, formType: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                </div>
              </div>

              {/* Sanad: Current Record */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-50 dark:border-neutral-700 pb-4 mb-2">
                   <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                      <Map className="w-5 h-5" />
                   </div>
                   <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-tight">{t('current_record_desc')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('governorate')} <span className="text-danger">*</span></Label>
                      <Input required value={form.governorate} onChange={e => setForm({...form, governorate: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('district')} <span className="text-danger">*</span></Label>
                      <Input required value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('sub_district')} <span className="text-neutral-300">({t('optional')})</span></Label>
                      <Input value={form.subDistrict} onChange={e => setForm({...form, subDistrict: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-medium" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('street')} <span className="text-neutral-300">({t('optional')})</span></Label>
                      <Input value={form.street} onChange={e => setForm({...form, street: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-medium" />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('number')} <span className="text-danger">*</span></Label>
                      <Input required value={form.recordNumber} onChange={e => setForm({...form, recordNumber: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('date')} <span className="text-danger">*</span></Label>
                      <Input required type="date" value={form.recordDate} onChange={e => setForm({...form, recordDate: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('volume_number')} <span className="text-danger">*</span></Label>
                      <Input required value={form.recordVolume} onChange={e => setForm({...form, recordVolume: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                </div>
              </div>

              {/* Sanad: Transferred From */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-50 dark:border-neutral-700 pb-4 mb-2">
                   <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                      <Archive className="w-5 h-5" />
                   </div>
                   <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-tight">{t('prev_record_desc')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('number')} <span className="text-danger">*</span></Label>
                      <Input required value={form.prevRecordNumber} onChange={e => setForm({...form, prevRecordNumber: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('date')} <span className="text-danger">*</span></Label>
                      <Input required type="date" value={form.prevRecordDate} onChange={e => setForm({...form, prevRecordDate: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('volume_number')} <span className="text-danger">*</span></Label>
                      <Input required value={form.prevRecordVolume} onChange={e => setForm({...form, prevRecordVolume: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                </div>
              </div>

              {/* Sanad: Property Identification */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-50 dark:border-neutral-700 pb-4 mb-2">
                   <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-tight">{t('property_sequence')} & {t('neighborhood_name')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('property_sequence')} <span className="text-danger">*</span></Label>
                      <Input required value={form.propertySequence} onChange={e => setForm({...form, propertySequence: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('neighborhood_name')} <span className="text-danger">*</span></Label>
                      <Input required value={form.neighborhoodName} onChange={e => setForm({...form, neighborhoodName: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('location_details')} <span className="text-neutral-300">({t('optional')})</span></Label>
                   <Input value={form.doorNumber} onChange={e => setForm({...form, doorNumber: e.target.value})} placeholder="رقم الباب / رقم القطعة / رقم المقاطعة / اسم المقاطعة" className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl" />
                </div>
              </div>

              {/* Sanad: Details & Ownership */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-50 dark:border-neutral-700 pb-4 mb-2">
                   <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                      <Users className="w-5 h-5" />
                   </div>
                   <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-tight">{t('ownership_details')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('owner_nationality')} <span className="text-danger">*</span></Label>
                      <Input required value={form.ownerNationality} onChange={e => setForm({...form, ownerNationality: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('boundaries')}</Label>
                      <Input value={form.boundaries} onChange={e => setForm({...form, boundaries: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl" />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('property_gender')} <span className="text-danger">*</span></Label>
                      <Input required value={form.propertyGender} onChange={e => setForm({...form, propertyGender: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('property_type_detailed')} <span className="text-danger">*</span></Label>
                      <Input required value={form.propertyTypeDetailed} onChange={e => setForm({...form, propertyTypeDetailed: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('contents')} <span className="text-neutral-300">({t('optional')})</span></Label>
                      <Input value={form.contents} onChange={e => setForm({...form, contents: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('easements')} <span className="text-neutral-300">({t('optional')})</span></Label>
                      <Input value={form.easements} onChange={e => setForm({...form, easements: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl" />
                   </div>
                </div>
              </div>

              {/* Sanad: Area */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-50 dark:border-neutral-700 pb-4 mb-2">
                   <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-tight">{t('area_details')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('area_sqm')} <span className="text-danger">*</span></Label>
                      <Input required type="number" value={form.areaSqm} onChange={e => setForm({...form, areaSqm: Number(e.target.value)})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-black text-center" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('area_olk')}</Label>
                      <Input type="number" value={form.areaOlk} onChange={e => setForm({...form, areaOlk: Number(e.target.value)})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl text-center" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('area_donum')}</Label>
                      <Input type="number" value={form.areaDonum} onChange={e => setForm({...form, areaDonum: Number(e.target.value)})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl text-center" />
                   </div>
                </div>
              </div>

              {/* Sanad: Registration Details */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-50 dark:border-neutral-700 pb-4 mb-2">
                   <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-tight">{t('registration_details')}</h3>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('registration_nature')} <span className="text-danger">*</span></Label>
                      <Input required value={form.registrationNature} onChange={e => setForm({...form, registrationNature: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('insurance_notes')} <span className="text-neutral-300">({t('optional')})</span></Label>
                      <Input value={form.insuranceNotes} onChange={e => setForm({...form, insuranceNotes: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('deed_ruling')} <span className="text-neutral-300">({t('optional')})</span></Label>
                      <Input value={form.deedRuling} onChange={e => setForm({...form, deedRuling: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl" />
                   </div>
                </div>
              </div>

              {/* Sanad: Certifications */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-50 dark:border-neutral-700 pb-4 mb-2">
                   <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-tight">{t('certifications')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('requesting_entity_student')} <span className="text-danger">*</span></Label>
                      <Input required value={form.requestingEntity} onChange={e => setForm({...form, requestingEntity: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('certification_date_manual')} <span className="text-danger">*</span></Label>
                      <Input required value={form.certificationDate} onChange={e => setForm({...form, certificationDate: e.target.value})} placeholder="التاريخ المكتوب يدوياً" className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('seals')} <span className="text-danger">*</span></Label>
                      <Input required value={form.seals} onChange={e => setForm({...form, seals: e.target.value})} className="h-12 bg-neutral-50/50 border-neutral-100 rounded-xl font-bold" />
                   </div>
                </div>
              </div>
            </div>

            <ModalFooter className="p-8 bg-neutral-100 dark:bg-neutral-800/50 gap-4 mt-8 rounded-b-[32px]">
               <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="h-12 rounded-xl px-8 font-bold text-neutral-500">{t('cancel')}</Button>
               <Button type="submit" isLoading={saving} className="h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-12 font-black shadow-lg shadow-primary-600/20">{t('record_property')}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
