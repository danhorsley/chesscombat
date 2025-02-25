import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Piece } from "./Piece";
import { GamePiece } from "@/lib/game-logic";

interface SidebarProps {
  usedPieces: string[];
  availablePieces: GamePiece[];
}

export function PiecesSidebar({ usedPieces, availablePieces }: SidebarProps) {
  // Group available pieces by type for organized display
  const piecesByType: Record<string, GamePiece[]> = {};

  availablePieces.forEach((piece) => {
    if (!piecesByType[piece.type]) {
      piecesByType[piece.type] = [];
    }
    piecesByType[piece.type].push(piece);
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Available Pieces</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display pieces by type in a more compact layout */}
        {Object.entries(piecesByType).map(([pieceType, pieces]) => (
          <div key={pieceType} className="mb-3">
            <h3 className="text-sm font-medium capitalize mb-1">
              {pieceType}s
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {pieces.map((piece) => {
                const isUsed = usedPieces.includes(piece.id);
                return (
                  <div key={piece.id} className="flex flex-col items-center">
                    <div className={isUsed ? "opacity-50" : ""}>
                      <Piece piece={piece} size="sm" draggable={!isUsed} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
