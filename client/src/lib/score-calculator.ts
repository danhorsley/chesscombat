// score-calculator.ts
import { GamePiece, BoardPosition } from "./game-logic";

export const calculateChainScore = (
  pieces: Map<string, GamePiece>,
  chain: BoardPosition[],
): { points: number; multiplierText: string } => {
  let totalPoints = 0;
  let currentMultiplier = 1;
  let multiplierText = "";

  chain.forEach((pos, index) => {
    const key = `${pos.x},${pos.y}`;
    const piece = pieces.get(key);

    if (piece) {
      // Calculate points from this piece
      const piecePoints = piece.points * currentMultiplier;
      totalPoints += piecePoints;

      // Update multiplier for next piece
      currentMultiplier *= piece.multiplier;

      // Build multiplier text to display
      if (index < chain.length - 1) {
        multiplierText += `${piece.multiplier}x `;
      } else {
        multiplierText += `${piece.multiplier}`;
      }
    }
  });

  return { points: Math.round(totalPoints), multiplierText };
};
