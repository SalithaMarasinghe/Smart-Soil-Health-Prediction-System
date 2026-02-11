import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../services/api";
import { TrendingDown, AlertCircle, Calendar, Package, Beaker, ArrowRight } from "lucide-react";
import { Card } from "../components/ui/card";
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

      {/* Recommendation Alert */}
      {predictions?.recommendation?.action === "fertilize" && (
        <Card
          data-testid="fertilization-alert"
          className="p-6 border-l-4 border-l-warning bg-warning/5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-manrope font-bold text-xl text-foreground mb-2">
                Action Required: {predictions.recommendation.timing}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {predictions.recommendation.reason}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Fertilizer Type</p>
                  <p className="font-semibold text-foreground">{predictions.recommendation.fertilizer_type}</p>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Amount Needed</p>
                  <p className="font-semibold text-foreground">{predictions.recommendation.amount_kg} kg</p>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Cost Savings</p>
                  <p className="font-semibold text-success">LKR {predictions.recommendation.cost_savings}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* pH Coordination Alert */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
        <Beaker className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-orange-800 text-sm">⚠️ pH Impact Alert</h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
            <p className="text-sm text-orange-700">Urea will acidify soil (-0.025 pH/week). Consider alternatives.</p>
            <Link to="/ph-management" className="text-sm font-medium text-orange-900 underline hover:text-orange-950 flex items-center gap-1">
              View pH predictions <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Current Levels */}
      <Card data-testid="current-npk-levels" className="p-6">
        <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">Current Nutrient Levels</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-primary/5">
            <p className="text-sm text-muted-foreground mb-2">Nitrogen (N)</p>
            <p className="font-manrope font-bold text-3xl text-primary mb-1">
              {predictions?.current?.N}
            </p>
            <p className="text-xs text-muted-foreground">mg/kg</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-warning/5">
            <p className="text-sm text-muted-foreground mb-2">Phosphorus (P)</p>
            <p className="font-manrope font-bold text-3xl text-warning mb-1">
              {predictions?.current?.P}
            </p>
            <p className="text-xs text-muted-foreground">mg/kg</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-info/5">
            <p className="text-sm text-muted-foreground mb-2">Potassium (K)</p>
            <p className="font-manrope font-bold text-3xl text-info mb-1">
              {predictions?.current?.K}
            </p>
            <p className="text-xs text-muted-foreground">mg/kg</p>
          </div>
        </div>
      </Card>

      {/* Historical Trends Chart */}
      <Card data-testid="historical-trends-chart" className="p-6">
        <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">
          Historical NPK Trends (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formatHistoricalChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" opacity={0.5} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => format(new Date(value), "MMM dd")}
              stroke="#57534E"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#57534E" style={{ fontSize: "12px" }} label={{ value: 'mg/kg', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <Area type="monotone" dataKey="N" stroke="#1A4D2E" fill="#1A4D2E" fillOpacity={0.2} name="Nitrogen" />
            <Area type="monotone" dataKey="P" stroke="#D97706" fill="#D97706" fillOpacity={0.2} name="Phosphorus" />
            <Area type="monotone" dataKey="K" stroke="#0284C7" fill="#0284C7" fillOpacity={0.2} name="Potassium" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Prediction Chart */}
      <Card data-testid="npk-predictions-chart" className="p-6">
        <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground">
          14-Day NPK Forecast
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formatPredictionChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" opacity={0.5} />
            <XAxis dataKey="day" stroke="#57534E" style={{ fontSize: "12px" }} />
            <YAxis stroke="#57534E" style={{ fontSize: "12px" }} label={{ value: 'mg/kg', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <ReferenceLine y={150} stroke="#DC2626" strokeDasharray="3 3" label="N Threshold" />
            <ReferenceLine y={30} stroke="#DC2626" strokeDasharray="3 3" label="P Threshold" />
            <ReferenceLine y={200} stroke="#DC2626" strokeDasharray="3 3" label="K Threshold" />
            <Line type="monotone" dataKey="N" stroke="#1A4D2E" strokeWidth={3} name="Nitrogen" dot={{ fill: "#1A4D2E", r: 5 }} />
            <Line type="monotone" dataKey="P" stroke="#D97706" strokeWidth={3} name="Phosphorus" dot={{ fill: "#D97706", r: 5 }} />
            <Line type="monotone" dataKey="K" stroke="#0284C7" strokeWidth={3} name="Potassium" dot={{ fill: "#0284C7", r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Critical Thresholds:</span> Nitrogen: 150 mg/kg | Phosphorus: 30 mg/kg | Potassium: 200 mg/kg
          </p>
        </div>
      </Card>

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
