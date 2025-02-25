import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  combo: number;
}

export function ScoreDisplay({ score, combo }: ScoreDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-4xl font-bold">{score}</div>
        <div className={cn(
          "text-sm font-medium",
          combo > 1 && "text-green-500"
        )}>
          {combo > 1 ? `${combo}x Combo!` : 'No Combo'}
        </div>
      </CardContent>
    </Card>
  );
}
