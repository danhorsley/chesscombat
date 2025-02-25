import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Piece } from './Piece';
import { AVAILABLE_PIECES } from '@/lib/game-logic';
import { ScoreDisplay } from './ScoreDisplay';

interface SidebarProps {
  score: number;
  combo: number;
}

export function Sidebar({ score, combo }: SidebarProps) {
  return (
    <div className="w-64 space-y-4">
      <ScoreDisplay score={score} combo={combo} />
      
      <Card>
        <CardHeader>
          <CardTitle>Available Pieces</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {AVAILABLE_PIECES.map(piece => (
            <div key={piece.id} className="flex flex-col items-center">
              <Piece piece={piece} size="lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
