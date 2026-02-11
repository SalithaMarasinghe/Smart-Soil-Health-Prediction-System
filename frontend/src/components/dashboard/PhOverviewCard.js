import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingDown, Beaker } from "lucide-react";

const PhOverviewCard = ({ data }) => {
    if (!data) return (
        <Card className="h-full border-l-4 border-l-gray-300">
            <CardContent className="pt-6">Loading pH data...</CardContent>
        </Card>
    );

    const { current_status, prediction_30d, trend } = data;
    const isOptimal = current_status >= 6.0 && current_status <= 7.0;

    return (
        <Card className={`h-full border-t-4 hover:shadow-md transition-all duration-300 ${isOptimal ? "border-t-green-500" : "border-t-orange-500"}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Soil pH Status</CardTitle>
                <Beaker className={`h-4 w-4 ${isOptimal ? "text-green-500" : "text-orange-500"}`} />
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className={`text-2xl font-bold flex items-center gap-2 ${isOptimal ? "text-green-600" : "text-orange-600"}`}>
                            {current_status}
                            <span className="text-sm font-normal text-muted-foreground">{isOptimal ? "✅" : "⚠️"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Current pH</p>
                    </div>

                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end text-sm text-yellow-600">
                            <TrendingDown className="h-3 w-3" />
                            <span>Decreasing</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            30d forecast: <span className="font-semibold text-foreground">{prediction_30d}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full h-2 bg-gradient-to-r from-red-400 via-green-400 to-blue-400 rounded-full mb-4 opacity-70 relative">
                    <div
                        className="absolute top-0 w-2 h-2 bg-black rounded-full -mt-0.5 border border-white"
                        style={{ left: `${((current_status - 4) / 6) * 100}%` }} // Approx mapping 4-10 scale
                    ></div>
                </div>

                <Link to="/ph-management" className="flex items-center text-sm text-primary hover:underline">
                    View Details <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            </CardContent>
        </Card>
    );
};

export default PhOverviewCard;
