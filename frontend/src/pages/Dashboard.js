import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { CheckCircle, AlertTriangle, AlertCircle, Cloud, Clock } from "lucide-react";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import { format } from "date-fns";

import IrrigationOverviewCard from "../components/dashboard/IrrigationOverviewCard";
import PhOverviewCard from "../components/dashboard/PhOverviewCard";

const Dashboard = () => {
  const [status, setStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [irrigationData, setIrrigationData] = useState(null);
  const [phData, setPhData] = useState(null);
  const [waterloggingData, setWaterloggingData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const [statusData, alertsData, irrigationRes, phRes] = await Promise.all([
        apiService.getStatus(),
        apiService.getAlerts(),
        apiService.getIrrigationPredictions(),
        apiService.getPhPredictions(),
      ]);
      setStatus(statusData);
      setAlerts(alertsData.alerts);
      setIrrigationData({
        current_status: statusData.soil_moisture, // Use real-time moisture
        prediction_7d: irrigationRes.predictions["7d"],
        next_action: irrigationRes.recommendation.action === "irrigate" ? "Irrigate within 24h" : "No irrigation needed"
      });
      setPhData({
        current_status: phRes.current_status.pH,
        prediction_30d: phRes.predictions["30d"],
        trend: phRes.current_status.trend
      });

      // Change 1 — Add a waterlogging fetch to the main dashboard
      try {
        const wlRes = await apiService.getWaterloggingRisk();
        setWaterloggingData(wlRes);
      } catch (e) {
        console.error("Waterlogging fetch failed:", e);
      }

      // Fetch history for WFPS trend chart (Change 3)
      try {
        const histRes = await apiService.getHistory("soil_moisture", 3);
        setHistoryData(histRes.data);
      } catch (e) {
        console.error("History fetch failed:", e);
      }

      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    if (status === "adequate") return <CheckCircle className="w-5 h-5 text-success" />;
    return <AlertTriangle className="w-5 h-5 text-warning" />;
  };

  const getRiskColor = (risk) => {
    if (risk === "high") return "danger";
    if (risk === "medium") return "warning";
    return "success";
  };

  const getRiskBorderColor = (risk) => {
    if (risk === "high" || risk === "critical") return "border-t-danger";
    if (risk === "medium") return "border-t-warning";
    return "border-t-success";
  };

  const getMlRiskStyles = (riskClass) => {
    switch (riskClass?.toLowerCase()) {
      case 'critical':
        return "border-danger bg-danger/5 animate-pulse";
      case 'high':
        return "border-orange-500 bg-orange-500/5";
      case 'medium':
        return "border-amber-500 bg-amber-500/5";
      case 'low':
        return "border-blue-500 bg-blue-500/5";
      case 'safe':
        return "border-success bg-success/5";
      default:
        return "border-border";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Last Updated */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-manrope font-bold text-3xl md:text-4xl text-foreground tracking-tight">
              Dashboard
            </h2>
            <p className="text-muted-foreground mt-1">Real-time soil health monitoring</p>
          </div>
          {/* Change 4 — Update the dashboard page title or header status chip */}
          {waterloggingData && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getMlRiskStyles(waterloggingData.ml_risk_class)}`}>
              {waterloggingData.ml_risk_class}
            </div>
          )}
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Main Grid — Change 2 — Add a Waterlogging Forecast Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {/* NPK Status Card — Fix 2 — Format NPK values */}
        <Card
          data-testid="npk-status-card"
          className={`p-6 border-t-4 min-w-0 overflow-hidden ${status?.npk_status?.nitrogen === "adequate" &&
            status?.npk_status?.phosphorus === "adequate" &&
            status?.npk_status?.potassium === "adequate"
            ? "border-t-success"
            : "border-t-warning"} hover:shadow-md`}
        >
          <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground truncate">Current NPK Levels</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status?.npk_status?.nitrogen)}
                <span className="text-sm font-medium">Nitrogen (N)</span>
              </div>
              <span className="font-manrope font-bold text-lg">{status?.nitrogen?.toFixed(1)} <span className="text-xs text-muted-foreground">mg/kg</span></span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status?.npk_status?.phosphorus)}
                <span className="text-sm font-medium">Phosphorus (P)</span>
              </div>
              <span className="font-manrope font-bold text-lg">{status?.phosphorus?.toFixed(1)} <span className="text-xs text-muted-foreground">mg/kg</span></span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status?.npk_status?.potassium)}
                <span className="text-sm font-medium">Potassium (K)</span>
              </div>
              <span className="font-manrope font-bold text-lg">{status?.potassium?.toFixed(1)} <span className="text-xs text-muted-foreground">mg/kg</span></span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">All nutrients at optimal levels</p>
        </Card>

        {/* Change 2 — Waterlogging Forecast KPI Card — Fix 3 — Layout issues */}
        <Card
          data-testid="ml-forecast-card"
          className={`p-6 border-t-4 transition-all duration-300 min-w-0 overflow-hidden ${waterloggingData?.ml_alert_active ? "border-danger ring-2 ring-danger animate-pulse" : getMlRiskStyles(waterloggingData?.ml_risk_class)}`}
        >
          <h3 className="font-manrope font-semibold text-lg mb-2 text-foreground flex items-center gap-2 truncate">
            <Cloud className="w-4 h-4 text-primary" />
            Forecast
          </h3>
          <div className="flex flex-col items-center justify-center py-2">
            <p className="font-manrope font-bold text-4xl text-foreground">
              {waterloggingData?.ml_hours_until_waterlogging?.toFixed(1) ?? '--'}
              <span className="text-sm font-medium text-muted-foreground ml-1">hrs</span>
            </p>
            <p className={`font-manrope font-bold text-lg uppercase mt-1 truncate ${getRiskColor(waterloggingData?.ml_risk_class?.toLowerCase()) === 'danger' ? 'text-danger' : ''}`}>
              {waterloggingData?.ml_risk_class ?? 'Loading...'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Confidence: {((waterloggingData?.ml_confidence ?? 0) * 100).toFixed(0)}%
            </p>
          </div>
          {waterloggingData?.ml_alert_active && (
            <div className="flex items-center gap-2 justify-center mt-2">
              <div className="w-2 h-2 rounded-full bg-danger animate-ping"></div>
              <span className="text-[10px] font-bold text-danger uppercase tracking-tighter">Active Prediction Alert</span>
            </div>
          )}
        </Card>

        {/* Irrigation Overview Card */}
        <IrrigationOverviewCard data={irrigationData} />

        {/* pH Overview Card */}
        <PhOverviewCard data={phData} />

        {/* Waterlogging Risk Card — Fix 4 — Sync with ML risk class */}
        <Card
          data-testid="waterlogging-risk-card"
          className={`p-6 border-t-4 min-w-0 overflow-hidden ${getRiskBorderColor(waterloggingData?.ml_risk_class?.toLowerCase())} hover:shadow-md transition-shadow duration-200`}
        >
          <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground truncate">Current Status</h3>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-3 ${getRiskColor(waterloggingData?.ml_risk_class?.toLowerCase()) === "danger" ? "bg-danger/10" :
                getRiskColor(waterloggingData?.ml_risk_class?.toLowerCase()) === "warning" ? "bg-warning/10" : "bg-success/10"
                }`}>
                <Cloud className={`w-10 h-10 ${getRiskColor(waterloggingData?.ml_risk_class?.toLowerCase()) === "danger" ? "text-danger" :
                  getRiskColor(waterloggingData?.ml_risk_class?.toLowerCase()) === "warning" ? "text-warning" : "text-success"
                  }`} strokeWidth={1.5} />
              </div>
              <p className={`font-manrope font-bold text-2xl uppercase mb-2 ${getRiskColor(waterloggingData?.ml_risk_class?.toLowerCase()) === "danger" ? "text-danger" :
                getRiskColor(waterloggingData?.ml_risk_class?.toLowerCase()) === "warning" ? "text-warning" : "text-success"
                }`}>
                {waterloggingData?.ml_risk_class ?? status?.waterlogging_risk}
              </p>
              <p className="text-sm text-muted-foreground">WFPS: {status?.wfps?.toFixed(1)}%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Heavy rain expected in 48 hours</p>
        </Card>

        {/* Active Alerts Card */}
        <Card
          data-testid="active-alerts-card"
          className={`p-6 border-t-4 ${alerts.some(a => a.severity === "high") ? "border-t-danger" : "border-t-warning"} hover:shadow-md transition-shadow duration-200`}
        >
          <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">Active Alerts</h3>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${alert.severity === "high" ? "text-danger" : "text-warning"
                    }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Weather Forecast Card */}
        <Card
          data-testid="weather-forecast-card"
          className="p-6 border-t-4 border-t-info hover:shadow-md transition-shadow duration-200"
        >
          <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">Weather Forecast</h3>
          <div className="space-y-4">
            <div className="text-center py-4">
              <Cloud className="w-12 h-12 text-info mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-manrope font-bold text-3xl text-foreground mb-1">
                {waterloggingData ? `${waterloggingData.rainfall_forecast_mm.toFixed(1)}mm` : '--'}
              </p>
              <p className="text-sm text-muted-foreground">Expected rainfall (48h)</p>
            </div>
            <div className="pt-4 border-t border-border mt-3">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">Temperature</span>
                <span className="font-semibold">{status?.air_temp?.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Humidity</span>
                <span className="font-semibold">{status?.humidity}%</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Next 48 hours forecast</p>
        </Card>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
          <h4 className="font-manrope font-semibold text-base mb-3 text-foreground">Soil Conditions</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Moisture</span>
              <span className="font-semibold">{status?.soil_moisture}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">pH Level</span>
              <span className="font-semibold">{status?.pH}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Temperature</span>
              <span className="font-semibold">{status?.soil_temp}°C</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">EC</span>
              <span className="font-semibold">{status?.ec} dS/m</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-primary/5 dark:from-primary/10 to-transparent">
          <h4 className="font-manrope font-semibold text-base mb-3 text-foreground">System Performance</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sensor Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success dark:text-green-400">
                <div className="w-2 h-2 rounded-full bg-success dark:bg-green-400"></div>
                Online
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data Quality</span>
              <span className="font-semibold text-success dark:text-green-400">Excellent</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Sync</span>
              <span className="font-semibold">Just now</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-success/5 dark:from-success/10 to-transparent">
          <h4 className="font-manrope font-semibold text-base mb-3 text-foreground">Farm Profile</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Crop</span>
              <span className="font-semibold">Tomatoes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Field Size</span>
              <span className="font-semibold">1 hectare</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Days After Planting</span>
              <span className="font-semibold">25 days</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Change 3 — Add a WFPS Trend Chart with Forecast Marker */}
      <Card className="p-6">
        <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">Soil Moisture & WFPS Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" opacity={0.5} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(val) => format(new Date(val), "HH:mm")}
                stroke="hsl(var(--chart-axis))"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="hsl(var(--chart-axis))"
                style={{ fontSize: "12px" }}
                label={{ value: '%', angle: -90, position: 'insideLeft', fill: 'hsl(var(--chart-axis))' }}
              />
              <Tooltip
                labelFormatter={(val) => format(new Date(val), "MMM dd, HH:mm")}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              />
              <Legend />
              {/* Vertical Reference Line for Predicted Event */}
              {waterloggingData?.ml_hours_until_waterlogging && (
                <ReferenceLine
                  x={new Date(Date.now() + (waterloggingData.ml_hours_until_waterlogging) * 3600000).toISOString()}
                  stroke={waterloggingData.ml_alert_active ? "#DC2626" : "#94A3B8"}
                  strokeDasharray="5 5"
                  label={{
                    value: `Predicted Event (T+${waterloggingData.ml_hours_until_waterlogging.toFixed(1)}h)`,
                    fill: waterloggingData.ml_alert_active ? "#DC2626" : "#94A3B8",
                    fontSize: 10,
                    position: 'top'
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                name="Soil Moisture (%)"
                stroke="#0284C7"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Change 5 — Add a "Model Info" footer line */}
      <div className="flex justify-between items-center px-2 py-4 border-t border-border mt-6">
        <p className="text-xs text-muted-foreground italic">
          ML Source: {waterloggingData?.ml_source ?? 'rf_classifier + xgb_regressor'} | Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Proprietary Prediction Engine v2.1
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
