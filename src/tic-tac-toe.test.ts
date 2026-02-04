import { describe, it, expect, beforeEach, mock } from "bun:test";
import { makeMove, getWinner, createGame } from "./tic-tac-toe";
import type { GameState } from "./types";
import { fetchNewGame } from "./App";

// Mock fetch globally
beforeEach(() => {
  globalThis.fetch = mock((url: string) => {
    if (url === "/game") {
      return Promise.resolve({
        json: () => Promise.resolve(createGame()),
      });
    }
    return Promise.reject(new Error(`Unknown URL: ${url}`));
  }) as typeof fetch;
});

// Helper: apply a sequence of moves to a fresh game
async function playMoves(...positions: number[]): Promise<GameState> {
  let state = await fetchNewGame();
  for (const pos of positions) {
    state = makeMove(state, pos);
  }
  return state;
}

// ---------------------------------------------------------------------------
// createGame
// ---------------------------------------------------------------------------
describe("createGame", () => {
  it("returns an empty board", async () => {
    const game = await fetchNewGame();
    expect(game.board).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  it("starts with X as the current player", async () => {
    const game = await fetchNewGame();
    expect(game.currentPlayer).toBe("X");
  });
});

// ---------------------------------------------------------------------------
// makeMove
// ---------------------------------------------------------------------------
describe("makeMove", () => {
  it("places the current player's mark on the board", async () => {
    const state = makeMove(await fetchNewGame(), 0);
    expect(state.board[0]).toBe("X");
  });

  it("switches the current player after a move", async () => {
    const state = makeMove(await fetchNewGame(), 0);
    expect(state.currentPlayer).toBe("O");
  });

  it("alternates players across multiple moves", async () => {
    const state = await playMoves(0, 1, 2);
    // X moved at 0, O moved at 1, X moved at 2
    expect(state.board[0]).toBe("X");
    expect(state.board[1]).toBe("O");
    expect(state.board[2]).toBe("X");
    expect(state.currentPlayer).toBe("O");
  });

  it("does not mutate the original state", async () => {
    const original = await fetchNewGame();
    const next = makeMove(original, 4);
    expect(original.board[4]).toBeNull();
    expect(next.board[4]).toBe("X");
  });

  it("throws when the position is already occupied", async () => {
    const state = makeMove(await fetchNewGame(), 0);
    expect(() => makeMove(state, 0)).toThrow("Position is already occupied");
  });

  it("throws when the position is below 0", async () => {
    expect(() => makeMove(createGame(), -1)).toThrow(
      "Position must be between 0 and 8",
    );
  });

  it("throws when the position is above 8", async () => {
    expect(() => makeMove(createGame(), 9)).toThrow(
      "Position must be between 0 and 8",
    );
  });

  it("throws when the position is not an integer", async () => {
    expect(() => makeMove(createGame(), 1.5)).toThrow(
      "Position must be an integer",
    );
  });

  it("throws when the game is already won", async () => {
    // X wins with top row: X(0), O(3), X(1), O(4), X(2)
    const state = await playMoves(0, 3, 1, 4, 2);
    expect(() => makeMove(state, 8)).toThrow("Game is already over");
  });
});

// ---------------------------------------------------------------------------
// getWinner
// ---------------------------------------------------------------------------
describe("getWinner", () => {
  it("returns undefined for an empty board", async () => {
    expect(getWinner(await fetchNewGame())).toBeUndefined();
  });

  it("returns undefined when no one has won yet", async () => {
    // X(0), O(4)
    const state = await playMoves(0, 4);
    expect(getWinner(state)).toBeUndefined();
  });

  // --- Row wins ---
  it("detects X winning with the top row", async () => {
    // X(0), O(3), X(1), O(4), X(2)
    const state = await playMoves(0, 3, 1, 4, 2);
    expect(getWinner(state)?.winner).toBe("X");
    expect(getWinner(state)?.winningPositions).toEqual([0, 1, 2]);
  });

  it("detects O winning with the middle row", async () => {
    // X(0), O(3), X(1), O(4), X(6), O(5)
    const state = await playMoves(0, 3, 1, 4, 6, 5);
    expect(getWinner(state)?.winner).toBe("O");
    expect(getWinner(state)?.winningPositions).toEqual([3, 4, 5]);
  });

  it("detects X winning with the bottom row", async () => {
    // X(6), O(0), X(7), O(1), X(8)
    const state = await playMoves(6, 0, 7, 1, 8);
    expect(getWinner(state)?.winner).toBe("X");
    expect(getWinner(state)?.winningPositions).toEqual([6, 7, 8]);
  });

  // --- Column wins ---
  it("detects X winning with the left column", async () => {
    // X(0), O(1), X(3), O(4), X(6)
    const state = await playMoves(0, 1, 3, 4, 6);
    expect(getWinner(state)?.winner).toBe("X");
    expect(getWinner(state)?.winningPositions).toEqual([0, 3, 6]);
  });

  it("detects O winning with the middle column", async () => {
    // X(0), O(1), X(3), O(4), X(8), O(7)
    const state = await playMoves(0, 1, 3, 4, 8, 7);
    expect(getWinner(state)?.winner).toBe("O");
    expect(getWinner(state)?.winningPositions).toEqual([1, 4, 7]);
  });

  it("detects X winning with the right column", async () => {
    // X(2), O(0), X(5), O(1), X(8)
    const state = await playMoves(2, 0, 5, 1, 8);
    expect(getWinner(state)?.winner).toBe("X");
    expect(getWinner(state)?.winningPositions).toEqual([2, 5, 8]);
  });

  // --- Diagonal wins ---
  it("detects X winning with the main diagonal", async () => {
    // X(0), O(1), X(4), O(2), X(8)
    const state = await playMoves(0, 1, 4, 2, 8);
    expect(getWinner(state)?.winner).toBe("X");
    expect(getWinner(state)?.winningPositions).toEqual([0, 4, 8]);
  });

  it("detects O winning with the anti-diagonal", async () => {
    // X(0), O(2), X(1), O(4), X(8), O(6)
    const state = await playMoves(0, 2, 1, 4, 8, 6);
    expect(getWinner(state)?.winner).toBe("O");
    expect(getWinner(state)?.winningPositions).toEqual([2, 4, 6]);
  });

  // --- Draw / full board ---
  it("returns undefined on a draw (full board, no winner)", async () => {
    // X O X
    // X X O
    // O X O
    // Moves: X(0), O(1), X(2), O(5), X(3), O(6), X(4), O(8), X(7)
    const state = await playMoves(0, 1, 2, 5, 3, 6, 4, 8, 7);
    expect(getWinner(state)).toBeUndefined();
    // Also verify the board is full
    expect(state.board.every((cell) => cell !== null)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Full game sequences
// ---------------------------------------------------------------------------
describe("full game sequences", () => {
  it("plays a complete game where X wins", async () => {
    let state = await fetchNewGame();

    state = makeMove(state, 4); // X center
    expect(state.currentPlayer).toBe("O");

    state = makeMove(state, 0); // O top-left
    state = makeMove(state, 1); // X top-middle
    state = makeMove(state, 3); // O middle-left

    // X hasn't won yet
    expect(getWinner(state)).toBeUndefined();

    state = makeMove(state, 7); // X bottom-middle

    // X wins: positions 1, 4, 7 (middle column)
    expect(getWinner(state)?.winner).toBe("X");
    expect(getWinner(state)?.winningPositions).toEqual([1, 4, 7]);
  });

  it("plays a complete game ending in a draw", async () => {
    // X | O | X
    // O | X | X
    // O | X | O
    const state = await playMoves(0, 1, 2, 3, 4, 6, 5, 8, 7);
    expect(getWinner(state)).toBeUndefined();
    expect(state.board.every((cell) => cell !== null)).toBe(true);
  });

  it("preserves immutability through a full game", async () => {
    const states: GameState[] = [await fetchNewGame()];
    // X(4), O(0), X(1), O(3), X(7) — X wins middle column
    const moves = [4, 0, 1, 3, 7];

    for (const move of moves) {
      states.push(makeMove(states[states.length - 1], move));
    }

    // Verify each intermediate state is unchanged
    expect(states[0].board.every((cell) => cell === null)).toBe(true);
    expect(states[1].board[4]).toBe("X");
    expect(states[2].board[0]).toBe("O");
    expect(states[0].board[4]).toBeNull(); // original still untouched
  });
});
