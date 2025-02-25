import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Piece } from "./Piece";
import { GamePiece } from "@/lib/game-logic";

interface SidebarProps {
  usedPieces: string[];
  availablePieces: GamePiece[];
}

export function PiecesSidebar({ usedPieces, availablePieces }: SidebarProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Available Pieces</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {availablePieces.map((piece) => {
            const isUsed = usedPieces.includes(piece.id);
            return (
              <div key={piece.id} className="flex flex-col items-center">
                <div className={isUsed ? "opacity-50" : ""}>
                  <Piece piece={piece} size="sm" draggable={!isUsed} />
                </div>
                {/* Add compact points and multiplier display */}
                <div className="text-xs mt-1 text-center">
                  <span className="font-medium">{piece.points}pts</span>
                  <span className="mx-1">×</span>
                  <span className="font-bold">{piece.multiplier}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
