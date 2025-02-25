import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Piece } from "./Piece";
import { AVAILABLE_PIECES } from "@/lib/game-logic";
import { ScoreDisplay } from "./ScoreDisplay";

interface SidebarProps {
  score: number;
  combo: number;
  usedPieces: string[];
  potentialPoints?: number;
  multiplierText?: string;
}

export function Sidebar({
  score,
  combo,
  usedPieces,
  potentialPoints = 0,
  multiplierText = "",
}: SidebarProps) {
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
          {/* Group pieces by type */}
          {["rook", "bishop", "knight", "queen"].map((pieceType) => {
            const piecesOfType = AVAILABLE_PIECES.filter(
              (piece) => piece.type === pieceType,
            );

            return (
              <div key={pieceType} className="mb-4">
                <h3 className="text-sm font-medium capitalize mb-2">
                  {pieceType}s
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {piecesOfType.map((piece) => {
                    const isUsed = usedPieces.includes(piece.id);
                    return (
                      <div
                        key={piece.id}
                        className="flex flex-col items-center"
                      >
                        <div className={isUsed ? "opacity-50" : ""}>
                          <Piece piece={piece} size="lg" draggable={!isUsed} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
