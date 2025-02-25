import { useDrop } from "react-dnd";
import { cn } from "@/lib/utils";
import { Piece } from "./Piece";
import {
  BOARD_SIZE,
  type GamePiece,
  type BoardPosition,
  getPieceMovements,
  canCapture,
} from "@/lib/game-logic";

interface BoardProps {
  pieces: Map<string, GamePiece>;
  blackKingPosition: BoardPosition;
  missingSquares: BoardPosition[];
  startingSquare: BoardPosition;
  onPieceDrop: (piece: GamePiece, position: BoardPosition) => void;
  selectedPiece?: { piece: GamePiece; position: BoardPosition };
  onSquareClick: (position: BoardPosition) => void;
  captureChain: BoardPosition[];
  canCaptureKing?: boolean;
}

export function Board({
  pieces,
  blackKingPosition,
  missingSquares,
  startingSquare,
  onPieceDrop,
  selectedPiece,
  onSquareClick,
  captureChain,
  canCaptureKing = false,
}: BoardProps) {
  const validMoves = selectedPiece
    ? getPieceMovements(selectedPiece.piece, selectedPiece.position)
    : [];

  const renderSquare = (position: BoardPosition) => {
    const key = `${position.x},${position.y}`;
    const piece = pieces.get(key);

    const isValidMove = validMoves.some(
      (move) => move.x === position.x && move.y === position.y,
    );

    const isBlackKing =
      position.x === blackKingPosition.x && position.y === blackKingPosition.y;

    const isMissing = missingSquares.some(
      (square) => square.x === position.x && square.y === position.y,
    );

    const isStarting =
      position.x === startingSquare.x && position.y === startingSquare.y;

    const chainIndex = captureChain.findIndex(
      (pos) => pos.x === position.x && pos.y === position.y,
    );

    // Determine valid drop targets based on game state
    let isValidDropTarget = false;
    if (pieces.size === 0) {
      // First piece can only go on starting square
      isValidDropTarget = isStarting;
    } else if (captureChain.length > 0) {
      // Subsequent pieces must be placeable by the last piece in the chain
      const lastPos = captureChain[captureChain.length - 1];
      const lastPiece = pieces.get(`${lastPos.x},${lastPos.y}`);
      if (lastPiece && !piece && !isBlackKing && !isMissing) {
        isValidDropTarget = canCapture(lastPiece, lastPos, position);
      }
    }

    // Check if this is the king and it can be captured
    const isCapturableKing = isBlackKing && canCaptureKing;

    const [{ isOver }, drop] = useDrop(
      () => ({
        accept: "PIECE",
        canDrop: () => {
          // Can't drop on missing square or black king
          if (isMissing || isBlackKing) return false;

          // If no pieces on board, can only drop on starting square
          if (pieces.size === 0) return isStarting;

          // Subsequent pieces must be placeable by the last piece in the chain
          if (captureChain.length > 0) {
            const lastPos = captureChain[captureChain.length - 1];
            const lastPiece = pieces.get(`${lastPos.x},${lastPos.y}`);
            if (lastPiece && !piece) {
              return canCapture(lastPiece, lastPos, position);
            }
          }

          return false;
        },
        drop: (item: GamePiece) => onPieceDrop(item, position),
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      }),
      [pieces, isMissing, isBlackKing, isStarting, captureChain],
    );

    return (
      <div
        key={key}
        ref={drop}
        onClick={() => onSquareClick(position)}
        className={cn(
          "w-16 h-16",
          "relative",
          (position.x + position.y) % 2 === 0 ? "bg-white" : "bg-gray-100",
          isOver && "bg-blue-100",
          isValidMove && "bg-green-100",
          isMissing && "bg-gray-900",
          "flex items-center justify-center",
          "border border-gray-300",
          isStarting &&
            "outline outline-2 outline-offset-[-2px] outline-red-500",
          chainIndex !== -1 &&
            "outline outline-2 outline-offset-[-2px] outline-green-500",
          isValidDropTarget && "bg-yellow-100",
          // Highlight king in gold when capturable
          isCapturableKing && "bg-yellow-400 cursor-pointer animate-pulse",
        )}
      >
        {isBlackKing && (
          <div
            className={cn(
              "relative",
              isCapturableKing && "scale-110 transition-transform",
            )}
          >
            <Piece
              piece={{
                id: "black-king",
                type: "king",
                color: "black",
                points: 0,
                multiplier: 1,
              }}
              draggable={false}
            />
            {isCapturableKing && (
              <div className="absolute inset-0 rounded-full border-2 border-yellow-500 animate-ping" />
            )}
          </div>
        )}
        {piece && (
          <div className={cn(chainIndex !== -1 && "relative")}>
            <Piece piece={piece} draggable={true} />
            {chainIndex !== -1 && (
              <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {chainIndex + 1}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="inline-grid grid-cols-5 gap-0 border-2 border-gray-400 rounded-lg p-2 bg-white shadow-lg">
      {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => ({
        x: Math.floor(i / BOARD_SIZE),
        y: i % BOARD_SIZE,
      })).map(renderSquare)}
    </div>
  );
}
