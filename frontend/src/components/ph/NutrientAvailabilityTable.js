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
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nutrient</TableHead>
                            <TableHead>Current (pH 6.8)</TableHead>
                            <TableHead>If pH drops to 5.5</TableHead>
                            <TableHead>Impact</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {nutrients.map(n => {
                            const currentVal = parseInt(currentStatus[n.key]);
                            const futureVal = parseInt(futureStatus[n.key]);
                            const drop = currentVal - futureVal;

                            let impact = "Minimal";
                            let rowClass = "";
                            if (drop > 30) { impact = "Critical"; rowClass = "bg-red-50"; }
                            else if (drop > 10) { impact = "Moderate"; rowClass = "bg-yellow-50"; }

                            return (
                                <TableRow key={n.key} className={rowClass}>
                                    <TableCell className="font-medium">{n.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {currentStatus[n.key]} <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {futureStatus[n.key]}
                                            {drop > 30 && <AlertCircle className="h-3 w-3 text-red-500" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-foreground">
                                        {impact}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-md flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{availability.if_pH_drops_to_5_5.warning}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default NutrientAvailabilityTable;
