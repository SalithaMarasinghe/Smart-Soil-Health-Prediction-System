import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

const PhStatusCard = ({ data }) => {
    if (!data) return null;

    const { pH, status, trend, buffer_capacity } = data;

    const getStatusColor = (ph) => {
        if (ph < 5.5) return "text-red-500";
        if (ph < 6.0) return "text-orange-500";
        if (ph <= 7.0) return "text-green-500";
        if (ph <= 7.5) return "text-yellow-500";
        return "text-orange-500";
    };

    const getTrendIcon = (t) => {
        if (t.includes("decreasing")) return <TrendingDown className="h-4 w-4 text-orange-500" />;
        if (t.includes("increasing")) return <TrendingUp className="h-4 w-4 text-blue-500" />;
        return <Minus className="h-4 w-4 text-gray-500" />;
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Current pH Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-2">
                    <div className={`text-5xl font-bold mb-2 ${getStatusColor(pH)}`}>
                        {pH?.toFixed(2)}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium mb-4 ${status === "optimal" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)} {status === "optimal" ? "✅" : "⚠️"}
                    </div>

                    <div className="w-full space-y-3">
                        {/* pH Spectrum Scale */}
                        <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-400 to-purple-600 mb-6">
                            <div 
                                className="absolute top-0 h-6 w-1 bg-foreground border-x border-background -mt-1 transition-all duration-1000 shadow-sm"
                                style={{ left: `${Math.min(Math.max(((pH - 4) / (9 - 4)) * 100, 0), 100)}%` }}
                            >
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-foreground"></div>
                            </div>
                            <div className="flex justify-between mt-5 text-[9px] text-muted-foreground font-bold px-1">
                                <span>4.0</span>
                                <span>5.0</span>
                                <span>6.0</span>
                                <span className="text-green-600 dark:text-green-400">7.0</span>
                                <span>8.0</span>
                                <span>9.0</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm border-t pt-3">
                            <span className="text-muted-foreground font-medium">Trend</span>
                            <div className="flex items-center gap-1 font-semibold">
                                {getTrendIcon(trend)}
                                <span className="capitalize">{trend.replace('_', ' ')}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t pt-3">
                            <span className="text-muted-foreground font-medium">Stability</span>
                            <span className="font-semibold text-right text-xs max-w-[150px]">{buffer_capacity}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PhStatusCard;
