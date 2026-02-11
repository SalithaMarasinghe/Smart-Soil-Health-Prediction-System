import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, CheckCircle2, AlertTriangle, Clock, Banknote } from "lucide-react";

const RecommendationCard = ({ recommendation, coordination, onAction }) => {
    if (!recommendation) return null;

    const { action, timing, reason, water_volume_per_m2, optimal_time, cost_traditional, cost_optimized, savings } = recommendation;
    const { waterlogging_safe, message: coordinationMessage } = coordination;

    const isActionNeeded = action === "irrigate";

    return (
        <Card className="h-full border-l-4 border-l-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {isActionNeeded ? (
                        <>
                            <Droplet className="h-5 w-5 text-blue-500 fill-blue-500" />
                            <span>Irrigation Required</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span>No Action Needed</span>
                        </>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm">{reason}</p>
                    {isActionNeeded && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Timeline: <span className="font-semibold text-foreground">{timing}</span>
                        </p>
                    )}
                </div>

                {isActionNeeded && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">Volume</span>
                                <p className="font-semibold">{water_volume_per_m2} L/m²</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">Optimal Time</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <p className="font-semibold text-sm">{optimal_time}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded-md p-3 space-y-2">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Banknote className="h-4 w-4 text-green-600" />
                                Cost Savings
                            </h4>
                            <div className="grid grid-cols-3 gap-2 text-sm text-center">
                                <div>
                                    <p className="text-xs text-muted-foreground">Traditional</p>
                                    <p>LKR {cost_traditional}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Optimized</p>
                                    <p className="font-bold text-green-600">LKR {cost_optimized}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Savings</p>
                                    <p className="font-bold text-green-600">LKR {savings}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-2 rounded flex items-center gap-2 text-sm ${waterlogging_safe ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {waterlogging_safe ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            <span>{coordinationMessage}</span>
                        </div>

                        <Button onClick={onAction} className="w-full" disabled={!waterlogging_safe}>
                            {waterlogging_safe ? "Schedule Irrigation" : "Irrigation Unsafe"}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default RecommendationCard;
