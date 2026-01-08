import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { dir } = useLanguage();
  
  return (
    <div className="min-h-screen flex w-full bg-background" dir={dir}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6 scrollbar-industrial">
          {children}
        </main>
      </div>
    </div>
  );
};
