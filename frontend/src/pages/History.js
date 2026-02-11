import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { Download, Calendar } from "lucide-react";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

const History = () => {
  const [selectedParameter, setSelectedParameter] = useState("nitrogen");
  const [selectedDays, setSelectedDays] = useState(7);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const parameters = [
    { value: "nitrogen", label: "Nitrogen (N)", unit: "mg/kg", color: "#1A4D2E" },
    { value: "phosphorus", label: "Phosphorus (P)", unit: "mg/kg", color: "#D97706" },
    { value: "potassium", label: "Potassium (K)", unit: "mg/kg", color: "#0284C7" },
    { value: "soil_moisture", label: "Soil Moisture", unit: "%", color: "#8B5E3C" },
    { value: "pH", label: "pH Level", unit: "pH", color: "#059669" },
    { value: "soil_temp", label: "Soil Temperature", unit: "°C", color: "#DC2626" },
    { value: "air_temp", label: "Air Temperature", unit: "°C", color: "#F59E0B" },
    { value: "humidity", label: "Humidity", unit: "%", color: "#0EA5E9" },
  ];

  const dayOptions = [
    { value: 1, label: "Last 24 hours" },
    { value: 3, label: "Last 3 days" },
    { value: 7, label: "Last 7 days" },
    { value: 14, label: "Last 14 days" },
    { value: 30, label: "Last 30 days" },
  ];

  useEffect(() => {
    fetchData();
  }, [selectedParameter, selectedDays]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getHistory(selectedParameter, selectedDays);
      setHistoryData(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to fetch historical data");
      setLoading(false);
    }
  };

  const getParameterInfo = () => {
    return parameters.find((p) => p.value === selectedParameter);
  };

  const formatChartData = () => {
    return historyData.map((item) => ({
      timestamp: item.timestamp,
      value: item.value,
    }));
  };

  const exportToCSV = () => {
    const paramInfo = getParameterInfo();
    const csv = [
      ["Timestamp", `${paramInfo.label} (${paramInfo.unit})`],
      ...historyData.map((item) => [
        format(new Date(item.timestamp), "yyyy-MM-dd HH:mm:ss"),
        item.value,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedParameter}_history_${selectedDays}days.csv`;
    a.click();
    toast.success("Data exported successfully");
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const paramInfo = getParameterInfo();
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-1">
            {format(new Date(label), "MMM dd, yyyy HH:mm")}
          </p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {paramInfo.label}: <span className="font-semibold">{payload[0].value?.toFixed(2)}</span> {paramInfo.unit}
          </p>
        </div>
      );
    }
    return null;
  };

  const calculateStats = () => {
    if (historyData.length === 0) return { min: 0, max: 0, avg: 0, latest: 0 };

    const values = historyData.map((d) => d.value);
    return {
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      latest: values[values.length - 1]?.toFixed(2),
    };
  };

  const stats = calculateStats();
  const paramInfo = getParameterInfo();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h2 className="font-manrope font-bold text-3xl md:text-4xl text-foreground tracking-tight">
          Historical Data
        </h2>
        <p className="text-muted-foreground mt-1">View and analyze sensor data trends</p>
      </div>

      {/* Filters */}
      <Card data-testid="history-filters" className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Select Parameter</label>
            <Select value={selectedParameter} onValueChange={setSelectedParameter}>
              <SelectTrigger data-testid="parameter-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {parameters.map((param) => (
                  <SelectItem key={param.value} value={param.value}>
                    {param.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Time Range</label>
            <Select value={selectedDays.toString()} onValueChange={(value) => setSelectedDays(Number(value))}>
              <SelectTrigger data-testid="days-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Current</p>
          <p className="font-manrope font-bold text-2xl text-primary">{stats.latest}</p>
          <p className="text-xs text-muted-foreground mt-1">{paramInfo?.unit}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Average</p>
          <p className="font-manrope font-bold text-2xl text-foreground">{stats.avg}</p>
          <p className="text-xs text-muted-foreground mt-1">{paramInfo?.unit}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Minimum</p>
          <p className="font-manrope font-bold text-2xl text-info">{stats.min}</p>
          <p className="text-xs text-muted-foreground mt-1">{paramInfo?.unit}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Maximum</p>
          <p className="font-manrope font-bold text-2xl text-warning">{stats.max}</p>
          <p className="text-xs text-muted-foreground mt-1">{paramInfo?.unit}</p>
        </Card>
      </div>

      {/* Chart */}
      <Card data-testid="history-chart" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-manrope font-semibold text-lg text-foreground">
            {paramInfo?.label} Trend
          </h3>
          <button
            onClick={exportToCSV}
            data-testid="export-csv-button"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={formatChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" opacity={0.5} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => format(new Date(value), selectedDays <= 1 ? "HH:mm" : "MMM dd")}
                stroke="#57534E"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#57534E"
                style={{ fontSize: "12px" }}
                label={{ value: paramInfo?.unit, angle: -90, position: "insideLeft" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={paramInfo?.color}
                strokeWidth={2}
                name={paramInfo?.label}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Data Table */}
      <Card data-testid="history-table" className="p-6">
        <h3 className="font-manrope font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Data Records
        </h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-card border-b border-border">
              <tr>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Timestamp</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">
                  {paramInfo?.label} ({paramInfo?.unit})
                </th>
              </tr>
            </thead>
            <tbody>
              {historyData.slice().reverse().map((item, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 text-sm">
                    {format(new Date(item.timestamp), "MMM dd, yyyy HH:mm:ss")}
                  </td>
                  <td className="py-3 px-2 text-sm text-right font-semibold">
                    {item.value?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Showing {historyData.length} records from the last {selectedDays} day{selectedDays > 1 ? "s" : ""}
        </p>
      </Card>
    </div>
  );
};

export default History;
