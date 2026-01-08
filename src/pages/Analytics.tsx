import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Calendar, Download, TrendingUp, BarChart2, PieChart, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data for charts
const weeklyData = [
  { day: 'Mon', generation: 380, consumption: 320, efficiency: 92 },
  { day: 'Tue', generation: 420, consumption: 340, efficiency: 94 },
  { day: 'Wed', generation: 390, consumption: 310, efficiency: 91 },
  { day: 'Thu', generation: 450, consumption: 360, efficiency: 95 },
  { day: 'Fri', generation: 410, consumption: 330, efficiency: 93 },
  { day: 'Sat', generation: 380, consumption: 290, efficiency: 90 },
  { day: 'Sun', generation: 350, consumption: 270, efficiency: 89 },
];

const assetDistribution = [
  { name: 'Solar Panels', value: 65, color: 'hsl(152, 60%, 45%)' },
  { name: 'Transformers', value: 15, color: 'hsl(210, 80%, 50%)' },
  { name: 'Inverters', value: 12, color: 'hsl(38, 92%, 50%)' },
  { name: 'Storage', value: 8, color: 'hsl(270, 60%, 50%)' },
];

const predictiveData = [
  { month: 'Jan', actual: null, predicted: 4200, upper: 4400, lower: 4000 },
  { month: 'Feb', actual: null, predicted: 4100, upper: 4350, lower: 3850 },
  { month: 'Mar', actual: null, predicted: 4500, upper: 4800, lower: 4200 },
  { month: 'Apr', actual: null, predicted: 4800, upper: 5100, lower: 4500 },
  { month: 'May', actual: null, predicted: 5200, upper: 5500, lower: 4900 },
  { month: 'Jun', actual: null, predicted: 5500, upper: 5850, lower: 5150 },
];

const Analytics = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const chartColors = {
    line: theme === 'dark' ? 'hsl(0, 0%, 95%)' : 'hsl(210, 40%, 10%)',
    grid: theme === 'dark' ? 'hsl(210, 20%, 25%)' : 'hsl(210, 20%, 80%)',
    primary: 'hsl(152, 60%, 45%)',
    secondary: 'hsl(210, 80%, 50%)',
    warning: 'hsl(38, 92%, 50%)',
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('nav.analytics')}</h1>
            <p className="text-muted-foreground">
              AI-powered insights and predictive analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 me-2" />
              Last 7 Days
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 me-2" />
              {t('common.export')}
            </Button>
          </div>
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Performance */}
          <div className="panel-industrial">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Weekly Energy Performance</h3>
              </div>
            </div>
            <div className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="day" stroke={chartColors.grid} tick={{ fill: chartColors.line, fontSize: 11 }} />
                  <YAxis stroke={chartColors.grid} tick={{ fill: chartColors.line, fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? 'hsl(210, 20%, 10%)' : 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(210, 20%, 25%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="generation" fill={chartColors.primary} name="Generation (MWh)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="consumption" fill={chartColors.secondary} name="Consumption (MWh)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Asset Distribution */}
          <div className="panel-industrial">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Asset Energy Contribution</h3>
              </div>
            </div>
            <div className="p-4 h-[300px] flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <RePieChart>
                  <Pie
                    data={assetDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {assetDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className="text-sm font-bold text-foreground ms-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* AI Predictions */}
          <div className="panel-industrial lg:col-span-2">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">AI Predictive Analytics - 6 Month Forecast</h3>
              </div>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">AI Generated</span>
            </div>
            <div className="p-4 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictiveData}>
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="month" stroke={chartColors.grid} tick={{ fill: chartColors.line, fontSize: 11 }} />
                  <YAxis stroke={chartColors.grid} tick={{ fill: chartColors.line, fontSize: 11 }} tickFormatter={(v) => `${v} MWh`} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? 'hsl(210, 20%, 10%)' : 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(210, 20%, 25%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="transparent"
                    fill="url(#colorRange)"
                    name="Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="transparent"
                    fill={theme === 'dark' ? 'hsl(0, 0%, 3%)' : 'hsl(0, 0%, 100%)'}
                    name="Lower Bound"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke={chartColors.primary}
                    strokeWidth={3}
                    dot={{ fill: chartColors.primary, strokeWidth: 2 }}
                    name="Predicted Output"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Efficiency Trend */}
          <div className="panel-industrial lg:col-span-2">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">System Efficiency Trend</h3>
              </div>
            </div>
            <div className="p-4 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="day" stroke={chartColors.grid} tick={{ fill: chartColors.line, fontSize: 11 }} />
                  <YAxis 
                    stroke={chartColors.grid} 
                    tick={{ fill: chartColors.line, fontSize: 11 }} 
                    domain={[85, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? 'hsl(210, 20%, 10%)' : 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(210, 20%, 25%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke={chartColors.primary}
                    strokeWidth={3}
                    dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                    name="Efficiency %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
