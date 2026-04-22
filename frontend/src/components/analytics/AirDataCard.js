import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Wind, Thermometer, Droplets } from "lucide-react";
import { format } from "date-fns";

const AirDataCard = ({ data }) => {
  if (!data) return null;

  const safeFormatDate = (ts) => {
    try {
      if (!ts || ts === "N/A") return "N/A";
      const date = new Date(ts);
      if (isNaN(date.getTime())) return ts;
      return format(date, "HH:mm:ss");
    } catch (e) {
      return ts || "N/A";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-manrope font-semibold flex items-center gap-2">
          <Wind className="w-5 h-5 text-blue-400" />
          Air Data (DHT11)
        </h3>
        <span className="text-xs text-muted-foreground">
          Last seen: {safeFormatDate(data.timestamp)}
        </span>
      </div>

      <Card className="border-t-4 border-t-blue-400">
        <CardContent className="pt-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/50 border border-border">
            <Droplets className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-2xl font-bold font-manrope">{data.humidity?.toFixed(2)}%</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Humidity</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/50 border border-border">
            <Thermometer className="w-8 h-8 text-destructive mb-2" />
            <span className="text-2xl font-bold font-manrope">{data.temperature?.toFixed(2)}°C</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Temperature</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AirDataCard;
