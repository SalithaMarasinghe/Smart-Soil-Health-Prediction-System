import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const IrrigationStatusCard = ({ data }) => {
    if (!data) return null;

    const { soil_moisture, status, range } = data;

    const getStatusColor = (status) => {
        switch (status) {
            case "optimal":
                return "text-green-500";
            case "low":
                return "text-yellow-500";
            case "high":
                return "text-red-500";
            default:
                return "text-gray-500";
        }
    };

    const getProgressColor = (value) => {
        if (value < 30) return "bg-red-500";
        if (value < 40) return "bg-yellow-500";
        if (value <= 60) return "bg-green-500";
        if (value <= 80) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Moisture</CardTitle>
                <Droplet className={`h-4 w-4 ${getStatusColor(status)}`} />
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        {/* Simple circular representation using standard CSS/SVG could go here, 
                 but using a large text display and a bar for now as per ShadCN/common patterns 
                 unless we strictly need a gauge chart library. 
                 Let's stick to a clean large number and a progress bar below it for simplicity and aesthetics.
             */}
                        <div className="text-center">
                            <span className={`text-4xl font-bold ${getStatusColor(status)}`}>
                                {soil_moisture}%
                            </span>
                            <p className="text-sm text-muted-foreground mt-1 capitalize">{status}</p>
                        </div>
                    </div>

                    <div className="w-full mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>Target: {range}</span>
                            <span>100%</span>
                        </div>
                        <Progress value={soil_moisture} className={`h-2`} indicatorClassName={getProgressColor(soil_moisture)} />
                    </div>

                    <div className="mt-4 text-xs text-muted-foreground text-center">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default IrrigationStatusCard;
