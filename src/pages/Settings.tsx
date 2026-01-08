import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Globe, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Palette,
  Monitor,
  Volume2,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { t, language, setLanguage, dir } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('nav.settings')}</h1>
          <p className="text-muted-foreground">
            Configure your dashboard preferences and system settings
          </p>
        </div>
        
        {/* Appearance */}
        <div className="panel-industrial">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Appearance</h3>
            </div>
          </div>
          <div className="p-4 space-y-6">
            {/* Theme Selection */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Theme Mode</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
              </div>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button
                  variant={theme === 'light' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="gap-2"
                >
                  <Sun className="w-4 h-4" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="gap-2"
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </Button>
              </div>
            </div>
            
            {/* Color Preview */}
            <div>
              <Label className="text-foreground font-medium mb-2 block">Color Palette</Label>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-lg bg-primary shadow-lg" />
                  <span className="text-xs text-muted-foreground">Primary</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-lg bg-secondary shadow-lg" />
                  <span className="text-xs text-muted-foreground">Secondary</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-lg bg-status-normal shadow-lg" />
                  <span className="text-xs text-muted-foreground">Success</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-lg bg-status-warning shadow-lg" />
                  <span className="text-xs text-muted-foreground">Warning</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-lg bg-status-critical shadow-lg" />
                  <span className="text-xs text-muted-foreground">Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Language */}
        <div className="panel-industrial">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Language & Region</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Display Language</Label>
                <p className="text-sm text-muted-foreground">Select your preferred language</p>
              </div>
              <Select value={language} onValueChange={(value: 'en' | 'ar') => setLanguage(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="ar">🇸🇦 العربية (Arabic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Time Zone</Label>
                <p className="text-sm text-muted-foreground">Set your local time zone</p>
              </div>
              <Select defaultValue="asia-riyadh">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-riyadh">Asia/Riyadh (GMT+3)</SelectItem>
                  <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                  <SelectItem value="europe-london">Europe/London (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="panel-industrial">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Notifications</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Critical Alarms</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for critical system events</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Warning Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about warning-level events</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Maintenance Reminders</Label>
                <p className="text-sm text-muted-foreground">Scheduled maintenance notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Sound Alerts</Label>
                <p className="text-sm text-muted-foreground">Play sound for incoming alerts</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
        
        {/* Display */}
        <div className="panel-industrial">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Display Settings</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Auto-refresh Dashboard</Label>
                <p className="text-sm text-muted-foreground">Automatically update data every 30 seconds</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Show Animations</Label>
                <p className="text-sm text-muted-foreground">Enable UI animations and transitions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Use smaller spacing for more data density</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
