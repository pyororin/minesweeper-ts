export type Cell = {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
  element: HTMLDivElement;
};

export type GameState = 'playing' | 'won' | 'lost';
