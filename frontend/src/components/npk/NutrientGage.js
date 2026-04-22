import React from 'react';
import { Card, CardContent } from '../ui/card';

const NutrientGage = ({ label, value, unit, optimalRange, color }) => {
  const { min, max } = optimalRange;
  const percentage = Math.min(Math.max(((value - (min * 0.5)) / (max * 1.5 - (min * 0.5))) * 100, 0), 100);
  
  const getStatus = () => {
    if (value < min) return { text: 'Low', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (value > max) return { text: 'High', color: 'text-orange-500', bg: 'bg-orange-500' };
    return { text: 'Optimal', color: 'text-green-500', bg: 'bg-green-500' };
  };

  const status = getStatus();

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-muted/30">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-manrope">{value.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${status.bg}/10 ${status.color}`}>
            {status.text}
          </span>
        </div>
        
        <div className="relative h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
          {/* Optimal Zone Marker */}
          <div 
            className="absolute h-full bg-green-500/20" 
            style={{ 
              left: `${((min - (min * 0.5)) / (max * 1.5 - (min * 0.5))) * 100}%`,
              width: `${((max - min) / (max * 1.5 - (min * 0.5))) * 100}%`
            }}
          />
          {/* Value Indicator */}
          <div 
            className={`absolute h-full transition-all duration-1000 ${status.bg}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>{min * 0.5}</span>
          <span className="font-medium text-green-600 dark:text-green-400">Optimal: {min}-{max}</span>
          <span>{max * 1.5}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutrientGage;
