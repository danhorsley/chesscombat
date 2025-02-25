import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Board } from '@/components/game/Board';
import { Sidebar } from '@/components/game/Sidebar';
import { GamePiece, BoardPosition, BOARD_SIZE } from '@/lib/game-logic';
import { useToast } from '@/hooks/use-toast';

export default function Game() {
  const [pieces, setPieces] = useState<Map<string, GamePiece>>(new Map());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<{
    piece: GamePiece;
    position: BoardPosition;
  }>();
  const { toast } = useToast();

  // Initialize game state
  const blackKingPosition: BoardPosition = { x: 2, y: 2 };
  const missingSquare: BoardPosition = { x: 4, y: 4 };

  const handlePieceDrop = useCallback((piece: GamePiece, position: BoardPosition) => {
    const key = `${position.x},${position.y}`;
    
    if (pieces.has(key)) {
      toast({
        title: "Invalid Move",
        description: "Square is already occupied",
        variant: "destructive"
      });
      return;
    }

    setPieces(prev => {
      const next = new Map(prev);
      next.set(key, { ...piece, id: key });
      return next;
    });

    setCombo(prev => prev + 1);
    setScore(prev => prev + piece.points * piece.multiplier);
  }, [pieces, toast]);

  const handleSquareClick = useCallback((position: BoardPosition) => {
    const key = `${position.x},${position.y}`;
    const piece = pieces.get(key);
    
    if (piece) {
      setSelectedPiece({ piece, position });
    } else if (selectedPiece) {
      setSelectedPiece(undefined);
    }
  }, [pieces, selectedPiece]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Chess Puzzle</h1>
          
          <div className="flex gap-8">
            <Board
              pieces={pieces}
              blackKingPosition={blackKingPosition}
              missingSquare={missingSquare}
              onPieceDrop={handlePieceDrop}
              selectedPiece={selectedPiece}
              onSquareClick={handleSquareClick}
            />
            
            <Sidebar score={score} combo={combo} />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
