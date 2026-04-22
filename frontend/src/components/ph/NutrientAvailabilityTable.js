import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NutrientAvailabilityTable = ({ availability }) => {
    if (!availability) return null;

    const nutrients = [
        { name: "Nitrogen (N)", key: "nitrogen" },
        { name: "Phosphorus (P)", key: "phosphorus" },
        { name: "Potassium (K)", key: "potassium" }
    ];

    const currentStatus = availability.current_pH_6_8;
    const futureStatus = availability.if_pH_drops_to_5_5;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Nutrient Availability Impact
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                            <TooltipContent>
                                <p>Soil pH directly affects how well plants can absorb nutrients.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-bold">Nutrient</TableHead>
                            <TableHead className="text-center font-bold">Current (6.8)</TableHead>
                            <TableHead className="text-center font-bold">Risk (5.5)</TableHead>
                            <TableHead className="text-right font-bold">Lockout Risk</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {nutrients.map(n => {
                            const currentVal = parseInt(currentStatus[n.key]);
                            const futureVal = parseInt(futureStatus[n.key]);
                            const drop = currentVal - futureVal;

                            let impact = "Minimal";
                            let statusColor = "text-green-500";
                            let dotColor = "bg-green-500";
                            
                            if (drop > 30) { 
                                impact = "Critical"; 
                                statusColor = "text-red-500";
                                dotColor = "bg-red-500";
                            }
                            else if (drop > 10) { 
                                impact = "Moderate"; 
                                statusColor = "text-orange-500";
                                dotColor = "bg-orange-500";
                            }

                            return (
                                <TableRow key={n.key} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-semibold">{n.name}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-bold text-green-600 dark:text-green-400">{currentStatus[n.key]}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`font-bold ${drop > 10 ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'}`}>
                                            {futureStatus[n.key]}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={`text-xs font-bold uppercase tracking-tighter ${statusColor}`}>{impact}</span>
                                            <div className={`h-2 w-2 rounded-full ${dotColor} animate-pulse`} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 text-destructive dark:text-red-400 text-xs rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="font-medium leading-relaxed">{availability.if_pH_drops_to_5_5.warning}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default NutrientAvailabilityTable;
