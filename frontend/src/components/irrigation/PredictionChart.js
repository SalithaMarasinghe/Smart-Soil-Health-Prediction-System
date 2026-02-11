import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Area, ComposedChart } from "recharts";

const PredictionChart = ({ predictions, trend, confidence }) => {
    if (!predictions) return null;

    // Transform predictions object to array for Recharts
    const data = [
        { name: "Now", value: predictions["1h"] }, // Approx, reusing 1h as 'now' start or close to it
        { name: "1h", value: predictions["1h"] },
        { name: "6h", value: predictions["6h"] },
        { name: "24h", value: predictions["24h"] },
        { name: "3d", value: predictions["3d"] },
        { name: "7d", value: predictions["7d"] },
    ];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>7-Day Moisture Forecast</CardTitle>
                <CardDescription>
                    Trend: <span className="font-medium capitalize text-foreground">{trend}</span> • Confidence: {confidence}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                            <Tooltip />

                            {/* Threshold Lines */}
                            <ReferenceLine y={60} label="Max Optimal" stroke="green" strokeDasharray="3 3" />
                            <ReferenceLine y={40} label="Min Optimal" stroke="green" strokeDasharray="3 3" />
                            <ReferenceLine y={30} label="Stress" stroke="red" strokeDasharray="3 3" />

                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default PredictionChart;
