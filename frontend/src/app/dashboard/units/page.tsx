"use client";

import { useState, useEffect, useRef } from "react";
import { 
  DoorOpen, Plus, Search, Home, 
  LayoutGrid, List, MoreVertical, 
  Edit, Archive, Trash2, Eye, 
  ChevronRight, Upload, Loader2,
  FileText, Paperclip, MapPin, 
  Bed, Bath, Square, Layers, Building,
  ArrowRightLeft
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
import { AttachmentManager } from "@/components/shared/attachment-manager";

export default function UnitsPage() {
  const { language, t, dir } = useLanguage();
  const { format } = useCurrency();
  const [units, setUnits] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreate, setShowCreate] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [form, setForm] = useState({ 
    propertyId: "", unitNumber: "", type: "APARTMENT", status: "AVAILABLE",
    monthlyRent: 0, currency: "IQD", floor: 0, area: 0, 
    bedrooms: 0, bathrooms: 0, description: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    loadProperties();
  }, []);

  useEffect(() => { 
    loadUnits(); 
  }, [search, statusFilter, propertyFilter]);

  async function loadProperties() {
    try {
      const res = await api.get('/properties?limit=100');
      setProperties(res.data || []);
    } catch (err) { console.error(err); }
  }

  async function loadUnits() {
    setLoading(true);
    try {
      let url = `/units?search=${search}&limit=50`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;
      if (propertyFilter !== "all") url += `&propertyId=${propertyFilter}`;
      const res = await api.get(url);
      setUnits(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.propertyId) {
      alert(language === 'ar' ? 'يرجى اختيار العقار' : 'Please select a property');
      return;
    }
    setSaving(true);
    try {
      await api.post("/units", {
        ...form,
        monthlyRent: Number(form.monthlyRent),
        floor: Number(form.floor),
        area: Number(form.area),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
      });
      setShowCreate(false);
      setForm({
        propertyId: "", unitNumber: "", type: "APARTMENT", status: "AVAILABLE",
        monthlyRent: 0, currency: "IQD", floor: 0, area: 0, 
        bedrooms: 0, bathrooms: 0, description: ""
      });
      loadUnits();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(language === 'ar' ? "هل أنت متأكد من حذف هذه الوحدة؟" : "Are you sure you want to delete this unit?")) return;
    try {
      await api.delete(`/units/${id}`);
      loadUnits();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const columns = [
    { header: t('unit_number'), accessorKey: "unitNumber", cell: (item: any) => (
      <div className={cn("flex items-center gap-3", language === 'ar' ? "flex-row-reverse" : "")}>
        <div className="w-8 h-8 rounded bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-500">
          <DoorOpen className="w-4 h-4" />
        </div>
        <span className="font-bold text-neutral-900 dark:text-neutral-50">{item.unitNumber}</span>
      </div>
    )},
    { header: t('property'), accessorKey: "property", cell: (item: any) => (
      <div className="flex flex-col">
        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">{item.property?.name}</span>
        <span className="text-[10px] text-neutral-400">{item.property?.address}</span>
      </div>
    )},
    { header: t('type'), accessorKey: "type", cell: (item: any) => (
      <Badge variant="neutral" size="sm">{t(item.type) || item.type}</Badge>
    )},
    { header: t('status'), accessorKey: "status", cell: (item: any) => (
      <Badge 
        variant={item.status === 'AVAILABLE' ? 'success' : item.status === 'RENTED' ? 'neutral' : 'warning'} 
        size="sm"
      >
        {t(item.status) || item.status}
      </Badge>
    )},
    { header: t('rent'), accessorKey: "monthlyRent", cell: (item: any) => (
      <span className="font-black text-neutral-900 dark:text-neutral-50">{format(item.monthlyRent, item.currency)}</span>
    )},
    { header: t('actions'), accessorKey: "actions", cell: (item: any) => (
      <div className="flex items-center gap-1">
         <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
            setSelectedUnit(item);
            setShowAttachments(true);
         }}>
           <Paperclip className="w-4 h-4" />
         </Button>
         <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(item.id)}>
           <Trash2 className="w-4 h-4 text-danger" />
         </Button>
      </div>
    )},
  ];

  return (
    <div className={cn("space-y-8 pb-12", language === 'ar' ? "font-arabic text-right" : "")} dir={dir}>
      <PageHeader 
        title={t('units_management') || (language === 'ar' ? "إدارة الوحدات" : "Units Management")}
        description={t('units_description') || (language === 'ar' ? "عرض وإدارة جميع الوحدات السكنية والتجارية" : "View and manage all residential and commercial units")}
        actions={
          <div className="flex items-center gap-3">
             <Button size="sm" onClick={() => setShowCreate(true)} className="bg-primary-600">
                <Plus className="w-4 h-4 mr-2" /> {t('add_unit') || (language === 'ar' ? "إضافة وحدة" : "Add Unit")}
             </Button>
          </div>
        }
      />

      <Card noPadding className="shadow-sm">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-col md:flex-row gap-4 w-full">
            <div className="relative w-full md:w-80">
               <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400", language === 'ar' ? "right-3" : "left-3")} />
               <Input 
                 placeholder={t('search_units') || (language === 'ar' ? "بحث في الوحدات..." : "Search units...")}
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
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="AVAILABLE">{t('AVAILABLE')}</SelectItem>
                <SelectItem value="RENTED">{t('RENTED')}</SelectItem>
                <SelectItem value="MAINTENANCE">{t('MAINTENANCE')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={propertyFilter} onValueChange={setPropertyFilter} dir={dir}>
              <SelectTrigger className="w-full md:w-56 h-10 font-medium">
                <SelectValue placeholder={t('property')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_properties') || (language === 'ar' ? "جميع العقارات" : "All Properties")}</SelectItem>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
             <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500" : "text-neutral-400")}><LayoutGrid className="w-4 h-4" /></button>
             <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500" : "text-neutral-400")}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Array.from({ length: 6 }).map((_, i) => (
             <Card key={i} className="h-64 animate-pulse bg-neutral-50 dark:bg-neutral-900/50" />
           ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {units.map((unit) => (
            <Card key={unit.id} noPadding className="overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className={cn(
                "h-2 bg-primary-500",
                unit.status === 'AVAILABLE' ? 'bg-emerald-500' : unit.status === 'RENTED' ? 'bg-indigo-500' : 'bg-amber-500'
              )} />
              <div className="p-5 space-y-4">
                 <div className="flex items-start justify-between">
                    <div>
                       <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-50 group-hover:text-primary-500 transition-colors">
                          {t('unit') || (language === 'ar' ? 'وحدة' : 'Unit')} {unit.unitNumber}
                       </h3>
                       <p className="flex items-center text-xs text-neutral-400 mt-1 font-bold">
                          <Building className="w-3 h-3 mx-1" /> {unit.property?.name}
                       </p>
                    </div>
                    <Badge variant={unit.status === 'AVAILABLE' ? 'success' : 'neutral'} size="sm">
                       {t(unit.status) || unit.status}
                    </Badge>
                 </div>

                 <div className="grid grid-cols-2 gap-3 pb-2">
                    <div className="flex items-center gap-2 text-neutral-500">
                       <Bed className="w-4 h-4" /> <span className="text-sm font-bold">{unit.bedrooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500">
                       <Bath className="w-4 h-4" /> <span className="text-sm font-bold">{unit.bathrooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500">
                       <Square className="w-4 h-4" /> <span className="text-xs font-bold">{unit.area || 0} m²</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500">
                       <Layers className="w-4 h-4" /> <span className="text-xs font-bold">{t('floor')} {unit.floor}</span>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t('monthly_rent')}</p>
                       <p className="text-lg font-black text-neutral-900 dark:text-neutral-50">{format(unit.monthlyRent, unit.currency)}</p>
                    </div>
                    <DropdownMenu dir={dir}>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                             <MoreVertical className="w-4 h-4" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align={language === 'ar' ? "start" : "end"}>
                          <DropdownMenuItem className="gap-2" onClick={() => {
                             setSelectedUnit(unit);
                             setShowAttachments(true);
                          }}>
                            <Paperclip className="w-4 h-4" /> {t('attachments')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-danger gap-2" onClick={() => handleDelete(unit.id)}>
                             <Trash2 className="w-4 h-4" /> {t('delete')}
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={units} />
      )}

      {/* Mobile FAB */}
      <FloatingAction href="#" label={t('add_unit')} />

      {/* Unit Creation Modal */}
      <Modal open={showCreate} onOpenChange={setShowCreate}>
        <ModalContent className="sm:max-w-2xl bg-white dark:bg-neutral-900 border-none rounded-[32px] p-0" dir={dir}>
          <form onSubmit={handleCreate}>
            <div className="p-8 space-y-6">
              <ModalHeader>
                <ModalTitle className="text-3xl font-black text-neutral-900 dark:text-neutral-50">{t('add_unit')}</ModalTitle>
                <ModalDescription className="text-base text-neutral-500">{t('units_description')}</ModalDescription>
              </ModalHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('property')} <span className="text-danger">*</span></Label>
                    <Select value={form.propertyId} onValueChange={val => setForm({...form, propertyId: val})} dir={dir}>
                       <SelectTrigger className="h-12 rounded-xl border-neutral-100 font-bold">
                          <SelectValue placeholder={t('select_property')} />
                       </SelectTrigger>
                       <SelectContent>
                          {properties.map(p => (
                             <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('unit_number')} <span className="text-danger">*</span></Label>
                    <Input required value={form.unitNumber} onChange={e => setForm({...form, unitNumber: e.target.value})} className="h-12 rounded-xl font-bold" />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('type')}</Label>
                    <Select value={form.type} onValueChange={val => setForm({...form, type: val})} dir={dir}>
                       <SelectTrigger className="h-12 rounded-xl font-bold">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="APARTMENT">{t('APARTMENT')}</SelectItem>
                          <SelectItem value="COMMERCIAL">{t('COMMERCIAL')}</SelectItem>
                          <SelectItem value="HOUSE">{t('HOUSE')}</SelectItem>
                          <SelectItem value="OFFICE">{t('OFFICE')}</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('rent')} ({form.currency}) <span className="text-danger">*</span></Label>
                    <Input required type="number" value={form.monthlyRent} onChange={e => setForm({...form, monthlyRent: Number(e.target.value)})} className="h-12 rounded-xl font-black text-lg" />
                 </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                 <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase tracking-widest text-neutral-400">{t('floor')}</Label>
                    <Input type="number" value={form.floor} onChange={e => setForm({...form, floor: Number(e.target.value)})} className="h-12 rounded-xl text-center font-bold" />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase tracking-widest text-neutral-400">{t('area')} (m²)</Label>
                    <Input type="number" value={form.area} onChange={e => setForm({...form, area: Number(e.target.value)})} className="h-12 rounded-xl text-center font-bold" />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase tracking-widest text-neutral-400">{t('bedrooms')}</Label>
                    <Input type="number" value={form.bedrooms} onChange={e => setForm({...form, bedrooms: Number(e.target.value)})} className="h-12 rounded-xl text-center font-bold" />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase tracking-widest text-neutral-400">{t('bathrooms')}</Label>
                    <Input type="number" value={form.bathrooms} onChange={e => setForm({...form, bathrooms: Number(e.target.value)})} className="h-12 rounded-xl text-center font-bold" />
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="font-bold text-xs uppercase tracking-widest text-neutral-400">{t('description')}</Label>
                 <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="h-12 rounded-xl" />
              </div>
            </div>

            <ModalFooter className="p-8 bg-neutral-100 dark:bg-neutral-800/50 gap-4 rounded-b-[32px]">
               <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="h-12 rounded-xl px-8 font-bold text-neutral-500">{t('cancel')}</Button>
               <Button type="submit" isLoading={saving} className="h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-12 font-black shadow-lg shadow-primary-600/20">
                 {t('add_unit')}
               </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Attachments Modal */}
      <Modal open={showAttachments} onOpenChange={setShowAttachments}>
        <ModalContent className="sm:max-w-2xl bg-white dark:bg-neutral-900 border-none rounded-[32px] p-8" dir={dir}>
          <ModalHeader className="mb-6">
            <ModalTitle className="text-2xl font-black flex items-center gap-2">
              <Paperclip className="w-6 h-6 text-indigo-600" />
              {t('unit_attachments') || (language === 'ar' ? 'مرفقات الوحدة' : 'Unit Attachments')}: {selectedUnit?.unitNumber}
            </ModalTitle>
          </ModalHeader>
          
          {selectedUnit && (
            <AttachmentManager 
              entityType="UNIT" 
              entityId={selectedUnit.id} 
              title={t('attachments')}
            />
          )}

          <div className="mt-8 flex justify-end">
            <Button onClick={() => setShowAttachments(false)} className="rounded-xl px-8 font-bold">{t('close') || (language === 'ar' ? 'إغلاق' : 'Close')}</Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
