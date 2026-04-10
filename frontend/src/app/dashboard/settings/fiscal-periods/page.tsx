"use client";

import { CalendarRange, Lock, Unlock, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MOCK_PERIODS = [
  { id: 1, name: "January 2025", start: "2025-01-01", end: "2025-01-31", status: "Open", transactions: 142 },
  { id: 2, name: "February 2025", start: "2025-02-01", end: "2025-02-28", status: "Future", transactions: 0 },
  { id: 3, name: "December 2024", start: "2024-12-01", end: "2024-12-31", status: "Closed", transactions: 856 },
];

export default function FiscalPeriodsPage() {
  const columns = [
    { header: "Period Name", accessorKey: "name" },
    { header: "Start Date", accessorKey: "start" },
    { header: "End Date", accessorKey: "end" },
    { header: "Transactions", accessorKey: "transactions" },
    { header: "Status", accessorKey: "status", cell: (item: any) => (
      <Badge 
        variant={item.status === "Open" ? "success" : item.status === "Closed" ? "neutral" : "warning"}
        size="sm"
      >
        {item.status}
      </Badge>
    )},
    { header: "Actions", accessorKey: "actions", cell: (item: any) => (
      <Button variant="ghost" size="sm" className="font-bold">
        {item.status === "Open" ? (
          <><Lock className="w-3 h-3 mr-2" /> Close Period</>
        ) : (
          <><Unlock className="w-3 h-3 mr-2" /> Open Period</>
        )}
      </Button>
    )},
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Fiscal Periods"
        description="Open and close financial months to prevent back-dated entries and ensure accounting integrity."
        actions={<Button size="sm">Create Next Period</Button>}
      />

      <DataTable columns={columns} data={MOCK_PERIODS} />
    </div>
  );
}
