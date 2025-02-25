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
    <Card className="w-full">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex flex-col">
          <div className="font-bold text-lg">Score</div>
          <div className="text-3xl font-bold">{score}</div>
        </div>

        {/* Current Combo */}
        <div
          className={cn("text-lg font-medium", combo > 1 && "text-green-500")}
        >
          {combo > 1 ? `${combo}x Combo!` : "No Combo"}
        </div>

        {/* Potential Points */}
        {potentialPoints > 0 && (
          <div className="flex flex-col items-end">
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
