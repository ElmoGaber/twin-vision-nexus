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
    
    // Solcast Live Solar Data
    'solcast.title': 'Live Solar Data & Cloud Tracking',
    'solcast.subtitle': 'High-frequency satellite-based irradiance monitoring',
    'solcast.lastUpdate': 'Last update',
    'solcast.streaming': 'Streaming',
    'solcast.paused': 'Paused',
    'solcast.liveData': 'Live Data',
    'solcast.cloudTracking': 'Cloud Tracking',
    'solcast.specs': 'Data Specs',
    'solcast.accuracy': 'Accuracy',
    'solcast.cloudOpacity': 'Cloud Opacity',
    'solcast.efficiency': 'Efficiency',
    'solcast.vsOptimal': 'vs optimal conditions',
    'solcast.irradianceParams': 'Irradiance Parameters',
    'solcast.ghiDesc': 'Global Horizontal Irradiance',
    'solcast.dniDesc': 'Direct Normal Irradiance',
    'solcast.dhiDesc': 'Diffuse Horizontal Irradiance',
    'solcast.estimatedActuals': 'Estimated Actuals Streaming',
    'solcast.estimatedActualsDesc': 'High-resolution satellite imagery processed within minutes, tracking cloud movements into actionable solar data. Coverage spans the last 7 days with 5-minute update intervals.',
    'solcast.liveCloudTracking': 'Live Cloud & Irradiance Tracking',
    'solcast.trackingSubtitle': 'Tracking the world\'s clouds in finest detail',
    'solcast.feature1': 'Real cloud tracking at 1-2km resolution and 5-minute intervals',
    'solcast.feature2': 'Irradiance and PV power data updated every 5-15 minutes',
    'solcast.feature3': 'Downscaled to 90-meter resolution for precise measurements',
    'solcast.feature4': 'Aerosol and albedo effects explicitly treated',
    'solcast.gridOps': 'Grid Operators',
    'solcast.gridOpsDesc': 'Adjust dispatch in real-time',
    'solcast.emsProviders': 'EMS Providers',
    'solcast.emsDesc': 'Refine state-of-charge targets',
    'solcast.vpps': 'VPPs',
    'solcast.vppsDesc': 'Avoid last-minute surprises',
    'solcast.geographic': 'Geographic Coverage',
    'solcast.global': 'Global (90m resolution)',
    'solcast.temporal': 'Temporal Coverage',
    'solcast.resolution': 'Spatial Resolution',
    'solcast.updateFreq': 'Update Frequency',
    'solcast.every5min': 'Every 5 minutes',
    'solcast.temporalRes': 'Temporal Resolution Options',
    'solcast.periodMean': 'Period-mean values for accurate energy calculations',
    'solcast.dataParams': 'Available Data Parameters',
    'solcast.irradiance': 'Irradiance',
    'solcast.solar': 'Solar',
    'solcast.weather': 'Weather',
    'solcast.dataAccess': 'Data Access',
    'solcast.apiDocs': 'API Docs',
    'solcast.provenAccuracy': 'Proven, Replicable Accuracy',
    'solcast.validatedAgainst': 'Validated against high-quality irradiance site measurements',
    'solcast.satelliteObs': 'Satellite Observations',
    'solcast.satelliteObsDesc': 'Processed every 5-15 minutes for real-time accuracy',
    'solcast.cloudModeling': 'Cloud Movement Modeling',
    'solcast.cloudModelingDesc': '1-2km resolution tracks real cloud movements accurately',
    'solcast.reliableData': 'Reliable Real-Time Data',
    'solcast.reliableDataDesc': 'Keeps your control room ahead of changing conditions',
    'solcast.trustedBy': 'Trusted by 350+ solar companies and power system operators on four continents',
    
    // Global Solar Tracker
    'globalTracker.title': 'Global Solar Power Tracker',
    'globalTracker.subtitle': 'Interactive 3D visualization of worldwide solar installations',
    'globalTracker.totalSelected': 'Total Solar Photovoltaic Farm Phases Selected',
    'globalTracker.status': 'Status',
    'globalTracker.techType': 'Technology Type',
    'globalTracker.capacity': 'Capacity Range',
    'globalTracker.maximum': 'Maximum (MW)',
    'globalTracker.minimum': 'Minimum (MW)',
    'globalTracker.selectAll': 'select all',
    'globalTracker.clearAll': 'clear all',
    'globalTracker.map': 'MAP',
    'globalTracker.tableView': 'TABLE VIEW',
    'globalTracker.searchPlaceholder': 'Search installations...',
    'globalTracker.name': 'Name',
    'globalTracker.country': 'Country',
    'globalTracker.capacityMW': 'Capacity (MW)',
    'globalTracker.region': 'SELECT REGION/COUNTRY/AREA',
    'globalTracker.searchBy': 'SEARCH BY',
    'globalTracker.all': 'ALL',
    'globalTracker.projection': 'PROJECTION',
    'globalTracker.basemap': 'BASEMAP',
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
    
    // Solcast Live Solar Data
    'solcast.title': 'بيانات الطاقة الشمسية الحية وتتبع السحب',
    'solcast.subtitle': 'مراقبة الإشعاع عالية التردد عبر الأقمار الصناعية',
    'solcast.lastUpdate': 'آخر تحديث',
    'solcast.streaming': 'بث مباشر',
    'solcast.paused': 'متوقف',
    'solcast.liveData': 'البيانات الحية',
    'solcast.cloudTracking': 'تتبع السحب',
    'solcast.specs': 'مواصفات البيانات',
    'solcast.accuracy': 'الدقة',
    'solcast.cloudOpacity': 'كثافة السحب',
    'solcast.efficiency': 'الكفاءة',
    'solcast.vsOptimal': 'مقارنة بالظروف المثلى',
    'solcast.irradianceParams': 'معاملات الإشعاع',
    'solcast.ghiDesc': 'الإشعاع الأفقي الكلي',
    'solcast.dniDesc': 'الإشعاع الطبيعي المباشر',
    'solcast.dhiDesc': 'الإشعاع الأفقي المنتشر',
    'solcast.estimatedActuals': 'بث القيم الفعلية المقدرة',
    'solcast.estimatedActualsDesc': 'معالجة صور الأقمار الصناعية عالية الدقة خلال دقائق، وتتبع حركة السحب إلى بيانات شمسية قابلة للتنفيذ. التغطية تمتد لآخر 7 أيام مع فترات تحديث كل 5 دقائق.',
    'solcast.liveCloudTracking': 'تتبع السحب والإشعاع الحي',
    'solcast.trackingSubtitle': 'تتبع سحب العالم بأدق التفاصيل',
    'solcast.feature1': 'تتبع السحب الحقيقي بدقة 1-2 كم وفترات 5 دقائق',
    'solcast.feature2': 'تحديث بيانات الإشعاع وطاقة الألواح الكهروضوئية كل 5-15 دقيقة',
    'solcast.feature3': 'تصغير إلى دقة 90 متر للقياسات الدقيقة',
    'solcast.feature4': 'معالجة صريحة لتأثيرات الهباء الجوي والبياض',
    'solcast.gridOps': 'مشغلو الشبكة',
    'solcast.gridOpsDesc': 'ضبط الإرسال في الوقت الفعلي',
    'solcast.emsProviders': 'مزودو EMS',
    'solcast.emsDesc': 'تحسين أهداف حالة الشحن',
    'solcast.vpps': 'محطات الطاقة الافتراضية',
    'solcast.vppsDesc': 'تجنب المفاجآت في اللحظة الأخيرة',
    'solcast.geographic': 'التغطية الجغرافية',
    'solcast.global': 'عالمية (دقة 90 متر)',
    'solcast.temporal': 'التغطية الزمنية',
    'solcast.resolution': 'الدقة المكانية',
    'solcast.updateFreq': 'تردد التحديث',
    'solcast.every5min': 'كل 5 دقائق',
    'solcast.temporalRes': 'خيارات الدقة الزمنية',
    'solcast.periodMean': 'قيم متوسط الفترة لحسابات الطاقة الدقيقة',
    'solcast.dataParams': 'معاملات البيانات المتاحة',
    'solcast.irradiance': 'الإشعاع',
    'solcast.solar': 'شمسي',
    'solcast.weather': 'الطقس',
    'solcast.dataAccess': 'الوصول للبيانات',
    'solcast.apiDocs': 'وثائق API',
    'solcast.provenAccuracy': 'دقة مثبتة وقابلة للتكرار',
    'solcast.validatedAgainst': 'تم التحقق منها مقابل قياسات مواقع الإشعاع عالية الجودة',
    'solcast.satelliteObs': 'مراقبة الأقمار الصناعية',
    'solcast.satelliteObsDesc': 'معالجة كل 5-15 دقيقة للدقة في الوقت الفعلي',
    'solcast.cloudModeling': 'نمذجة حركة السحب',
    'solcast.cloudModelingDesc': 'دقة 1-2 كم تتبع حركات السحب الحقيقية بدقة',
    'solcast.reliableData': 'بيانات موثوقة في الوقت الفعلي',
    'solcast.reliableDataDesc': 'تبقي غرفة التحكم الخاصة بك متقدمة على الظروف المتغيرة',
    'solcast.trustedBy': 'موثوق به من قبل أكثر من 350 شركة طاقة شمسية ومشغلي أنظمة الطاقة في أربع قارات',
    
    // Global Solar Tracker
    'globalTracker.title': 'متتبع الطاقة الشمسية العالمي',
    'globalTracker.subtitle': 'تصور تفاعلي ثلاثي الأبعاد لمنشآت الطاقة الشمسية حول العالم',
    'globalTracker.totalSelected': 'إجمالي مراحل مزارع الطاقة الشمسية الكهروضوئية المحددة',
    'globalTracker.status': 'الحالة',
    'globalTracker.techType': 'نوع التقنية',
    'globalTracker.capacity': 'نطاق السعة',
    'globalTracker.maximum': 'الحد الأقصى (ميجاواط)',
    'globalTracker.minimum': 'الحد الأدنى (ميجاواط)',
    'globalTracker.selectAll': 'تحديد الكل',
    'globalTracker.clearAll': 'مسح الكل',
    'globalTracker.map': 'الخريطة',
    'globalTracker.tableView': 'عرض الجدول',
    'globalTracker.searchPlaceholder': 'البحث عن المنشآت...',
    'globalTracker.name': 'الاسم',
    'globalTracker.country': 'الدولة',
    'globalTracker.capacityMW': 'السعة (ميجاواط)',
    'globalTracker.region': 'اختر المنطقة/الدولة/المساحة',
    'globalTracker.searchBy': 'البحث حسب',
    'globalTracker.all': 'الكل',
    'globalTracker.projection': 'الإسقاط',
    'globalTracker.basemap': 'الخريطة الأساسية',
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
