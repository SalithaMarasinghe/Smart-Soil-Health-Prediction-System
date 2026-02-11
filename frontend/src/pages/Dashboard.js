import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { CheckCircle, AlertTriangle, AlertCircle, Cloud, Clock } from "lucide-react";
import { Card } from "../components/ui/card";
import { toast } from "sonner";

import IrrigationOverviewCard from "../components/dashboard/IrrigationOverviewCard";
import PhOverviewCard from "../components/dashboard/PhOverviewCard";

const Dashboard = () => {
  const [status, setStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [irrigationData, setIrrigationData] = useState(null);
  const [phData, setPhData] = useState(null);
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
    if (risk === "high") return "border-t-danger";
    if (risk === "medium") return "border-t-warning";
    return "border-t-success";
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
        <div>
          <h2 className="font-manrope font-bold text-3xl md:text-4xl text-foreground tracking-tight">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">Real-time soil health monitoring</p>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* NPK Status Card */}
        <Card
          data-testid="npk-status-card"
          className={`p-6 border-t-4 ${status?.npk_status?.nitrogen === "adequate" &&
            status?.npk_status?.phosphorus === "adequate" &&
            status?.npk_status?.potassium === "adequate"
            ? "border-t-success"
            : "border-t-warning"} hover:shadow-md transition-all duration-300`}
        >
          <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">Current NPK Levels</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status?.npk_status?.nitrogen)}
                <span className="text-sm font-medium">Nitrogen (N)</span>
              </div>
              <span className="font-manrope font-bold text-lg">{status?.nitrogen} <span className="text-xs text-muted-foreground">mg/kg</span></span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status?.npk_status?.phosphorus)}
                <span className="text-sm font-medium">Phosphorus (P)</span>
              </div>
              <span className="font-manrope font-bold text-lg">{status?.phosphorus} <span className="text-xs text-muted-foreground">mg/kg</span></span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status?.npk_status?.potassium)}
                <span className="text-sm font-medium">Potassium (K)</span>
              </div>
              <span className="font-manrope font-bold text-lg">{status?.potassium} <span className="text-xs text-muted-foreground">mg/kg</span></span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">All nutrients at optimal levels</p>
        </Card>

        {/* Irrigation Overview Card */}
        <IrrigationOverviewCard data={irrigationData} />

        {/* pH Overview Card */}
        <PhOverviewCard data={phData} />

        {/* Waterlogging Risk Card */}
        <Card
          data-testid="waterlogging-risk-card"
          className={`p-6 border-t-4 ${getRiskBorderColor(status?.waterlogging_risk)} hover:shadow-md transition-all duration-300`}
        >
          <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">Waterlogging Risk</h3>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-3 ${status?.waterlogging_risk === "high" ? "bg-danger/10" :
                status?.waterlogging_risk === "medium" ? "bg-warning/10" : "bg-success/10"
                }`}>
                <Cloud className={`w-10 h-10 ${status?.waterlogging_risk === "high" ? "text-danger" :
                  status?.waterlogging_risk === "medium" ? "text-warning" : "text-success"
                  }`} strokeWidth={1.5} />
              </div>
              <p className={`font-manrope font-bold text-2xl uppercase mb-2 ${status?.waterlogging_risk === "high" ? "text-danger" :
                status?.waterlogging_risk === "medium" ? "text-warning" : "text-success"
                }`}>
                {status?.waterlogging_risk}
              </p>
              <p className="text-sm text-muted-foreground">WFPS: {status?.wfps}%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Heavy rain expected in 48 hours</p>
        </Card>

        {/* Active Alerts Card */}
        <Card
          data-testid="active-alerts-card"
          className={`p-6 border-t-4 ${alerts.some(a => a.severity === "high") ? "border-t-danger" : "border-t-warning"} hover:shadow-md transition-all duration-300`}
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
          className="p-6 border-t-4 border-t-info hover:shadow-md transition-all duration-300"
        >
          <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">Weather Forecast</h3>
          <div className="space-y-4">
            <div className="text-center py-4">
              <Cloud className="w-12 h-12 text-info mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-manrope font-bold text-3xl text-foreground mb-1">25mm</p>
              <p className="text-sm text-muted-foreground">Expected rainfall</p>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Temperature</span>
                <span className="font-semibold">{status?.air_temp}°C</span>
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
        <Card className="p-6 hover:shadow-md transition-all duration-300">
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

        <Card className="p-6 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent">
          <h4 className="font-manrope font-semibold text-base mb-3 text-foreground">System Performance</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sensor Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                Online
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data Quality</span>
              <span className="font-semibold text-success">Excellent</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Sync</span>
              <span className="font-semibold">Just now</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-success/5 to-transparent">
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
    </div>
  );
};

export default Dashboard;
