import express from "express";
import ViteExpress from "vite-express";
import type { GameState } from "../types.ts";
import { makeMove } from "./accessory.ts";
import type { UUID } from "crypto";
import { WebSocketServer, WebSocket } from "ws";
export const app = express();
app.use(express.json());

export const GAME_MAP = new Map<string, GameState>();
export const WS_MAP = new Map<UUID, WebSocket[]>();

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

///// for multiplayer – Let's build these functions first before replacing the ones above

/**
 * Create a new game. Use a UUID as the game ID, store game state
 */
app.post("/api/newgame", (_, res) => {
  // create a new game with a unique ID
  const gameId = crypto.randomUUID();
  GAME_MAP.set(gameId, DEFAULT_GAME_STATE);

  return res.json({ gameId, ...DEFAULT_GAME_STATE });
});

/**
 * Get a particular game by its unique ID, or throw error if not found
 */
app.get("/api/game/:gameId", (req, res) => {
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
app.post("/api/move/:gameID", (req, res) => {
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
app.get("/api/listgames", (_, res) => {
  const validGameIds: string[] = [];

  // needed claude to help do this. Filter to display only active games
  for (const [gameID, gameState] of GAME_MAP) {
    if (!gameState.inActive) {
      validGameIds.push(gameID);
    }
  }

  res.json({ games: Array.from(validGameIds) });
});

/**
 * Delete a game by its ID
 */
app.delete("/api/game/:gameID", (req, res) => {
  const { gameID } = req.params;
  if (GAME_MAP.has(gameID)) {
    GAME_MAP.delete(gameID);
    return res.json({ message: "Game deleted" });
  }
  return res.status(404).json({ error: "Game not found" });
});

// Only start server when not in test mode
if (process.env.NODE_ENV !== "test") {
  const expressServer = ViteExpress.listen(app, 5173, () => {
    console.log("Server is running on http://localhost:5173");
  });

  // Use noServer mode to avoid conflicts with Vite's HMR WebSocket
  const wsServer = new WebSocketServer({ noServer: true });

  // On each connection, we will get a unique websocket object (ws), and the request url from the client (the websocket url!)
  // We need to store this ws in the game map
  wsServer.on("connection", (ws, request) => {
    console.log(`${request.url} is connected`);

    // pull gameId from ws url
    // /api/game/bfa0e843-af04-4bea-9cd3-faa41349b87c

    const gameId: UUID = request.url!.split("/game/")[1] as UUID; // get the gameId

    // get existing Websocket array or init empty
    const existing = WS_MAP.get(gameId) ?? [];

    // TIL you can't do (WS_MAP.get(gameId) ?? [];).push(), as push returns the length of the array

    existing.push(ws); // add this connection
    WS_MAP.set(gameId, existing); // save back

    console.log(`all websockets, ${WS_MAP}`);
  });

  // Manually handle upgrade requests, only for our custom path
  expressServer.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url!, `http://${request.headers.host}`)
      .pathname;

    // Only handle /api/ path (our defined server path), let Vite hot reload other paths!
    if (pathname.startsWith(`/api/`)) {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit("connection", ws, request);
      });
    }
    // Don't call socket.destroy() for other paths - let Vite's HMR handle them
  });
}
