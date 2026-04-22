import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { Droplets, AlertTriangle, CheckCircle, X, CloudRain } from "lucide-react";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ComposedChart,
} from "recharts";

const WaterloggingMonitor = () => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const data = await apiService.getWaterloggingRisk();
      setRiskData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching waterlogging data:", error);
      toast.error("Failed to fetch waterlogging data");
      setLoading(false);
    }
  };

  const generate48HourForecast = () => {
    if (!riskData || !riskData.hourly_forecast) return [];

    // Use the real hourly forecast from the API
    return riskData.hourly_forecast.map((item) => {
      const hour = new Date(item.time).getHours();
      return {
        hour: `${hour}:00`,
        wfps: riskData.current_wfps + (item.rain * 0.8), // simulated impact for chart trend
        rainfall: item.rain,
      };
    });
  };

  const getRiskBadgeClass = (risk) => {
    switch (risk) {
      case "HIGH":
        return "bg-danger/10 text-danger border-danger/20";
      case "MEDIUM":
        return "bg-warning/10 text-warning border-warning/20";
      case "LOW":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === "wfps" ? "WFPS" : "Rainfall"}:
              <span className="font-semibold ml-1">
                {entry.value?.toFixed(1)}
                {entry.name === "wfps" ? "%" : "mm"}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading waterlogging data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h2 className="font-manrope font-bold text-3xl md:text-4xl text-foreground tracking-tight">
          Waterlogging Monitor
        </h2>
        <p className="text-muted-foreground mt-1">Real-time waterlogging risk assessment and prevention</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card data-testid="current-wfps-card" className="p-6 border-t-4 border-t-info">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-info" />
            </div>
            <h3 className="font-manrope font-semibold text-base text-foreground">Current WFPS</h3>
          </div>
          <p className="font-manrope font-bold text-4xl text-foreground mb-1">
            {riskData?.current_wfps?.toFixed(2)}%
          </p>
          <p className="text-sm text-muted-foreground">Water-Filled Pore Space</p>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Soil Moisture</span>
              <span className="font-semibold">{riskData?.current_moisture?.toFixed(2)}%</span>
            </div>
          </div>
        </Card>

        <Card data-testid="risk-level-card" className={`p-6 border-t-4 ${riskData?.risk_level === "HIGH" ? "border-t-danger" : riskData?.risk_level === "MEDIUM" ? "border-t-warning" : "border-t-success"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${riskData?.risk_level === "HIGH" ? "bg-danger/10" :
                riskData?.risk_level === "MEDIUM" ? "bg-warning/10" : "bg-success/10"
              }`}>
              <AlertTriangle className={`w-5 h-5 ${riskData?.risk_level === "HIGH" ? "text-danger" :
                  riskData?.risk_level === "MEDIUM" ? "text-warning" : "text-success"
                }`} />
            </div>
            <h3 className="font-manrope font-semibold text-base text-foreground">Risk Level</h3>
          </div>
          <span className={`inline-block px-4 py-2 rounded-full font-manrope font-bold text-2xl border ${getRiskBadgeClass(riskData?.risk_level)}`}>
            {riskData?.risk_level}
          </span>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Time to Event</span>
              <span className="font-semibold">{riskData?.time_to_event_hours?.toFixed(2)}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold">{riskData?.duration_hours?.toFixed(2)}h</span>
            </div>
          </div>
        </Card>

        <Card data-testid="rainfall-forecast-card" className="p-6 border-t-4 border-t-primary">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CloudRain className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-manrope font-semibold text-base text-foreground">Rainfall Forecast</h3>
          </div>
          <p className="font-manrope font-bold text-4xl text-foreground mb-1">
            {riskData?.rainfall_forecast_mm?.toFixed(2)}mm
          </p>
          <p className="text-sm text-muted-foreground">Expected in 48 hours</p>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Peak WFPS</span>
              <span className="font-semibold text-danger">{riskData?.peak_wfps_predicted?.toFixed(2)}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 48-Hour Forecast Chart */}
      <Card data-testid="forecast-timeline-chart" className="p-6">
        <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">
          48-Hour Waterlogging Forecast
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={generate48HourForecast()}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" opacity={0.5} />
            <XAxis dataKey="hour" stroke="hsl(var(--chart-axis))" style={{ fontSize: "12px" }} />
            <YAxis yAxisId="left" stroke="hsl(var(--chart-axis))" style={{ fontSize: "12px" }} label={{ value: 'WFPS (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--chart-axis))', style: { fontSize: '12px' } }} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-axis))" style={{ fontSize: "12px" }} label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight', fill: 'hsl(var(--chart-axis))', style: { fontSize: '12px' } }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <ReferenceLine yAxisId="left" y={90} stroke="#DC2626" strokeDasharray="3 3" label={{ value: "Critical (90%)", fill: "#DC2626", fontSize: 12 }} />
            
            {/* Vertical Reference Line for Predicted Event (Change 3) */}
            {riskData?.time_to_event_hours && (
              <ReferenceLine 
                x={`${Math.round(riskData.time_to_event_hours)}h`} 
                stroke={riskData.risk_level === "HIGH" || riskData.risk_level === "CRITICAL" ? "#DC2626" : "#94A3B8"} 
                strokeDasharray="5 5"
                label={{ 
                  value: `T+${riskData.time_to_event_hours}h`, 
                  fill: riskData.risk_level === "HIGH" || riskData.risk_level === "CRITICAL" ? "#DC2626" : "#94A3B8",
                  fontSize: 12,
                  position: 'top'
                }} 
              />
            )}

            <Line yAxisId="left" type="monotone" dataKey="wfps" stroke="#0284C7" strokeWidth={3} name="WFPS" dot={{ fill: "#0284C7", r: 4 }} />
            <Bar yAxisId="right" dataKey="rainfall" fill="#1A4D2E" name="Rainfall" opacity={0.6} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-danger/5 dark:bg-danger/10 rounded-lg border border-danger/20 dark:border-danger/40">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Critical Alert:</span> {riskData?.cause}. WFPS is expected to reach {riskData?.peak_wfps_predicted?.toFixed(2)}%, exceeding the critical threshold of 90%.
          </p>
        </div>
      </Card>

      {/* Step 5 — 48-Hour Rainfall Forecast Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-manrope font-semibold text-lg text-foreground flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-primary" />
            48-Hour Rainfall Forecast (Open-Meteo)
          </h3>
        </div>

        {riskData?.rain_next_6h_mm > 5 && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg flex items-center gap-3 text-orange-800 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-bold">
              ⚠️ Rain expected within 6 hours — {riskData.rain_next_6h_mm}mm forecast
            </p>
          </div>
        )}

        <div className="h-[300px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskData?.hourly_forecast || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                tickFormatter={(val) => new Date(val).getHours() + ":00"}
                stroke="hsl(var(--chart-axis))"
                style={{ fontSize: "10px" }}
              />
              <YAxis 
                stroke="hsl(var(--chart-axis))"
                style={{ fontSize: "10px" }}
                label={{ value: 'Rain (mm)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--chart-axis))' }}
              />
              <Tooltip 
                labelFormatter={(val) => new Date(val).toLocaleString()}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              />
              <Bar dataKey="rain" name="Rainfall">
                {
                  (riskData?.hourly_forecast || []).map((entry, index) => {
                    let color = "#3b82f6"; // standard blue
                    if (entry.rain > 15) color = "#ef4444"; // red
                    else if (entry.rain > 5) color = "#f59e0b"; // orange
                    return <rect key={`cell-${index}`} fill={color} />;
                  })
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Next 6h</p>
            <p className="text-xl font-bold">{riskData?.rain_next_6h_mm?.toFixed(1)}mm</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Next 24h</p>
            <p className="text-xl font-bold">{riskData?.rain_next_24h_mm?.toFixed(1)}mm</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Next 48h</p>
            <p className="text-xl font-bold">{riskData?.rainfall_forecast_mm?.toFixed(1)}mm</p>
          </div>
        </div>
      </Card>

      {/* Action Checklist */}
      <Card data-testid="action-checklist" className="p-6">
        <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">
          Recommended Actions
        </h3>
        <div className="space-y-3">
          {riskData?.actions && riskData.actions.length > 0 ? (
            riskData.actions.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{action}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success/5 border border-success/20">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <p className="text-sm text-foreground">No immediate actions required. Conditions are within safe limits.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Why This Matters */}
      <Card data-testid="waterlogging-info" className="p-6 bg-gradient-to-br from-muted/30 to-transparent">
        <h3 className="font-manrope font-semibold text-lg mb-3 text-foreground">
          Why Waterlogging Prevention is Critical
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground">Impact on Crops</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Root damage begins within 4-6 hours of saturation</li>
              <li>Oxygen deprivation causes permanent root death</li>
              <li>Nutrient uptake severely reduced</li>
              <li>Increased susceptibility to diseases</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground">Economic Impact</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Potential crop loss: LKR {riskData?.potential_loss?.toLocaleString()}</li>
              <li>Recovery time: 7-14 days minimum</li>
              <li>Replanting costs if damage is severe</li>
              <li>Lost time in growth cycle</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WaterloggingMonitor;
