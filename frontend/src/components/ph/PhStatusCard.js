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
                        {pH}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium mb-4 ${status === "optimal" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)} {status === "optimal" ? "✅" : "⚠️"}
                    </div>

                    <div className="w-full space-y-3">
                        <div className="flex justify-between items-center text-sm border-t pt-3">
                            <span className="text-muted-foreground">Trend</span>
                            <div className="flex items-center gap-1 font-medium">
                                {getTrendIcon(trend)}
                                <span className="capitalize">{trend.replace('_', ' ')}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t pt-3">
                            <span className="text-muted-foreground">Buffer Capacity</span>
                            <span className="font-medium text-right text-xs max-w-[150px]">{buffer_capacity}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PhStatusCard;
