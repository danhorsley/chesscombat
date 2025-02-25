import { useDrop } from 'react-dnd';
import { cn } from "@/lib/utils";
import { Piece } from './Piece';
import { BOARD_SIZE, type GamePiece, type BoardPosition, getPieceMovements } from '@/lib/game-logic';

interface BoardProps {
  pieces: Map<string, GamePiece>;
  blackKingPosition: BoardPosition;
  missingSquare: BoardPosition;
  onPieceDrop: (piece: GamePiece, position: BoardPosition) => void;
  selectedPiece?: { piece: GamePiece; position: BoardPosition };
  onSquareClick: (position: BoardPosition) => void;
}

export function Board({
  pieces,
  blackKingPosition,
  missingSquare,
  onPieceDrop,
  selectedPiece,
  onSquareClick,
}: BoardProps) {
  const validMoves = selectedPiece 
    ? getPieceMovements(selectedPiece.piece, selectedPiece.position)
    : [];

  const renderSquare = (position: BoardPosition) => {
    const key = `${position.x},${position.y}`;
    const piece = Array.from(pieces.entries())
      .find(([_, p]) => p.id === key)?.[1];
    
    const isValidMove = validMoves.some(move => 
      move.x === position.x && move.y === position.y
    );

    const isBlackKing = position.x === blackKingPosition.x && 
      position.y === blackKingPosition.y;

    const isMissing = position.x === missingSquare.x && 
      position.y === missingSquare.y;

    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'PIECE',
      canDrop: () => !isMissing,
      drop: (item: GamePiece) => onPieceDrop(item, position),
      collect: monitor => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div
        key={key}
        ref={drop}
        onClick={() => onSquareClick(position)}
        className={cn(
          "w-16 h-16 border border-gray-300",
          (position.x + position.y) % 2 === 0 ? "bg-white" : "bg-gray-100",
          isOver && "bg-blue-100",
          isValidMove && "bg-green-100",
          isMissing && "bg-gray-900",
          "flex items-center justify-center"
        )}
      >
        {isBlackKing && (
          <Piece 
            piece={{ 
              id: 'black-king', 
              type: 'king', 
              color: 'black',
              points: 0,
              multiplier: 1
            }}
            draggable={false}
          />
        )}
        {piece && <Piece piece={piece} draggable={false} />}
      </div>
    );
  };

  return (
    <div className="inline-grid grid-cols-5 gap-0 border-2 border-gray-400 rounded-lg p-2 bg-white shadow-lg">
      {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => ({
        x: Math.floor(i / BOARD_SIZE),
        y: i % BOARD_SIZE
      })).map(renderSquare)}
    </div>
  );
}
