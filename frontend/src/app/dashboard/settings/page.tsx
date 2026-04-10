"use client";

import { useState } from "react";
import { 
  Settings, Building, Globe, Moon, CreditCard, 
  Bell, Shield, Users, Save, Globe2, Wallet,
  Languages, Layout
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/language-context";
import { useTheme } from "@/context/theme-context";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { displayCurrency: currency, setDisplayCurrency: setCurrency } = useCurrency();
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  }

  return (
    <div className="space-y-8 pb-12 font-arabic">
      <PageHeader 
        title={language === 'ar' ? "الإعدادات العامة" : "General Settings"}
        description={language === 'ar' ? "تخصيص النظام، إعدادات الشركة، واللغة المفضلة." : "Customize system behavior, company profile, and language preferences."}
        actions={
          <Button onClick={handleSave} isLoading={saving} className="bg-primary-600">
             <Save className="w-4 h-4 mr-2" /> {language === 'ar' ? "حفظ التغييرات" : "Save Changes"}
          </Button>
        }
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-1 h-14 rounded-2xl mb-8">
          <TabsTrigger value="general" className="rounded-xl px-8 font-bold gap-2">
            <Settings className="w-4 h-4" /> {language === 'ar' ? "عام" : "General"}
          </TabsTrigger>
          <TabsTrigger value="company" className="rounded-xl px-8 font-bold gap-2">
            <Building className="w-4 h-4" /> {language === 'ar' ? "الشركة" : "Company"}
          </TabsTrigger>
          <TabsTrigger value="localization" className="rounded-xl px-8 font-bold gap-2">
            <Globe2 className="w-4 h-4" /> {language === 'ar' ? "اللغة والعملة" : "Localization"}
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-8 font-bold gap-2">
            <Shield className="w-4 h-4" /> {language === 'ar' ? "الأمان" : "Security"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                 <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-primary-500" />
                    {language === 'ar' ? "المظهر والتجربة" : "Appearance & UX"}
                 </h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="font-bold">{language === 'ar' ? "الوضع الليلي" : "Dark Mode"}</p>
                          <p className="text-xs text-neutral-400">{language === 'ar' ? "تبديل بين الوضع المضيء والمظلم" : "Switch between light and dark themes"}</p>
                       </div>
                       <Button variant="outline" onClick={toggleTheme}>
                          {theme === 'dark' ? "Enable Light" : "Enable Dark"}
                       </Button>
                    </div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="company">
           <Card className="p-8">
              <div className="max-w-2xl space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-right">
                       <Label>{language === 'ar' ? "اسم الشركة" : "Company Name"}</Label>
                       <Input defaultValue="Sanad Real Estate" className="rounded-xl h-12 font-bold" />
                    </div>
                    <div className="space-y-2 text-right">
                       <Label>{language === 'ar' ? "المعرف الضريبي" : "Tax ID"}</Label>
                       <Input defaultValue="TR-9001-2025" className="rounded-xl h-12 font-bold" />
                    </div>
                 </div>
                 <div className="space-y-2 text-right">
                    <Label>{language === 'ar' ? "العنوان" : "Address"}</Label>
                    <Input defaultValue="Karada, Baghdad, Iraq" className="rounded-xl h-12 font-bold" />
                 </div>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="localization">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              <Card className="p-8 border-primary-500/20">
                 <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-primary-500" />
                    {language === 'ar' ? "لغة الواجهة" : "Interface Language"}
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setLanguage('ar')}
                      className={cn(
                        "p-6 rounded-3xl border-2 transition-all text-center",
                        language === 'ar' ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10" : "border-neutral-100 dark:border-neutral-800"
                      )}
                    >
                       <span className="block text-2xl mb-2">🇮🇶</span>
                       <span className="font-black">العربية</span>
                    </button>
                    <button 
                      onClick={() => setLanguage('en')}
                      className={cn(
                        "p-6 rounded-3xl border-2 transition-all text-center",
                        language === 'en' ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10" : "border-neutral-100 dark:border-neutral-800"
                      )}
                    >
                       <span className="block text-2xl mb-2">🇺🇸</span>
                       <span className="font-black">English</span>
                    </button>
                 </div>
              </Card>

              <Card className="p-8">
                 <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-accent-500" />
                    {language === 'ar' ? "العملة الافتراضية" : "Default Currency"}
                 </h3>
                 <div className="space-y-4">
                    <Button 
                      variant={currency === 'IQD' ? 'solid' : 'outline'} 
                      className="w-full h-14 rounded-2xl font-bold justify-between px-6"
                      onClick={() => setCurrency('IQD')}
                    >
                       <span>الدينار العراقي (IQD)</span>
                       {currency === 'IQD' && <span>✓</span>}
                    </Button>
                    <Button 
                      variant={currency === 'USD' ? 'solid' : 'outline'} 
                      className="w-full h-14 rounded-2xl font-bold justify-between px-6"
                      onClick={() => setCurrency('USD')}
                    >
                       <span>US Dollar (USD)</span>
                       {currency === 'USD' && <span>✓</span>}
                    </Button>
                 </div>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
