import { getWinner, type Board, switchPlayer } from "../tic-tac-toe";
import type { GameState } from "../types";

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
