import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Legend } from "recharts";

const HistoricalChart = ({ data }) => {
    if (!data) return null;

    // Assuming data is array of objects with date, moisture, and irrigation volume
    // Since the mock API strictly returns irrigation events, we might need moisture history separate or 
    // we mock a combined dataset here for visualization if the API structure was strictly event-based.
    // The plan said "Line chart: Past 30 days moisture levels". 
    // For now I'll use the irrigation events to show bars and assume we have moisture data points.
    // Actually, I should probably fetch moisture history from the `getHistory` endpoint for this chart and overlay irrigation events.
    // But for the scope of "Irrigation Component", let's visualize what we receive or a mock structure if needed.
    // The server has `get_history(parameter="soil_moisture")`.
    // I will assume the parent component fetches this and passes it in `data.moisture` and `data.irrigation` or similar.
    // Or I can just make this component accept a combined array.

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>30-Day Moisture & Irrigation History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                            <YAxis yAxisId="left" domain={[0, 100]} tickFormatter={(v) => `${v}%`} label={{ value: 'Moisture', angle: -90, position: 'insideLeft' }} />
                            <YAxis yAxisId="right" orientation="right" label={{ value: 'Irrigation (L)', angle: 90, position: 'insideRight' }} />
                            <Tooltip labelFormatter={(t) => new Date(t).toLocaleDateString()} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="value" name="Soil Moisture" stroke="#2563eb" dot={false} strokeWidth={2} />
                            {/* 
                   If we had irrigation events in the same time series, we'd add a Bar here.
                   The current data props will essentially be the 30-day moisture history.
               */}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default HistoricalChart;
