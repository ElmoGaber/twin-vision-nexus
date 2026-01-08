import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Globe, Search, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header: React.FC = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmCount] = useState(3);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <header className={cn(
      'h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6',
    )}>
      {/* Left Section - Title & Live Status */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col">
          <h1 className="text-lg font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        
        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-normal/10 border border-status-normal/30">
          <span className="w-2 h-2 rounded-full bg-status-normal status-pulse" />
          <span className="text-xs font-semibold text-status-normal tracking-wider">
            {t('common.live')}
          </span>
        </div>
      </div>
      
      {/* Center Section - Search */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className={cn(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground',
            dir === 'rtl' ? 'right-3' : 'left-3'
          )} />
          <Input 
            placeholder={t('common.search')}
            className={cn(
              'bg-muted/50 border-border/50 focus:border-primary',
              dir === 'rtl' ? 'pr-10' : 'pl-10'
            )}
          />
        </div>
      </div>
      
      {/* Right Section - Actions & Time */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Time Display */}
        <div className="hidden md:flex flex-col items-end text-sm">
          <span className="font-mono font-bold text-foreground tabular-nums">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(currentTime)}
          </span>
        </div>
        
        <div className="w-px h-8 bg-border hidden md:block" />
        
        {/* Refresh */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4" />
        </Button>
        
        {/* Alarms */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          {alarmCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-status-critical text-[10px] font-bold flex items-center justify-center text-primary-foreground status-blink-critical">
              {alarmCount}
            </span>
          )}
        </Button>
        
        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Globe className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
            <DropdownMenuItem 
              onClick={() => setLanguage('en')}
              className={cn(language === 'en' && 'bg-accent')}
            >
              🇺🇸 English
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLanguage('ar')}
              className={cn(language === 'ar' && 'bg-accent')}
            >
              🇸🇦 العربية
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* User Avatar */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
