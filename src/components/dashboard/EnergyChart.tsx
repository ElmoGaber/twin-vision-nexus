import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const generateData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 3600000);
    const baseOutput = 45 + Math.sin((24 - i) * 0.5) * 30;
    data.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }),
      output: Math.max(0, baseOutput + (Math.random() - 0.5) * 10),
      consumption: 35 + Math.random() * 20,
      efficiency: 85 + Math.random() * 10,
    });
  }
  return data;
};

const data = generateData();

export const EnergyChart: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const chartColors = {
    line: theme === 'dark' ? 'hsl(0, 0%, 95%)' : 'hsl(210, 40%, 10%)',
    grid: theme === 'dark' ? 'hsl(210, 20%, 25%)' : 'hsl(210, 20%, 80%)',
    primary: 'hsl(152, 60%, 45%)',
    secondary: 'hsl(210, 80%, 50%)',
    area: theme === 'dark' ? 'hsl(152, 60%, 45%)' : 'hsl(152, 60%, 28%)',
  };
  
  return (
    <div className="panel-industrial h-full flex flex-col">
      <div className="panel-header">
        <div>
          <h3 className="font-semibold text-foreground">{t('kpi.powerOutput')}</h3>
          <p className="text-xs text-muted-foreground">24-hour overview</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: chartColors.primary }} />
            <span className="text-muted-foreground">Generation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: chartColors.secondary }} />
            <span className="text-muted-foreground">Consumption</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.area} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors.area} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={chartColors.grid}
              vertical={false}
            />
            <XAxis 
              dataKey="time" 
              stroke={chartColors.grid}
              tick={{ fill: chartColors.line, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke={chartColors.grid}
              tick={{ fill: chartColors.line, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value} MW`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: theme === 'dark' ? 'hsl(210, 20%, 10%)' : 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(210, 20%, 25%)',
                borderRadius: '8px',
                color: chartColors.line,
              }}
              labelStyle={{ color: chartColors.line }}
            />
            <Area
              type="monotone"
              dataKey="output"
              stroke={chartColors.primary}
              strokeWidth={2}
              fill="url(#colorOutput)"
            />
            <Line 
              type="monotone" 
              dataKey="consumption" 
              stroke={chartColors.secondary}
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
