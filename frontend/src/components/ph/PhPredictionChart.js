import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, ReferenceArea } from "recharts";

const PhPredictionChart = ({ history, predictions }) => {
    if (!history || !predictions) return null;

    // Combine history and predictions
    // Predictions object is {7d: val, 30d: val, 90d: val}
    // We need to project these into the future based on today

    const today = new Date();

    const futureData = [
        { timestamp: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), pH: predictions["7d"], type: "prediction" },
        { timestamp: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), pH: predictions["30d"], type: "prediction" },
        { timestamp: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(), pH: predictions["90d"], type: "prediction" }
    ];

    const chartData = [...history, ...futureData];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>pH Prediction Timeline (90 Days)</CardTitle>
                <CardDescription>Historical trends and future acidification forecast</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                minTickGap={30}
                            />
                            <YAxis domain={[5.5, 7.5]} padding={{ top: 20, bottom: 20 }} />
                            <Tooltip
                                labelFormatter={(t) => new Date(t).toLocaleDateString()}
                                contentStyle={{ borderRadius: '8px' }}
                            />

                            {/* Zones */}
                            <ReferenceArea y1={6.0} y2={7.0} fill="#22c55e" fillOpacity={0.1} label="Optimal" />
                            <ReferenceLine y={6.0} stroke="red" strokeDasharray="3 3" label="Critical Threshold" />

                            <Line
                                type="monotone"
                                dataKey="pH"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={(props) => {
                                    const { cx, cy, payload } = props;
                                    if (payload.event_type) {
                                        return <circle cx={cx} cy={cy} r={5} fill="#f97316" stroke="white" strokeWidth={2} />;
                                    }
                                    if (payload.type === "prediction") {
                                        return <circle cx={cx} cy={cy} r={4} fill="#9333ea" stroke="none" />;
                                    }
                                    return null;
                                }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default PhPredictionChart;
