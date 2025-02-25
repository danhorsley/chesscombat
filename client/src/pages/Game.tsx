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

    // Check if this piece is already on the board
    const isAlreadyPlaced = Array.from(pieces.values()).some(
      placedPiece => placedPiece.id === piece.id
    );

    if (isAlreadyPlaced) {
      // Allow moving the same piece to a new position
      setPieces(prev => {
        const next = new Map(prev);
        // Remove the piece from its old position
        Array.from(next.entries()).forEach(([key, p]) => {
          if (p.id === piece.id) {
            next.delete(key);
          }
        });
        // Add it to the new position
        next.set(`${position.x},${position.y}`, piece);
        return next;
      });
    } else {
      // Place a new piece
      setPieces(prev => {
        const next = new Map(prev);
        next.set(`${position.x},${position.y}`, piece);
        return next;
      });
    }

    // After placing a piece, update the capture chain
    if (pieces.size === 0) {
      setCaptureChain([position]);
      setCombo(1);
    } else {
      const newChain = [...captureChain, position];
      if (validateCaptureChain(pieces, newChain, blackKingPosition)) {
        setCaptureChain(newChain);
        setCombo(newChain.length);
      }
    }
  }, [pieces, startingSquare, blackKingPosition, missingSquare, toast, captureChain]);

  const handleSquareClick = useCallback((position: BoardPosition) => {
    const key = `${position.x},${position.y}`;
    const piece = pieces.get(key);

    if (piece) {
      // Add to capture chain if it's valid
      if (captureChain.length === 0 || 
          (position.x === startingSquare.x && position.y === startingSquare.y)) {
        setCaptureChain([position]);
        setCombo(1);
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
  const usedPieces = Array.from(pieces.values()).map(piece => piece.id);

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