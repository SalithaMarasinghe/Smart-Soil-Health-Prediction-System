import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../services/api";
import { TrendingDown, AlertCircle, Calendar, Package, Beaker, ArrowRight, ShieldAlert } from "lucide-react";
import { Card } from "../components/ui/card";
import NutrientGage from "../components/npk/NutrientGage";
import FertilizationAdvisor from "../components/npk/FertilizationAdvisor";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

const NPKManagement = () => {
  const [predictions, setPredictions] = useState(null);
  const [historicalData, setHistoricalData] = useState({ nitrogen: [], phosphorus: [], potassium: [] });
  const [fertilizationHistory, setFertilizationHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [predictionsData, nData, pData, kData, fertHistory] = await Promise.all([
        apiService.getNPKPredictions(),
        apiService.getHistory("nitrogen", 30),
        apiService.getHistory("phosphorus", 30),
        apiService.getHistory("potassium", 30),
        apiService.getFertilizationHistory(),
      ]);

      setPredictions(predictionsData);
      setHistoricalData({
        nitrogen: nData.data,
        phosphorus: pData.data,
        potassium: kData.data,
      });
      setFertilizationHistory(fertHistory.events);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching NPK data:", error);
      toast.error("Failed to fetch NPK data");
      setLoading(false);
    }
  };

  const formatHistoricalChartData = () => {
    const maxLength = Math.min(
      historicalData.nitrogen.length,
      historicalData.phosphorus.length,
      historicalData.potassium.length
    );

    const chartData = [];
    for (let i = 0; i < maxLength; i++) {
      chartData.push({
        timestamp: historicalData.nitrogen[i]?.timestamp,
        N: historicalData.nitrogen[i]?.value,
        P: historicalData.phosphorus[i]?.value,
        K: historicalData.potassium[i]?.value,
      });
    }

    return chartData;
  };

  const formatPredictionChartData = () => {
    if (!predictions) return [];

    return [
      {
        day: "Current",
        N: predictions.current.N,
        P: predictions.current.P,
        K: predictions.current.K,
      },
      {
        day: "Day 7",
        N: predictions["7_days"].N,
        P: predictions["7_days"].P,
        K: predictions["7_days"].K,
      },
      {
        day: "Day 14",
        N: predictions["14_days"].N,
        P: predictions["14_days"].P,
        K: predictions["14_days"].K,
      },
    ];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value?.toFixed(1)}</span> mg/kg
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
          <p className="text-muted-foreground">Loading NPK data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h2 className="font-manrope font-bold text-3xl md:text-4xl text-foreground tracking-tight">
          NPK Management
        </h2>
        <p className="text-muted-foreground mt-1">Nutrient forecasting and fertilization planning</p>
      </div>

      {/* Dynamic Recommendation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FertilizationAdvisor recommendation={predictions?.recommendation} />
        </div>
        
        {/* Quick Insights / Alert Coordination */}
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50 rounded-lg p-4 flex items-start gap-3">
            <Beaker className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">⚠️ pH Impact</h4>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Urea usage may drop pH by 0.03 units. Check pH trends before applying.</p>
              <Link to="/ph-management" className="text-xs font-bold text-orange-900 dark:text-orange-400 mt-2 flex items-center gap-1 hover:underline">
                PH MANAGEMENT <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50 rounded-lg p-4 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">Next Observation</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Satellite data sync expected in 4 hours.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nutrient Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NutrientGage 
          label="Nitrogen (N)" 
          value={predictions?.current?.N || 0} 
          unit="mg/kg" 
          optimalRange={{ min: 150, max: 250 }} 
          color="#1A4D2E"
        />
        <NutrientGage 
          label="Phosphorus (P)" 
          value={predictions?.current?.P || 0} 
          unit="mg/kg" 
          optimalRange={{ min: 30, max: 60 }} 
          color="#D97706"
        />
        <NutrientGage 
          label="Potassium (K)" 
          value={predictions?.current?.K || 0} 
          unit="mg/kg" 
          optimalRange={{ min: 200, max: 400 }} 
          color="#0284C7"
        />
      </div>

      {/* Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Trends Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-manrope font-semibold text-lg text-foreground">Historical Trends</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Last 30 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={formatHistoricalChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} opacity={0.3} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => format(new Date(value), "MMM dd")}
                stroke="hsl(var(--chart-axis))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="hsl(var(--chart-axis))" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '20px' }} />
              <Area type="monotone" dataKey="N" stroke="#1A4D2E" fill="#1A4D2E" fillOpacity={0.1} name="Nitrogen" />
              <Area type="monotone" dataKey="P" stroke="#D97706" fill="#D97706" fillOpacity={0.1} name="Phosphorus" />
              <Area type="monotone" dataKey="K" stroke="#0284C7" fill="#0284C7" fillOpacity={0.1} name="Potassium" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Prediction Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-manrope font-semibold text-lg text-foreground">Nutrient Depletion Forecast</h3>
            <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-1 rounded font-bold">14d Prediction</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={formatPredictionChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} opacity={0.3} />
              <XAxis dataKey="day" stroke="hsl(var(--chart-axis))" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--chart-axis))" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '20px' }} />
              <ReferenceLine y={150} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Crit', fill: '#ef4444', fontSize: 10 }} />
              <Line type="monotone" dataKey="N" stroke="#1A4D2E" strokeWidth={3} name="Nitrogen" dot={{ r: 4, fill: "#1A4D2E" }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="P" stroke="#D97706" strokeWidth={3} name="Phosphorus" dot={{ r: 4, fill: "#D97706" }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="K" stroke="#0284C7" strokeWidth={3} name="Potassium" dot={{ r: 4, fill: "#0284C7" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>


      {/* Fertilization History */}
      <Card data-testid="fertilization-history" className="p-6">
        <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
          <Package className="w-5 h-5" />
          Past Fertilization Events
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Fertilizer Type</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">Amount (kg)</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">Cost (₹)</th>
              </tr>
            </thead>
            <tbody>
              {fertilizationHistory.map((event) => (
                <tr key={event.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {format(new Date(event.date), "MMM dd, yyyy")}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-sm font-medium">{event.type}</td>
                  <td className="py-3 px-2 text-sm text-right font-semibold">{event.amount_kg}</td>
                  <td className="py-3 px-2 text-sm text-right font-semibold text-primary">LKR {event.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default NPKManagement;
