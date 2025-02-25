import { useDrag } from "react-dnd";
import { cn } from "@/lib/utils";
import { GamePiece } from "@/lib/game-logic";

interface PieceProps {
  piece:
    | GamePiece
    | {
        id: string;
        type: "king";
        color: "black";
        points: number;
        multiplier: number;
      };
  size?: "sm" | "md" | "lg";
  draggable?: boolean;
}

export function Piece({ piece, size = "md", draggable = true }: PieceProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "PIECE",
    item: piece,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => draggable,
  }));

  const renderPieceIcon = () => {
    switch (piece.type) {
      case "king":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              fill="currentColor"
              d="M19,22H5V20H19V22M17,10C15.58,10 14.26,10.77 13.55,12H13V7H16V5H13V2H11V5H8V7H11V12H10.45C9.74,10.77 8.42,10 7,10C4.79,10 3,11.79 3,14C3,16.21 4.79,18 7,18H17C19.21,18 21,16.21 21,14C21,11.79 19.21,10 17,10Z"
            />
          </svg>
        );
      case "queen":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              fill="currentColor"
              d="M18,3A2,2 0 0,1 20,5C20,5.81 19.5,6.5 18.83,6.82L17,13.15V18H7V13.15L5.17,6.82C4.5,6.5 4,5.81 4,5A2,2 0 0,1 6,3A2,2 0 0,1 8,5C8,5.5 7.82,5.95 7.5,6.3L10.3,9.35L10.83,5.62C10.33,5.26 10,4.67 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.67 13.67,5.26 13.17,5.62L13.7,9.35L16.5,6.3C16.18,5.95 16,5.5 16,5A2,2 0 0,1 18,3M5,20H19V22H5V20Z"
            />
          </svg>
        );
      case "rook":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              fill="currentColor"
              d="M5,20H19V22H5V20M17,2V5H15V2H13V5H11V2H9V5H7V2H5V8H7V18H17V8H19V2H17Z"
            />
          </svg>
        );
      case "bishop":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              fill="currentColor"
              d="M19,22H5V20H19V22M17.16,8.26C18.22,9.63 18.86,11.28 19,13C19,15.76 15.87,18 12,18C8.13,18 5,15.76 5,13C5,10.62 7.33,6.39 10.46,5.27C10.16,4.91 10,4.46 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.46 13.84,4.91 13.54,5.27C14.4,5.6 15.18,6.1 15.84,6.74L11.29,11.29L12.71,12.71L17.16,8.26Z"
            />
          </svg>
        );
      case "knight":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              fill="currentColor"
              d="M19,22H5V20H19V22M13,2V2C11.75,2 10.58,2.62 9.89,3.66L7,8L9,10L11.06,8.63C11.5,8.32 12.14,8.44 12.45,8.9C12.47,8.93 12.5,8.96 12.5,9V9C12.5,9.38 12.19,9.67 11.81,9.67C11.68,9.67 11.55,9.63 11.45,9.55L9.3,8.12L7.34,10.26C6.82,10.82 6.58,11.58 6.7,12.33L7.28,15.79C7.42,16.68 7.96,17.45 8.76,17.89L11.17,19.2C11.39,19.31 11.61,19.4 11.84,19.46L18,20V14.33L16.15,12.5C14.97,11.32 14.21,9.78 14,8.14L13.7,6C13.64,5.44 13.13,5 12.57,5H12.05C12.03,5 12,5 12,5V3C12,2.45 12.45,2 13,2M11,8.35L10.35,9L10.85,9.5L11.5,8.85L11,8.35Z"
            />
          </svg>
        );
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      ref={drag}
      className={cn(
        sizeClasses[size],
        "relative cursor-grab active:cursor-grabbing transition-transform",
        isDragging && "opacity-50 scale-90",
        `text-${piece.color}-500`,
      )}
    >
      {renderPieceIcon()}
      {size === "lg" && (
        <div className="absolute -bottom-6 left-0 right-0 text-center text-xs">
          <div>{piece.points}pts</div>
          <div>x{piece.multiplier}</div>
        </div>
      )}
    </div>
  );
}
