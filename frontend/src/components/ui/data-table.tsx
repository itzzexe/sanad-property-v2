import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Database } from "lucide-react";
import { EmptyState } from "./empty-state";

interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey: keyof T | string;
    cell?: (item: T) => React.ReactNode;
    hideOnMobile?: boolean; // New flag for disclosure
  }[];
  data: T[];
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalResults: number;
  };
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  pagination,
}: DataTableProps<T>) {
  const [expandedRows, setExpandedRows] = React.useState<number[]>([]);

  const toggleRow = (idx: number) => {
    setExpandedRows(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // Mobile card view helper
  const renderMobileCard = (item: T, index: number) => {
    const isExpanded = expandedRows.includes(index);
    const visibleCols = columns.filter(c => !c.hideOnMobile);
    const hiddenCols = columns.filter(c => c.hideOnMobile);

    return (
      <div
        key={index}
        className="p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm mb-4 md:hidden"
      >
        <div className="space-y-3">
          {visibleCols.map((col, colIdx) => (
            <div key={colIdx} className="flex justify-between items-start gap-4">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{col.header}</span>
              <div className="text-right text-sm font-medium">
                 {col.cell ? col.cell(item) : (item[col.accessorKey as keyof T] as React.ReactNode)}
              </div>
            </div>
          ))}

          {hiddenCols.length > 0 && (
            <>
               {isExpanded && (
                  <div className="pt-3 mt-3 border-t border-neutral-50 dark:border-neutral-800 space-y-3 animate-in fade-in slide-in-from-top-1">
                     {hiddenCols.map((col, colIdx) => (
                        <div key={colIdx} className="flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/50 p-2 rounded-lg">
                           <span className="text-[9px] font-bold text-neutral-400 uppercase">{col.header}</span>
                           <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                              {col.cell ? col.cell(item) : (item[col.accessorKey as keyof T] as React.ReactNode)}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleRow(index)}
                className="w-full text-[10px] font-bold text-neutral-400 hover:text-primary-500 h-8 gap-1"
               >
                 {isExpanded ? (
                   <>Show less <ChevronUp className="w-3 h-3" /></>
                 ) : (
                   <>Show more details <ChevronDown className="w-3 h-3" /></>
                 )}
               </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Desktop View */}
      <div className="hidden md:block rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead key={idx} className="bg-neutral-50/50 dark:bg-neutral-900 text-[10px] font-bold uppercase tracking-widest">{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0 border-none">
                  <div className="py-12">
                    <EmptyState 
                      icon={Database} 
                      title="No records found" 
                      description="We couldn't find any data matching your criteria. Try adjusting your filters or adding a new entry."
                    />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, idx) => (
                <TableRow key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className="p-4">
                      {col.cell ? col.cell(item) : (item[col.accessorKey as keyof T] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="p-6 bg-white rounded-2xl border border-neutral-100 mb-4 shadow-sm animate-pulse">
               <Skeleton className="h-6 w-1/3 mb-4 bg-neutral-100" />
               <Skeleton className="h-4 w-full mb-2 bg-neutral-50" />
               <Skeleton className="h-4 w-2/3 bg-neutral-50" />
            </div>
          ))
        ) : data.length === 0 ? (
          <EmptyState 
            icon={Database} 
            title="No records found" 
            description="Adjust your search or add a new record."
          />
        ) : (
          data.map((item, idx) => renderMobileCard(item, idx))
        )}
      </div>

      {/* Pagination component logic stays similar but styled */}
      {pagination && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 py-6">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Showing <span className="text-neutral-900 dark:text-neutral-50">{data.length}</span> of <span className="text-neutral-900 dark:text-neutral-50">{pagination.totalResults}</span> Entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="h-10 px-4 font-bold border-neutral-200"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Prev
            </Button>
            <div className="flex items-center px-4 h-10 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-xs font-black">
               {pagination.currentPage} <span className="mx-2 text-neutral-400 font-normal">/</span> {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="h-10 px-4 font-bold border-neutral-200"
            >
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
