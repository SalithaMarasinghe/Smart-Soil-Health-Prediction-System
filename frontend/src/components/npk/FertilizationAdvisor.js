import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CheckCircle2, TrendingDown, Clock, Banknote, ShieldAlert } from 'lucide-react';

const FertilizationAdvisor = ({ recommendation }) => {
  if (!recommendation) return null;

  const { action, timing, fertilizer_type, amount_kg, reason, cost_savings } = recommendation;
  const isFertilize = action === 'fertilize';

  return (
    <Card className={`overflow-hidden border-l-4 transition-all duration-300 ${isFertilize ? 'border-l-warning' : 'border-l-success'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isFertilize ? (
            <AlertCircle className="h-5 w-5 text-warning" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-success" />
          )}
          {isFertilize ? 'Fertilization Recommended' : 'Nutrient Balance Stable'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-3 rounded-lg text-sm ${isFertilize ? 'bg-warning/10 text-orange-800 dark:text-orange-200' : 'bg-success/10 text-green-800 dark:text-green-200'}`}>
          <p className="font-medium">{reason}</p>
        </div>

        {isFertilize && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Recommended Timing</p>
                  <p className="text-sm font-semibold">{timing}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Fertilizer Type</p>
                  <p className="text-sm font-semibold">{fertilizer_type}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <TrendingDown className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Amount (per Hectare)</p>
                  <p className="text-sm font-semibold">{amount_kg} kg</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Banknote className="h-4 w-4 text-success mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Estimated Efficiency Savings</p>
                  <p className="text-sm font-semibold text-success">LKR {cost_savings.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isFertilize && (
          <p className="text-sm text-muted-foreground italic">
            Your soil nutrient levels are currently within the optimal window for the current crop cycle. Continue regular monitoring.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FertilizationAdvisor;
