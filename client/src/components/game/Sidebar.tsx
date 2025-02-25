import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Piece } from "./Piece";
import { GamePiece } from "@/lib/game-logic";
import { ScoreDisplay } from "./ScoreDisplay";

interface SidebarProps {
  score: number;
  combo: number;
  usedPieces: string[];
  availablePieces: GamePiece[];
  potentialPoints?: number;
  multiplierText?: string;
}

export function Sidebar({
  score,
  combo,
  usedPieces,
  availablePieces,
  potentialPoints = 0,
  multiplierText = "",
}: SidebarProps) {
  // Group available pieces by type for organized display
  const piecesByType: Record<string, GamePiece[]> = {};

  availablePieces.forEach((piece) => {
    if (!piecesByType[piece.type]) {
      piecesByType[piece.type] = [];
    }
    piecesByType[piece.type].push(piece);
  });

  return (
    <div className="w-64 space-y-4">
      <ScoreDisplay
        score={score}
        combo={combo}
        potentialPoints={potentialPoints}
        multiplierText={multiplierText}
      />

      <Card>
        <CardHeader>
          <CardTitle>Available Pieces</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display pieces by type */}
          {Object.entries(piecesByType).map(([pieceType, pieces]) => (
            <div key={pieceType} className="mb-4">
              <h3 className="text-sm font-medium capitalize mb-2">
                {pieceType}s
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {pieces.map((piece) => {
                  const isUsed = usedPieces.includes(piece.id);
                  return (
                    <div key={piece.id} className="flex flex-col items-center">
                      <div className={isUsed ? "opacity-50" : ""}>
                        <Piece piece={piece} size="lg" draggable={!isUsed} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
