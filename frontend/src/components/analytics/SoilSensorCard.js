import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Sprout, Droplet, Thermometer, Zap } from "lucide-react";
import { format } from "date-fns";

const SoilSensorCard = ({ data }) => {
  if (!data) return null;

  const safeFormatDate = (ts) => {
    try {
      if (!ts || ts === "N/A") return "N/A";
      // Handle simple HH:mm:ss if that's what's sent, or full date
      const date = new Date(ts);
      if (isNaN(date.getTime())) return ts; // Return raw string if not a date
      return format(date, "HH:mm:ss");
    } catch (e) {
      return ts || "N/A";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-manrope font-semibold flex items-center gap-2">
          <Sprout className="w-5 h-5 text-primary" />
          7-in-1 Soil Sensor
        </h3>
        <span className="text-xs text-muted-foreground">
          Last seen: {safeFormatDate(data.timestamp)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NPK Levels */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nutrient Levels (NPK)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Nitrogen (N)</span>
              <span className="font-bold">{data.nitrogen?.toFixed(2)} mg/kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Phosphorus (P)</span>
              <span className="font-bold">{data.phosphorus?.toFixed(2)} mg/kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Potassium (K)</span>
              <span className="font-bold">{data.potassium?.toFixed(2)} mg/kg</span>
            </div>
          </CardContent>
        </Card>

        {/* Physical readings */}
        <Card className="border-t-4 border-t-info">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Physical Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-warning" />
                <span>Electrical Cond.</span>
              </div>
              <span className="font-bold">{data.ec?.toFixed(2)} mS/cm</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Droplet className="w-4 h-4 text-blue-500" />
                <span>Moisture</span>
              </div>
              <span className="font-bold">{data.moisture?.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Thermometer className="w-4 h-4 text-destructive" />
                <span>Temperature</span>
              </div>
              <span className="font-bold">{data.temperature?.toFixed(2)}°C</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Sprout className="w-4 h-4 text-primary" />
                <span>pH Level</span>
              </div>
              <span className="font-bold">{data.ph?.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SoilSensorCard;
