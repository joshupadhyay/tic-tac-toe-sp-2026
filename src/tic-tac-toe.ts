import type { GameState } from "./types";

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

// makeMove should get the existing state of the cell, and adjust with the Player's symbol
export function makeMove(state: GameState, position: number): GameState {
  const currentValue = state.board[position];

  if (getWinner(state)) {
    throw new Error("Game is already over");
  }

  if (currentValue != null) {
    throw Error("Position is already occupied!");
  }

  if (position > 8 || position < 0) {
    throw Error("Position must be between 0 and 8");
  }

  if (!Number.isInteger(position)) {
    throw Error("Position must be an integer");
  }

  // First allow current player to make a move

  const newBoard = [...state.board] as Board;

  newBoard[position] = state.currentPlayer;

  const newState = {
    board: newBoard,
    currentPlayer: state.currentPlayer,
  };

  getWinner(newState);

  // return new state
  return {
    board: newState.board,
    currentPlayer: switchPlayer(state),
  };
}

export interface WinnerData {
  winner: Player;
  winningPositions: number[];
}

/**
 * Checks if a winner exists. If so, return the winning Player symbol and position
 * @param state
 * @returns
 */
export function getWinner(state: GameState): WinnerData | undefined {
  const winningPositions = winDetection(state);
  if (winningPositions) {
    // since we ret
    const winner = state.currentPlayer === "X" ? "O" : "X";
    return { winner, winningPositions };
  }
}

/**
 * Update currentPlayer after a turn
 * @param state
 * @returns updated Player State
 */
export function switchPlayer(state: GameState): Player {
  return state.currentPlayer == "O" ? "X" : "O";
}

/**
 * After each move, check board for a possible win. Return T/F for is game over
 * @param state
 */
export function winDetection(state: GameState): number[] | void {
  const WinningPositions: number[][] = [
    // main diagonal
    [0, 4, 8],

    // anti-diagonal
    [2, 4, 6],

    // right column
    [2, 5, 8],

    // left column
    [0, 3, 6],

    // middle column
    [1, 4, 7],

    // top row
    [0, 1, 2],

    // middle row
    [3, 4, 5],

    // bottom row
    [6, 7, 8],
  ];

  const player = state.currentPlayer === "X" ? "O" : "X";

  for (let i: number = 0; i < WinningPositions.length; i++) {
    const possibleWin = WinningPositions[i];

    if (possibleWin.every((position) => state.board[position] == player)) {
      return possibleWin; //every board position from the possible win array is the same symbol = a win
    }
  }
}

export function DrawDetection(state: GameState): boolean {
  // if there are no nulls in the board and no winner, it's a draw
  if (state.board.every((cell) => cell !== null) && !getWinner(state)) {
    return true;
  }
  return false;
}

export function isGameOver(state: GameState): boolean {
  return getWinner(state) !== null || DrawDetection(state);
}

export function newGameCall() {}
