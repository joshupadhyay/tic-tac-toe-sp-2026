/**
 * Provides Types for both the FE and BE logic
 */

import type { UUID } from "crypto";

export type Player = "X" | "O";

export type Cell = Player | null;

// Board is a 3x3 grid, represented as a 9-element array.
// Indices map to positions:
//  0 | 1 | 2
//  ---------
//  3 | 4 | 5
//  ---------
//  6 | 7 | 8
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

export type GameState = {
  board: Board;
  currentPlayer: Player;
  inActive?: boolean;
  gameId?: UUID;
};

export type IGameMap = Map<string, GameState>;
