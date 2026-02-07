/**
 * Provides Types for both the FE and BE logic
 */

import type { UUID } from "crypto";

// Game players (who can make moves)
export type GamePlayer = "X" | "O";

// Chat participants (players + spectators)
export type ChatParticipant = GamePlayer | `Spectator ${number}`;

// Cells on the board
export type Cell = GamePlayer | null;

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
  currentPlayer: GamePlayer;
  inActive?: boolean;
  gameId?: UUID;
  winningPositions?: number[];
};

export type IGameMap = Map<string, GameState>;

export type IWebSocketMove = {
  type: "move";
  gameId: UUID;
  index: number;
};

export type ChatMessage = {
  player: ChatParticipant;
  text: string;
};

export type IWebSocketChat = {
  type: "chat";
  gameId: UUID;
  text: string;
};

export type IWebSocketMessage = IWebSocketMove | IWebSocketChat;
