import { useState, useCallback, useMemo, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Board } from "@/components/game/Board";
import { Sidebar } from "@/components/game/Sidebar";
import {
  GamePiece,
  BoardPosition,
  BOARD_SIZE,
  validateCaptureChain,
  canCapture,
  AVAILABLE_PIECES,
} from "@/lib/game-logic";
import { generateBoard, BoardConfig } from "@/lib/board-generator";
import { calculateChainScore } from "@/lib/score-calculator";
import {
  BoardSave,
  saveBoardWithPieces,
  loadBoardSave,
} from "@/lib/board-save";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DownloadIcon, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function Game() {
  const [pieces, setPieces] = useState<Map<string, GamePiece>>(new Map());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<{
    piece: GamePiece;
    position: BoardPosition;
  }>();
  const [captureChain, setCaptureChain] = useState<BoardPosition[]>([]);
  const [boardConfig, setBoardConfig] = useState<BoardConfig>(() =>
    generateBoard("medium"),
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [savedBoards, setSavedBoards] = useState<BoardSave[]>([]);
  const [boardName, setBoardName] = useState<string>("");
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const { toast } = useToast();
  useEffect(() => {
    console.log("Board config:", boardConfig);
    console.log("Starting square:", boardConfig?.startingSquare);
    console.log("Black king position:", boardConfig?.blackKingPosition);
    console.log("Missing squares:", boardConfig?.missingSquares);
  }, [boardConfig]);
  // Extract board configuration
  const {
    startingSquare = { x: 0, y: 0 },
    blackKingPosition = { x: 2, y: 2 },
    missingSquares = [],
  } = boardConfig || {};

  // Calculate potential points from the current chain
  const potentialScore = useMemo(() => {
    if (captureChain.length < 1) return { points: 0, multiplierText: "" };
    return calculateChainScore(pieces, captureChain);
  }, [pieces, captureChain]);

  // Function to check if a position contains a missing square
  const isMissingSquare = useCallback(
    (position: BoardPosition) => {
      return missingSquares.some(
        (square) => square.x === position.x && square.y === position.y,
      );
    },
    [missingSquares],
  );

  const handlePieceDrop = useCallback(
    (piece: GamePiece, position: BoardPosition) => {
      // Check if configuration is valid
      if (!startingSquare || !blackKingPosition) {
        toast({
          title: "Board Configuration Error",
          description: "Please regenerate the board",
          variant: "destructive",
        });
        return;
      }

      // If this is the first piece being placed
      if (pieces.size === 0) {
        if (
          position.x !== startingSquare.x ||
          position.y !== startingSquare.y
        ) {
          toast({
            title: "Invalid Move",
            description: "First piece must be placed on the red square",
            variant: "destructive",
          });
          return;
        }
      } else {
        // For subsequent pieces, verify they can be captured by the last piece in the chain
        const lastPos = captureChain[captureChain.length - 1];
        const lastPiece = pieces.get(`${lastPos.x},${lastPos.y}`);
        if (!lastPiece || !canCapture(lastPiece, lastPos, position)) {
          return;
        }
      }

      // Check if this piece is already on the board
      const isAlreadyPlaced = Array.from(pieces.values()).some(
        (placedPiece) => placedPiece.id === piece.id,
      );

      if (isAlreadyPlaced) {
        // Allow moving the same piece to a new position
        setPieces((prev) => {
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
        setPieces((prev) => {
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
        setCaptureChain(newChain);
        setCombo(newChain.length);
      }
    },
    [
      pieces,
      startingSquare,
      blackKingPosition,
      missingSquares,
      toast,
      captureChain,
    ],
  );

  const handleSquareClick = useCallback(
    (position: BoardPosition) => {
      const key = `${position.x},${position.y}`;
      const piece = pieces.get(key);

      if (piece) {
        // Add to capture chain if it's valid
        if (
          captureChain.length === 0 ||
          (position.x === startingSquare.x && position.y === startingSquare.y)
        ) {
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
              description:
                "Pieces must be able to capture each other in sequence",
              variant: "destructive",
            });
          }
        }
      } else {
        setCaptureChain([]);
        setCombo(0);
      }

      setSelectedPiece(piece ? { piece, position } : undefined);
    },
    [pieces, captureChain, startingSquare, blackKingPosition, toast],
  );

  const handleCompleteRound = useCallback(() => {
    // Validate the capture chain
    if (!validateCaptureChain(pieces, captureChain, blackKingPosition)) {
      toast({
        title: "Invalid Solution",
        description: "The capture chain must end by taking the black king",
        variant: "destructive",
      });
      return;
    }

    // Use the calculated score
    const roundScore = potentialScore.points;

    setScore((prev) => prev + roundScore);
    toast({
      title: "Round Complete!",
      description: `Scored ${roundScore} points with a ${combo}x combo!`,
    });

    // Reset board for next round
    setPieces(new Map());
    setCaptureChain([]);
    setCombo(0);
  }, [pieces, captureChain, combo, blackKingPosition, toast, potentialScore]);

  // Function to generate a new board
  const handleGenerateNewBoard = useCallback(() => {
    // Clear the board
    setPieces(new Map());
    setCaptureChain([]);
    setCombo(0);

    // Generate a new board configuration
    setBoardConfig(generateBoard(difficulty));

    toast({
      title: "New Board Generated",
      description: `Created a ${difficulty} difficulty board`,
    });
  }, [difficulty, toast]);

  // Function to open the save dialog
  const handleSaveCurrentBoard = useCallback(() => {
    if (captureChain.length < 1) {
      toast({
        title: "Cannot Save Empty Board",
        description: "Place at least one piece before saving",
        variant: "destructive",
      });
      return;
    }

    setShowSaveDialog(true);
  }, [captureChain.length, toast]);

  // Function to finalize the board save with name
  const finalizeBoardSave = useCallback(() => {
    const name = boardName.trim() || `Board ${new Date().toLocaleString()}`;

    // Calculate current score
    const currentScore = potentialScore.points;

    // Create the save object
    const boardSave = saveBoardWithPieces(
      boardConfig,
      pieces,
      captureChain,
      currentScore,
      name,
    );

    // Add to saved boards
    setSavedBoards((prev) => [...prev, boardSave]);

    // Export as JSON file
    const boardJson = JSON.stringify(boardSave, null, 2);
    const blob = new Blob([boardJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `chess-puzzle-${name.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Board Saved",
      description: `"${name}" has been saved and downloaded`,
    });

    // Reset dialog state
    setShowSaveDialog(false);
    setBoardName("");
  }, [
    boardName,
    boardConfig,
    pieces,
    captureChain,
    potentialScore.points,
    toast,
  ]);

  // Function to load a saved board
  const handleLoadBoard = useCallback(
    (save: BoardSave) => {
      // Use the loadBoardSave helper to reconstruct the game state
      const {
        boardConfig: loadedConfig,
        pieces: loadedPieces,
        captureChain: loadedChain,
      } = loadBoardSave(save, AVAILABLE_PIECES);

      // Set all the game state
      setBoardConfig(loadedConfig);
      setPieces(loadedPieces);
      setCaptureChain(loadedChain);
      setCombo(loadedChain.length);

      toast({
        title: "Board Loaded",
        description: `Loaded "${save.name}"`,
      });
    },
    [toast],
  );

  // Function to import a board from file
  const handleImportBoard = useCallback(() => {
    // Create a file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files?.length) return;

      const file = target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const boardSave = JSON.parse(content) as BoardSave;

          // Validate the board save structure
          if (
            !boardSave.boardConfig ||
            !boardSave.selectedPieces ||
            !boardSave.captureChain
          ) {
            throw new Error("Invalid board save format");
          }

          // Load the board
          handleLoadBoard(boardSave);

          // Add to saved boards if not already there
          setSavedBoards((prev) => {
            const exists = prev.some(
              (b) =>
                b.timestamp === boardSave.timestamp &&
                b.name === boardSave.name,
            );
            return exists ? prev : [...prev, boardSave];
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Could not import the board file",
            variant: "destructive",
          });
        }
      };

      reader.readAsText(file);
    };

    // Trigger the file picker
    input.click();
  }, [handleLoadBoard, toast]);

  // Update the base piece tracking logic
  const usedPieces = Array.from(pieces.values()).map((piece) => piece.id);

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
                missingSquares={missingSquares}
                startingSquare={startingSquare}
                onPieceDrop={handlePieceDrop}
                selectedPiece={selectedPiece}
                onSquareClick={handleSquareClick}
                captureChain={captureChain}
              />

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleCompleteRound}
                  disabled={captureChain.length < 2}
                >
                  Complete Round
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleGenerateNewBoard}
                  title="Generate New Board"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSaveCurrentBoard}
                  title="Save This Board Setup"
                >
                  <DownloadIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  variant={difficulty === "easy" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDifficulty("easy")}
                >
                  Easy
                </Button>
                <Button
                  variant={difficulty === "medium" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDifficulty("medium")}
                >
                  Medium
                </Button>
                <Button
                  variant={difficulty === "hard" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDifficulty("hard")}
                >
                  Hard
                </Button>
              </div>
            </div>

            <Sidebar
              score={score}
              combo={combo}
              usedPieces={usedPieces}
              potentialPoints={potentialScore.points}
              multiplierText={potentialScore.multiplierText}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}