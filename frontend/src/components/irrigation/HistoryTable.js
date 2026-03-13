import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Droplet } from "lucide-react";

const HistoryTable = ({ events }) => {
    if (!events || events.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle>Irrigation History</CardTitle></CardHeader>
                <CardContent><div className="text-center py-4 text-muted-foreground">No irrigation events recorded.</div></CardContent>
            </Card>
        )
    }

    const totalSavings = events.reduce((acc, curr) => acc + (curr.cost ? 0 : 0), 0) + 480 * events.length; // Mock savings calc

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Irrigation Log</span>
                    <span className="text-sm font-normal text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        Est. Season Savings: LKR {3200}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Volume (L)</TableHead>
                            <TableHead>Moisture Before</TableHead>
                            <TableHead>Moisture After</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.map((event) => (
                            <TableRow key={event.id}>
                                <TableCell className="font-medium">
                                    {new Date(event.date).toLocaleDateString()}
                                    <div className="text-xs text-muted-foreground">{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Droplet className="h-3 w-3 text-blue-500" />
                                        {event.volume_liters.toLocaleString()}
                                    </div>
                                </TableCell>
                                <TableCell>{event.moisture_before}%</TableCell>
                                <TableCell>{event.moisture_after}%</TableCell>
                                <TableCell className="text-right">LKR {event.cost}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default HistoryTable;
