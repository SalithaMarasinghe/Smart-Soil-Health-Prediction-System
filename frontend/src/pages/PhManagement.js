import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import PhStatusCard from "../components/ph/PhStatusCard";
import PhPredictionChart from "../components/ph/PhPredictionChart";
import AcidificationAnalysisCard from "../components/ph/AcidificationAnalysisCard";
import NutrientAvailabilityTable from "../components/ph/NutrientAvailabilityTable";
import PhRecommendationCard from "../components/ph/PhRecommendationCard";
import { toast } from "sonner";
import { Loader2, Beaker, AlertCircle, CheckCircle2 } from "lucide-react";

const PhManagement = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [phData, phHistory] = await Promise.all([
                apiService.getPhPredictions(),
                apiService.getPhHistory(90)
            ]);

            setData(phData);
            setHistory(phHistory.history || []);
        } catch (error) {
            console.error("Failed to fetch pH data", error);
            toast.error("Failed to load pH data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!data) return null;

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Beaker className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold font-manrope">pH Management</h1>
                    <p className="text-muted-foreground">Acidification monitoring and correction</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status - 1 col */}
                <div className="h-[350px]">
                    <PhStatusCard data={data.current_status} />
                </div>

                {/* Chart - 2 cols */}
                <div className="md:col-span-2 h-[350px]">
                    <PhPredictionChart history={history} predictions={data.predictions} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Analysis */}
                <div className="h-auto">
                    <AcidificationAnalysisCard analysis={data.drift_analysis} currentPh={data.current_status.pH} />
                </div>

                {/* Recommendations */}
                <div className="h-auto">
                    <PhRecommendationCard recommendations={data.recommendations} />
                </div>

                {/* Nutrients */}
                <div className="h-auto">
                    <NutrientAvailabilityTable availability={data.nutrient_availability} />
                </div>
            </div>

            {/* Coordination Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-warning/5 border border-warning/20 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-orange-800 dark:text-orange-200">NPK Impact</h4>
                        <p className="text-xs text-orange-700/80 dark:text-orange-300/80 mt-1 leading-relaxed">{data.coordination.alert_to_npk}</p>
                    </div>
                </div>
                <div className="bg-success/5 border border-success/20 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-green-800 dark:text-green-200">Irrigation Safety</h4>
                        <p className="text-xs text-green-700/80 dark:text-green-300/80 mt-1 leading-relaxed">{data.coordination.alert_to_irrigation}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper icon
const ActivityIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
)

export default PhManagement;
