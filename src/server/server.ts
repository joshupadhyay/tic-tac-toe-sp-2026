import express from "express";
import ViteExpress from "vite-express";
import { makeMove } from "../tic-tac-toe.ts";
import type { GameState, IGameMap } from "../types.ts";
import type { UUID } from "crypto";

export const app = express();
app.use(express.json());

export const GAME_MAP: IGameMap = new Map<string, GameState>();

export const DEFAULT_GAME_STATE: GameState = {
  // truly blank game state
  board: [null, null, null, null, null, null, null, null, null],
  currentPlayer: "X",
};

let serverGameState: GameState = DEFAULT_GAME_STATE;

/**
 * S
 */
app.get("/game", (_, res) => {
  res.set("Cache-Control", "no-store");

  // reset defaults here
  serverGameState = DEFAULT_GAME_STATE;

  return res.json({
    board: serverGameState.board,
    currentPlayer: serverGameState.currentPlayer,
    winner: undefined,
  });
});

// WILL BE DEPRECATED SOON
app.post("/move", (req, res) => {
  const index = req.body.index as number;
  // and then we update the game state on the server (refactor this, no need to assign back to itself)
  serverGameState = makeMove(serverGameState, index);

  // return new state and player
  res.json({
    board: serverGameState.board,
    currentPlayer: serverGameState.currentPlayer,
  });
});

/**
 * A player is making a move. Update the game state and return the new state.
 */
app.post("/move/:gameId", (req, res) => {
  // in the POST request, we submit the index that the user clicks

  const index = req.body.index as number;

  const gameId = req.params.gameId as UUID;

  // and then we update the game state on the server (refactor this, no need to assign back to itself)
  serverGameState = makeMove(serverGameState, index);

  // return new state and player
  res.json({
    board: serverGameState.board,
    currentPlayer: serverGameState.currentPlayer,
  });
});

///// for multiplayer – Let's build these functions first before replacing the ones above

/**
 * Create a new game. Use a UUID as the game ID, store game state
 */
app.post("/newgame", (_, res) => {
  // create a new game with a unique ID
  const gameID = crypto.randomUUID();
  GAME_MAP.set(gameID, DEFAULT_GAME_STATE);

  res.json({ gameID, ...DEFAULT_GAME_STATE });
});

/**
 * Get a particular game by its unique ID, or throw error if not found
 */
app.get("/game/:gameId", (req, res) => {
  const { gameId } = req.params;
  const gameState = GAME_MAP.get(gameId);

  if (!gameState) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.json({ gameState });
});

/**
 * Update game state with a move. Return updated game state.
 */
app.post("/move/:gameID", (req, res) => {
  const { gameID } = req.params;
  const { index } = req.body;
  const gameState = GAME_MAP.get(gameID);

  if (!gameState) {
    return res.status(404).json({ error: "Game not found" });
  }

  const updatedGameState = makeMove(gameState, index);

  GAME_MAP.set(gameID, updatedGameState);

  res.json({ gameID, ...updatedGameState });
});

/**
 * List all active games by their game IDs
 * Filter by active Games
 */
app.get("/listgames", (_, res) => {
  const validGameIds = Array.from(GAME_MAP)
    .filter(([_, gameState]) => !gameState.inActive)
    .map(([gameID, _]) => gameID);

  res.json({ games: Array.from(validGameIds) });
});

/**
 * Delete a game by its ID
 */
app.delete("/game/:gameID", (req, res) => {
  const { gameID } = req.params;
  if (GAME_MAP.has(gameID)) {
    GAME_MAP.delete(gameID);
    return res.json({ message: "Game deleted" });
  }
  return res.status(404).json({ error: "Game not found" });
});

// Only start server when not in test mode
if (process.env.NODE_ENV !== "test") {
  ViteExpress.listen(app, 5173, () => {
    console.log("Server is running on http://localhost:5173");
  });
}
