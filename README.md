# Chess Tactics Puzzle Game

## Project Overview
This is a chess-inspired puzzle game where players create capture chains with chess pieces to reach a black king. The game combines strategic planning with tactical piece placement to create satisfying combos and earn high scores.

## Game Mechanics

### Piece Scoring System
- **Color-Based Points**:
  - Blue pieces: 25 points
  - Green pieces: 50 points
  - Purple pieces: 75 points
  - Red pieces: 100 points

- **Piece-Type Multipliers**:
  - Knight: 2x multiplier
  - Bishop: 2x multiplier
  - Rook: 5x multiplier
  - Queen: 10x multiplier

- **Chain Scoring**:
  - The first piece contributes its base points
  - Each subsequent piece contributes: (base points × accumulated multiplier)
  - After a piece is counted, its multiplier is applied to all subsequent pieces
  - Example: Blue Knight (25 pts) → Red Rook (100 pts × 2 = 200 pts) → Purple Queen (75 pts × 10 = 750 pts)
  - Total: 975 points

### Core Gameplay
- Players place chess pieces (rooks, bishops, knights, queens, kings) on a 5x5 board
- Each piece has a point value and a multiplier
- The goal is to create a valid capture chain that leads to the black king
- Each piece must be able to capture the next piece based on standard chess movement rules
- The final piece in the chain must capture the black king
- Higher scores are achieved by strategically ordering pieces to maximize multiplier effects

### Board Generation
- Random boards are generated with varying difficulty levels (easy, medium, hard)
- Each board contains:
  - A black king (placed generally in the center area)
  - A starting square (usually in a corner)
  - Missing/blocked squares that cannot be used
- Board layouts can be saved and loaded

### Scoring System
- Each piece contributes points based on its base value
- Points are multiplied by accumulated multipliers from previous pieces in the chain
- Longer chains with strategic piece ordering yield higher scores
- Combo bonuses are awarded for consecutive successful captures

## Technical Details

### Key Components
- React-based frontend with TypeScript
- React DnD for drag-and-drop functionality
- Tailwind CSS for styling
- Custom board generation and validation logic

### Project Structure
- `src/components/game/`: UI components for the game board, pieces, sidebar, etc.
- `src/lib/`: Core game logic, board generation, scoring, and save functionality

## Known Issues
- Board generation occasionally fails with `undefined is not an object (evaluating 'startingSquare.x')` error (~50% of the time)
- [Add other known issues here]

## Roadmap
- [Add planned features or improvements here]
- [Add any performance optimizations planned]
- [Add any visual or UX improvements planned]

## Setup and Development
```
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Dependencies
- React
- React DnD
- Tailwind CSS
- TypeScript
- [Other major dependencies]