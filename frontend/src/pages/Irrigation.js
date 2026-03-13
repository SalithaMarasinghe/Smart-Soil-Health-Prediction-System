import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import IrrigationStatusCard from "../components/irrigation/IrrigationStatusCard";
import PredictionChart from "../components/irrigation/PredictionChart";
import RecommendationCard from "../components/irrigation/RecommendationCard";
import HistoricalChart from "../components/irrigation/HistoricalChart";
import HistoryTable from "../components/irrigation/HistoryTable";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const IrrigationPage = () => {
    const [loading, setLoading] = useState(true);
    const [predictionData, setPredictionData] = useState(null);
    const [historyEvents, setHistoryEvents] = useState([]);
    const [moistureHistory, setMoistureHistory] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pred, history, moistHistory] = await Promise.all([
                apiService.getIrrigationPredictions(),
                apiService.getIrrigationHistory(30),
                apiService.getHistory("soil_moisture", 30)
            ]);

            setPredictionData(pred);
            setHistoryEvents(history.events || []);
            setMoistureHistory(moistHistory.data || []);
        } catch (error) {
            console.error("Failed to fetch irrigation data", error);
            toast.error("Failed to load irrigation data");
        } finally {
            setLoading(false);
        }
    };

    const handleIrrigationAction = async () => {
        try {
            toast.info("Scheduling irrigation...");
            await apiService.logIrrigation({
                volume_liters: 35000,
                // other calculated fields done by backend
            });
            toast.success("Irrigation scheduled successfully");
            // Refresh data
            fetchData();
        } catch (error) {
            toast.error("Failed to schedule irrigation");
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 pb-8">
            <h1 className="text-3xl font-bold font-manrope">Irrigation Intelligence</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Status - 1 col */}
                <div className="lg:col-span-1 h-[350px]">
                    <IrrigationStatusCard data={predictionData?.current_status} />
                </div>

                {/* Recommendation - 1 col */}
                <div className="lg:col-span-1 h-[350px]">
                    <RecommendationCard
                        recommendation={predictionData?.recommendation}
                        coordination={predictionData?.coordination}
                        onAction={handleIrrigationAction}
                    />
                </div>

                {/* Forecast Chart - 1 col */}
                <div className="lg:col-span-1 h-[350px]">
                    <PredictionChart
                        predictions={predictionData?.predictions}
                        trend={predictionData?.trend}
                        confidence={predictionData?.confidence}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Historical Chart - 2 cols */}
                <div className="lg:col-span-2 h-[400px]">
                    <HistoricalChart data={moistureHistory} />
                </div>

                {/* History Table - 1 col */}
                <div className="lg:col-span-1 h-[400px] overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        <HistoryTable events={historyEvents} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IrrigationPage;
