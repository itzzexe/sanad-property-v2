"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { financeApi } from "@/lib/api/finance";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { api } from "@/lib/api";

const accountSchema = z.object({
  code: z.string().min(1, "رمز الحساب مطلوب"),
  name: z.string().min(1, "اسم الحساب مطلوب"),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE", "OFF_BALANCE_DR", "OFF_BALANCE_CR"]),
  subtype: z.string().optional(),
  parentId: z.string().optional(),
  currency: z.string().min(1, "العملة مطلوبة"),
  description: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  parentAccount?: { id: string; code: string; name: string; type?: string } | null;
}

export function AccountDialog({
  open,
  onOpenChange,
  onSuccess,
  parentAccount,
}: AccountDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "ASSET",
      subtype: "",
      parentId: "",
      currency: "USD",
      description: "",
    },
  });

  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    api.get("/settings").then(res => {
      if (res) setSettings(res);
    }).catch(() => {});
  }, []);

  // Update parentId when parentAccount changes
  useEffect(() => {
    if (open) {
      if (parentAccount) {
        form.setValue("parentId", parentAccount.id);
        form.setValue("type", parentAccount.type as any);
      } else {
        form.setValue("parentId", "");
      }
    }
  }, [parentAccount, open, form]);

  // Auto-detect type based on code
  const codeValue = form.watch("code");
  useEffect(() => {
    if (!parentAccount && codeValue && settings.accountTypeRanges) {
      const codeNum = parseInt(codeValue, 10);
      if (!isNaN(codeNum)) {
        const ranges = settings.accountTypeRanges;
        
        // Add defaults if missing in settings just in case
        const definitions = [
          { key: "ASSET", from: ranges.ASSET?.from ?? 1000, to: ranges.ASSET?.to ?? 1999 },
          { key: "LIABILITY", from: ranges.LIABILITY?.from ?? 2000, to: ranges.LIABILITY?.to ?? 2999 },
          { key: "EXPENSE", from: ranges.EXPENSE?.from ?? 3000, to: ranges.EXPENSE?.to ?? 3999 },
          { key: "REVENUE", from: ranges.REVENUE?.from ?? 4000, to: ranges.REVENUE?.to ?? 4999 },
          { key: "OFF_BALANCE_DR", from: ranges.OFF_BALANCE_DR?.from ?? 5000, to: ranges.OFF_BALANCE_DR?.to ?? 5999 },
          { key: "OFF_BALANCE_CR", from: ranges.OFF_BALANCE_CR?.from ?? 6000, to: ranges.OFF_BALANCE_CR?.to ?? 6999 },
        ];

        for (const def of definitions) {
          if (codeNum >= def.from && codeNum <= def.to) {
            form.setValue("type", def.key as any);
            break;
          }
        }
      }
    }
  }, [codeValue, settings.accountTypeRanges, parentAccount, form]);

  const onSubmit = async (values: AccountFormValues) => {
    setLoading(true);
    try {
      const payload = { ...values };
      if (!payload.parentId) delete payload.parentId;
      if (!payload.subtype) delete payload.subtype;
      if (!payload.description) delete payload.description;

      const result = await financeApi.createAccount(payload) as any;
      if (result?.pendingApproval) {
        toast.info("تم إرسال الحساب للمراجعة — بانتظار موافقة المدير");
      } else {
        toast.success("تم إضافة الحساب بنجاح");
      }
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error.message ?? "فشل في إضافة الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة حساب جديد</DialogTitle>
          <DialogDescription className="sr-only">نموذج إضافة حساب مالي جديد</DialogDescription>
          {parentAccount && (
            <p className="text-sm text-muted-foreground">
              حساب أب: {parentAccount.code} - {parentAccount.name}
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز الحساب</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 1101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الحساب</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!parentAccount}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ASSET">أصول (Assets)</SelectItem>
                        <SelectItem value="LIABILITY">خصوم (Liabilities)</SelectItem>
                        <SelectItem value="EQUITY">حقوق ملكية (Equity)</SelectItem>
                        <SelectItem value="REVENUE">إيرادات (Revenue)</SelectItem>
                        <SelectItem value="EXPENSE">مصاريف (Expense)</SelectItem>
                        <SelectItem value="OFF_BALANCE_DR">خارج الميزانية — مدين (Off-Balance Debit)</SelectItem>
                        <SelectItem value="OFF_BALANCE_CR">خارج الميزانية — دائن (Off-Balance Credit)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الحساب</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: نقدية في الصندوق" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العملة</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العملة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="IQD">IQD</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                        <SelectItem value="SAR">SAR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>النوع الفرعي (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: CURRENT_ASSET" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea placeholder="وصف الحساب..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                حفظ الحساب
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
