import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  combo: number;
  potentialPoints?: number;
  multiplierText?: string;
}

export function ScoreDisplay({
  score,
  combo,
  potentialPoints = 0,
  multiplierText = "",
}: ScoreDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-4xl font-bold">{score}</div>

        {/* Current Combo */}
        <div
          className={cn("text-sm font-medium", combo > 1 && "text-green-500")}
        >
          {combo > 1 ? `${combo}x Combo!` : "No Combo"}
        </div>

        {/* Potential Points */}
        {potentialPoints > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">Potential points:</div>
            <div className="text-2xl font-bold text-green-600">
              +{potentialPoints}
            </div>
            {multiplierText && (
              <div className="text-xs text-gray-500">
                Multipliers: {multiplierText}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
