import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Activity } from "lucide-react";

const AcidificationAnalysisCard = ({ analysis, currentPh }) => {
    if (!analysis) return null;

    const { rate, unit, cause, time_to_critical } = analysis;

    // Calculate percentage for progress bar (assuming 7.0 is start, 6.0 is critical end)
    // current 6.8 -> 20% progress into the danger zone 
    // (7.0 - 6.8) / (7.0 - 6.0) = 0.2
    const startPh = 7.0;
    const criticalPh = 6.0;
    const progress = Math.min(Math.max(((startPh - currentPh) / (startPh - criticalPh)) * 100, 0), 100);

    return (
        <Card className="h-full border-l-4 border-l-orange-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Gradual Acidification Detected
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Primary Cause</span>
                    <p className="font-medium text-foreground">{cause}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <span className="text-xs text-muted-foreground block mb-1">Drift Rate</span>
                        <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-red-500" />
                            <span className="font-bold text-red-600">{rate}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{unit}</span>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <span className="text-xs text-muted-foreground block mb-1">Impact Event</span>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-orange-500" />
                            <span className="font-bold text-foreground">Critical in 120d</span>
                        </div>
                        <span className="text-xs text-muted-foreground">reaches pH 6.0</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Safe (7.0)</span>
                        <span>Current ({currentPh})</span>
                        <span>Critical (6.0)</span>
                    </div>
                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-orange-500"
                            style={{ width: '100%' }}
                        ></div>
                        {/* Indicator marker */}
                        <div
                            className="absolute top-0 h-full w-1 bg-black"
                            style={{ left: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">{time_to_critical}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default AcidificationAnalysisCard;
