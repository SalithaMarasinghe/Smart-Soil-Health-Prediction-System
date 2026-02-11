import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Droplet, ArrowRight, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";

const IrrigationOverviewCard = ({ data }) => {
    // If no data passed, we might want to return loading state or null, 
    // but let's assume parent handles loading for the dashboard.
    if (!data) return (
        <Card className="h-full border-l-4 border-l-gray-300">
            <CardContent className="pt-6">Loading irrigation data...</CardContent>
        </Card>
    );

    const { current_status, prediction_7d, next_action } = data;

    const isActionNeeded = next_action.includes("Irrigate");

    return (
        <Card className="h-full border-l-4 border-l-blue-500 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Irrigation Status</CardTitle>
                <Droplet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {current_status}%
                            {current_status >= 40 && current_status <= 60 ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Current Moisture</p>
                    </div>

                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end text-sm text-muted-foreground">
                            <TrendingDown className="h-3 w-3" />
                            <span>7d Forecast</span>
                        </div>
                        <div className={`font-semibold ${prediction_7d < 30 ? "text-red-500" : "text-foreground"}`}>
                            {prediction_7d}%
                        </div>
                    </div>
                </div>

                <div className={`p-2 rounded-md text-sm font-medium flex items-center gap-2 mb-4 ${isActionNeeded ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                    {isActionNeeded ? <Droplet className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    {next_action}
                </div>

                <Link to="/irrigation" className="flex items-center text-sm text-primary hover:underline">
                    View Details <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            </CardContent>
        </Card>
    );
};

export default IrrigationOverviewCard;
