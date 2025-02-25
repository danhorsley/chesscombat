import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Board } from '@/components/game/Board';
import { Sidebar } from '@/components/game/Sidebar';
import { GamePiece, BoardPosition, BOARD_SIZE, validateCaptureChain } from '@/lib/game-logic';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function Game() {
  const [pieces, setPieces] = useState<Map<string, GamePiece>>(new Map());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<{
    piece: GamePiece;
    position: BoardPosition;
  }>();
  const [captureChain, setCaptureChain] = useState<BoardPosition[]>([]);
  const { toast } = useToast();

  // Initialize game state
  const startingSquare: BoardPosition = { x: 0, y: 0 };
  const blackKingPosition: BoardPosition = { x: 2, y: 2 };
  const missingSquare: BoardPosition = { x: 4, y: 4 };

  const handlePieceDrop = useCallback((piece: GamePiece, position: BoardPosition) => {
    // Don't allow placing on missing square or black king position
    if (
      (position.x === missingSquare.x && position.y === missingSquare.y) ||
      (position.x === blackKingPosition.x && position.y === blackKingPosition.y)
    ) {
      return;
    }

    // If this is the first piece being placed
    if (pieces.size === 0) {
      if (position.x !== startingSquare.x || position.y !== startingSquare.y) {
        toast({
          title: "Invalid Move",
          description: "First piece must be placed on the red square",
          variant: "destructive"
        });
        return;
      }
    }

    // Update pieces map with new piece
    setPieces(prev => {
      const next = new Map(prev);
      next.set(`${position.x},${position.y}`, { ...piece, id: `${position.x},${position.y}` });
      return next;
    });

    // Reset chain when adding/moving pieces
    setCaptureChain([]);
    setCombo(0);
  }, [pieces, startingSquare, blackKingPosition, missingSquare, toast]);

  const handleSquareClick = useCallback((position: BoardPosition) => {
    const key = `${position.x},${position.y}`;
    const piece = pieces.get(key);

    if (piece) {
      // Add to capture chain if it's valid
      if (captureChain.length === 0 || 
          (position.x === startingSquare.x && position.y === startingSquare.y)) {
        setCaptureChain([position]);
      } else {
        const newChain = [...captureChain, position];
        if (validateCaptureChain(pieces, newChain, blackKingPosition)) {
          setCaptureChain(newChain);
          setCombo(newChain.length);
        } else {
          toast({
            title: "Invalid Chain",
            description: "Pieces must be able to capture each other in sequence",
            variant: "destructive"
          });
        }
      }
    } else {
      setCaptureChain([]);
      setCombo(0);
    }

    setSelectedPiece(piece ? { piece, position } : undefined);
  }, [pieces, captureChain, startingSquare, blackKingPosition, toast]);

  const handleCompleteRound = useCallback(() => {
    if (!validateCaptureChain(pieces, captureChain, blackKingPosition)) {
      toast({
        title: "Invalid Solution",
        description: "The capture chain must end by taking the black king",
        variant: "destructive"
      });
      return;
    }

    // Calculate score based on the chain
    let totalScore = 0;
    let currentMultiplier = 1;

    captureChain.forEach((pos) => {
      const key = `${pos.x},${pos.y}`;
      const piece = pieces.get(key);
      if (piece) {
        totalScore += piece.points * currentMultiplier;
        currentMultiplier *= piece.multiplier;
      }
    });

    setScore(prev => prev + totalScore);
    toast({
      title: "Round Complete!",
      description: `Scored ${totalScore} points with a ${combo}x combo!`,
    });

    // Reset board for next round
    setPieces(new Map());
    setCaptureChain([]);
    setCombo(0);
  }, [pieces, captureChain, combo, blackKingPosition, toast]);

  // Update the base piece tracking logic
  const usedPieces = Array.from(pieces.values()).map(piece => {
    // Extract the base piece ID (e.g., 'rook-blue' from 'rook-blue-0,1')
    const baseId = piece.id.split(',')[0];
    return baseId;
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Chess Puzzle</h1>

          <div className="flex gap-8">
            <div className="space-y-4">
              <Board
                pieces={pieces}
                blackKingPosition={blackKingPosition}
                missingSquare={missingSquare}
                startingSquare={startingSquare}
                onPieceDrop={handlePieceDrop}
                selectedPiece={selectedPiece}
                onSquareClick={handleSquareClick}
                captureChain={captureChain}
              />

              <Button 
                className="w-full"
                size="lg"
                onClick={handleCompleteRound}
                disabled={captureChain.length < 2}
              >
                Complete Round
              </Button>
            </div>

            <Sidebar score={score} combo={combo} usedPieces={usedPieces} />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}