import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.assets': 'Assets',
    'nav.analytics': 'Analytics',
    'nav.alarms': 'Alarms',
    'nav.vrView': '3D/VR View',
    'nav.admin': 'Administration',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'CET Digital Twin Control Center',
    'dashboard.subtitle': 'Integrated Energy Management System',
    'dashboard.systemStatus': 'System Status',
    'dashboard.normal': 'Normal',
    'dashboard.warning': 'Warning',
    'dashboard.critical': 'Critical',
    'dashboard.offline': 'Offline',
    
    // KPIs
    'kpi.energyEfficiency': 'Energy Efficiency',
    'kpi.loadPercentage': 'Load Percentage',
    'kpi.assetHealth': 'Asset Health',
    'kpi.downtimeRisk': 'Downtime Risk',
    'kpi.powerOutput': 'Power Output',
    'kpi.activeAlarms': 'Active Alarms',
    'kpi.co2Savings': 'CO₂ Savings',
    'kpi.uptime': 'System Uptime',
    
    // Assets
    'assets.solarPanels': 'Solar Panels',
    'assets.transformers': 'Transformers',
    'assets.coolingUnits': 'Cooling Units',
    'assets.inverters': 'Inverters',
    'assets.batteries': 'Battery Storage',
    'assets.meters': 'Smart Meters',
    
    // Alarms
    'alarms.title': 'Active Alarms',
    'alarms.recent': 'Recent Events',
    'alarms.acknowledge': 'Acknowledge',
    'alarms.viewDetails': 'View Details',
    'alarms.jumpToVR': 'Jump to VR',
    
    // VR
    'vr.title': '3D Virtual Environment',
    'vr.enterVR': 'Enter VR Mode',
    'vr.walkthrough': 'Virtual Walkthrough',
    'vr.inspect': 'Inspect Asset',
    
    // Common
    'common.lastUpdate': 'Last Update',
    'common.live': 'LIVE',
    'common.viewAll': 'View All',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.refresh': 'Refresh',
    
    // Time
    'time.now': 'Now',
    'time.today': 'Today',
    'time.week': 'This Week',
    'time.month': 'This Month',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.assets': 'الأصول',
    'nav.analytics': 'التحليلات',
    'nav.alarms': 'الإنذارات',
    'nav.vrView': 'العرض ثلاثي الأبعاد',
    'nav.admin': 'الإدارة',
    'nav.settings': 'الإعدادات',
    
    // Dashboard
    'dashboard.title': 'مركز التحكم للتوأم الرقمي CET',
    'dashboard.subtitle': 'نظام إدارة الطاقة المتكامل',
    'dashboard.systemStatus': 'حالة النظام',
    'dashboard.normal': 'طبيعي',
    'dashboard.warning': 'تحذير',
    'dashboard.critical': 'حرج',
    'dashboard.offline': 'غير متصل',
    
    // KPIs
    'kpi.energyEfficiency': 'كفاءة الطاقة',
    'kpi.loadPercentage': 'نسبة الحمل',
    'kpi.assetHealth': 'صحة الأصول',
    'kpi.downtimeRisk': 'مخاطر التوقف',
    'kpi.powerOutput': 'إنتاج الطاقة',
    'kpi.activeAlarms': 'الإنذارات النشطة',
    'kpi.co2Savings': 'توفير CO₂',
    'kpi.uptime': 'وقت التشغيل',
    
    // Assets
    'assets.solarPanels': 'الألواح الشمسية',
    'assets.transformers': 'المحولات',
    'assets.coolingUnits': 'وحدات التبريد',
    'assets.inverters': 'العواكس',
    'assets.batteries': 'تخزين البطاريات',
    'assets.meters': 'العدادات الذكية',
    
    // Alarms
    'alarms.title': 'الإنذارات النشطة',
    'alarms.recent': 'الأحداث الأخيرة',
    'alarms.acknowledge': 'إقرار',
    'alarms.viewDetails': 'عرض التفاصيل',
    'alarms.jumpToVR': 'انتقل إلى VR',
    
    // VR
    'vr.title': 'البيئة الافتراضية ثلاثية الأبعاد',
    'vr.enterVR': 'دخول وضع VR',
    'vr.walkthrough': 'جولة افتراضية',
    'vr.inspect': 'فحص الأصل',
    
    // Common
    'common.lastUpdate': 'آخر تحديث',
    'common.live': 'مباشر',
    'common.viewAll': 'عرض الكل',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.refresh': 'تحديث',
    
    // Time
    'time.now': 'الآن',
    'time.today': 'اليوم',
    'time.week': 'هذا الأسبوع',
    'time.month': 'هذا الشهر',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('cet-language', lang);
  };
  
  useEffect(() => {
    const savedLang = localStorage.getItem('cet-language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLanguage(savedLang);
    }
  }, []);
  
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
