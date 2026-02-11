import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, ClipboardList, Beaker } from "lucide-react";

const PhRecommendationCard = ({ recommendations }) => {
    if (!recommendations) return null;

    const { short_term, medium_term, long_term } = recommendations;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Correction Recommendations
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="short">

                    {/* Short Term */}
                    <AccordionItem value="short">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <div>
                                    <span className="font-semibold block">Next 30 Days</span>
                                    <span className="text-xs text-muted-foreground font-normal">Monitor Only</span>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 space-y-2 text-sm text-muted-foreground">
                            <p>{short_term.description}</p>
                            <div className="bg-muted p-2 rounded text-xs px-3">
                                <span className="font-medium text-foreground">Action:</span> {short_term.frequency}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Medium Term */}
                    <AccordionItem value="medium">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <span className="font-semibold block">30-90 Days</span>
                                    <span className="text-xs text-muted-foreground font-normal">Prepare Lime</span>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 space-y-2 text-sm">
                            <p className="text-muted-foreground">{medium_term.description}</p>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="border p-2 rounded">
                                    <span className="text-xs text-muted-foreground block">Amount</span>
                                    <span className="font-medium">{medium_term.amount_kg} kg/ha</span>
                                </div>
                                <div className="border p-2 rounded">
                                    <span className="text-xs text-muted-foreground block">Cost</span>
                                    <span className="font-medium">LKR {medium_term.cost}</span>
                                </div>
                            </div>
                            <p className="text-xs text-green-600 mt-1">Expected Effect: {medium_term.effect}</p>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Long Term */}
                    <AccordionItem value="long">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <Beaker className="h-5 w-5 text-blue-500" />
                                <div>
                                    <span className="font-semibold block">Long Term</span>
                                    <span className="text-xs text-muted-foreground font-normal">Switch Fertilizer</span>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 space-y-2 text-sm">
                            <p className="text-muted-foreground">{long_term.description}</p>
                            <div className="bg-blue-50 p-2 rounded text-blue-800 text-xs">
                                {long_term.reason}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
            </CardContent>
        </Card>
    );
};

export default PhRecommendationCard;
