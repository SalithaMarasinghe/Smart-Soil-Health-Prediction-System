import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ShieldCheck, Activity, Info } from "lucide-react";
import { format } from "date-fns";

const AirQualityCard = ({ data }) => {
  if (!data) return null;

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'good': return 'text-success';
      case 'fair': return 'text-warning';
      case 'poor': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-manrope font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Air Quality
        </h3>
        <span className="text-xs text-muted-foreground">
          Last seen: {format(new Date(data.timestamp), "HH:mm:ss")}
        </span>
      </div>

      <Card className="border-t-4 border-t-emerald-500">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</span>
              <p className={`text-xl font-bold font-manrope ${getStatusColor(data.aqi_status)}`}>{data.aqi_status}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">AQI Value</span>
              <p className="text-xl font-bold font-manrope">{data.aqi_value}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">CO (PPM)</span>
              <p className="text-xl font-bold font-manrope">{data.ppm.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Raw Value</span>
              <p className="text-xl font-bold font-manrope">{data.raw_value}</p>
            </div>
          </div>
          
          <div className="mt-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-500 mt-0.5" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              The Air Quality Index (AQI) is determined based on the combination of Carbon Monoxide (CO) levels and other particulate matter detected by the MQ sensor.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AirQualityCard;
