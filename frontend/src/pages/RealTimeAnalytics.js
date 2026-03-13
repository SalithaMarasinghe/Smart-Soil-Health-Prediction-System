import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { Activity, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import SoilSensorCard from "../components/analytics/SoilSensorCard";
import AirDataCard from "../components/analytics/AirDataCard";
import AirQualityCard from "../components/analytics/AirQualityCard";

const RealTimeAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRealTimeData = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
      setError(null);
    }
    setIsRefreshing(true);
    try {
      const result = await apiService.getRealTimeAnalytics();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching real-time analytics:", err);
      const message = err.response?.data?.detail || "Failed to fetch real-time data from Firebase.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData(true);
    const interval = setInterval(() => fetchRealTimeData(), 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-manrope">Initializing Firebase connection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 rounded-full bg-destructive/10">
          <RefreshCw className="w-8 h-8 text-destructive" />
        </div>
        <div className="text-center max-w-md">
          <h3 className="text-xl font-bold text-foreground">Connection Failed</h3>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
        <button 
          onClick={() => fetchRealTimeData(true)}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-manrope font-bold text-3xl md:text-4xl text-foreground tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Real Time Analytics
          </h2>
          <p className="text-muted-foreground mt-1">Live data stream from Firebase Realtime Database</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <Clock className="w-4 h-4" />
            <span>Last Sync: {lastUpdated?.toLocaleTimeString()}</span>
          </div>
          <button 
            onClick={() => fetchRealTimeData(true)}
            className={`p-2 rounded-full hover:bg-muted transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
            title="Manual Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Soil Section */}
        <section className="space-y-4">
          <SoilSensorCard data={data?.soil} />
        </section>

        {/* Air & Quality Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-4">
            <AirDataCard data={data?.air} />
          </section>
          <section className="space-y-4">
            <AirQualityCard data={data?.air_quality} />
          </section>
        </div>
      </div>

      {/* Connection Status footer */}
      <div className="fixed bottom-20 right-8 md:bottom-8 z-40">
        <div className="bg-success/10 backdrop-blur-md border border-success/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          <span className="text-xs font-semibold text-success uppercase tracking-wider">Live Firebase Link Active</span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;
