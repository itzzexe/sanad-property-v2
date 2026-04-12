"use client";

import { FileDown, Table } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportHeaderProps {
  title: string;
  dateRange?: string;
  reportType?: string;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
  children?: React.ReactNode;
}

export function ReportHeader({ title, dateRange, onExportPdf, onExportExcel }: ReportHeaderProps) {
  return (
    <div className="bg-primary-600 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-primary-500/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
      <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="z-10 text-center md:text-left">
        <h2 className="text-3xl font-black tracking-tight">{title}</h2>
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">
          {dateRange}
        </p>
      </div>

      <div className="flex items-center gap-3 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white h-10 px-6 rounded-xl"
          onClick={onExportPdf}
        >
          <FileDown className="w-4 h-4 mr-2" /> 
          Export PDF
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white h-10 px-6 rounded-xl"
          onClick={onExportExcel}
        >
          <Table className="w-4 h-4 mr-2" /> 
          Export Excel
        </Button>
      </div>
    </div>
  );
}
