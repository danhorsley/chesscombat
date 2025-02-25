// client/src/components/game/LevelSelector.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PREDEFINED_LEVELS } from "@/lib/piece-selector-service";

interface LevelSelectorProps {
  currentLevelId?: string;
  currentDifficulty: "easy" | "medium" | "hard";
  onLevelChange: (levelId?: string) => void;
  onDifficultyChange: (difficulty: "easy" | "medium" | "hard") => void;
}

export function LevelSelector({
  currentLevelId,
  currentDifficulty,
  onLevelChange,
  onDifficultyChange,
}: LevelSelectorProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Game Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Level Selector */}
          <div className="space-y-2">
            <label htmlFor="level-select" className="text-sm font-medium">
              Piece Set:
            </label>
            <Select
              value={currentLevelId || "random"}
              onValueChange={(value) =>
                onLevelChange(value === "random" ? undefined : value)
              }
            >
              <SelectTrigger id="level-select">
                <SelectValue placeholder="Select Piece Set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                {PREDEFINED_LEVELS.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label htmlFor="difficulty-select" className="text-sm font-medium">
              Board Difficulty:
            </label>
            <Select
              value={currentDifficulty}
              onValueChange={(value) =>
                onDifficultyChange(value as "easy" | "medium" | "hard")
              }
            >
              <SelectTrigger id="difficulty-select">
                <SelectValue placeholder="Select Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>
            <span className="font-medium">Easy:</span> Fewer obstacles, simpler
            board layout
          </p>
          <p>
            <span className="font-medium">Medium:</span> Balanced challenge
          </p>
          <p>
            <span className="font-medium">Hard:</span> More obstacles, complex
            board layout
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
