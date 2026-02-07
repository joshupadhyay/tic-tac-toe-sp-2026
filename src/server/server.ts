import express from "express";
import ViteExpress from "vite-express";
import type {
  GameState,
  IWebSocketMessage,
  ChatMessage,
  ChatParticipant,
} from "../types.ts";
import { makeMove } from "./accessory.ts";
import type { UUID } from "crypto";
import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
export const app = express();
app.use(express.json());

export const GAME_MAP = new Map<string, GameState>();
export const WS_MAP = new Map<UUID, WebSocket[]>();

// Maps a WebSocket to its player identity ("X", "O", or undefined for spectators)
export const SOCKET_PLAYER_MAP = new Map<WebSocket, ChatParticipant | undefined>();

// Stores chat history per game
export const CHAT_HISTORY = new Map<UUID, ChatMessage[]>();

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

/*
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
    if (!gameState.inActive && !gameState.winningPositions) {
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
  wsServer.on("connection", (ws, request) => {
    // stores ws in the game map and assigns player identity
    const gameId = handleWebSocketRequest(ws, request);

    // Send chat history to the newly connected client
    const chatHistory = CHAT_HISTORY.get(gameId) ?? [];
    ws.send(JSON.stringify({ type: "chat_history", messages: chatHistory }));

    // Clean up when socket closes (important for React StrictMode double-mounting)
    ws.on("close", () => {
      // Remove from WS_MAP
      const sockets = WS_MAP.get(gameId);
      if (sockets) {
        const filtered = sockets.filter((s) => s !== ws);
        WS_MAP.set(gameId, filtered);
      }
      // Remove from SOCKET_PLAYER_MAP
      SOCKET_PLAYER_MAP.delete(ws);
    });

    /**
     * Each websocket will recieve messages, not the server itself! Think of this like your HTTP route...
     */

    ws.on("message", (request) => {
      const req: IWebSocketMessage = JSON.parse(request.toString());

      const type = req.type;

      switch (type) {
        case "move": {
          const { gameId, index } = req;
          const gameState = GAME_MAP.get(gameId);

          if (!gameState) {
            ws.send(JSON.stringify({ type: "error", error: "Game not found" }));
            return;
          }

          try {
            const updatedGameState = makeMove(gameState, index);

            GAME_MAP.set(gameId, updatedGameState);

            // now update all websockets with information:
            const allSockets = WS_MAP.get(gameId);

            allSockets?.forEach((socket) => {
              socket.send(JSON.stringify({ gameId, ...updatedGameState }));
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : "Invalid move";
            ws.send(JSON.stringify({ type: "error", error: message }));
          }
          break;
        }

        case "chat": {
          const { gameId, text } = req;

          // Look up who this socket belongs to
          const player = SOCKET_PLAYER_MAP.get(ws);
          console.log("Chat received, player lookup:", player);

          // Reject if no player identity
          if (!player) {
            console.log("Rejected: player is undefined");
            return;
          }

          // Create the message
          const message: ChatMessage = { player, text };

          // Store in history
          const history = CHAT_HISTORY.get(gameId) ?? [];
          history.push(message);
          CHAT_HISTORY.set(gameId, history);

          // Broadcast to all sockets in this game
          const allSockets = WS_MAP.get(gameId);
          allSockets?.forEach((socket) => {
            socket.send(JSON.stringify({ type: "chat", ...message }));
          });
          break;
        }
      }
    });
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

/**
 * Handles the websocket adding to our 'DB', and url splitting
 * Also assigns player identity (X, O, or spectator)
 * @param ws Websocket
 * @param req Websocket request URL
 * @returns The gameId for this connection
 */
function handleWebSocketRequest(ws: WebSocket, req: IncomingMessage): UUID {
  const gameId: UUID = req.url!.split("/game/")[1] as UUID; // get the gameId

  // get existing Websocket array or init empty
  const existing = WS_MAP.get(gameId) ?? [];

  // Assign player identity based on connection order
  // First = X, Second = O, Third+ = spectator (undefined)
  let playerIdentity: ChatParticipant | undefined;
  if (existing.length === 0) {
    playerIdentity = "X";
  } else if (existing.length === 1) {
    playerIdentity = "O";
  } else {
    const spectatorNumber = existing.length - 1; // 3rd connection = Spectator 1, 4th = Spectator 2, etc.
    playerIdentity = `Spectator ${spectatorNumber}`;
  }

  SOCKET_PLAYER_MAP.set(ws, playerIdentity);
  console.log(
    `New connection assigned: ${playerIdentity}, total sockets: ${existing.length + 1}`,
  );

  // Initialize chat history for this game if it doesn't exist
  if (!CHAT_HISTORY.has(gameId)) {
    CHAT_HISTORY.set(gameId, []);
  }

  // TIL you can't do (WS_MAP.get(gameId) ?? [];).push(), as push returns the length of the array

  existing.push(ws); // add this connection
  WS_MAP.set(gameId, existing); // save back

  return gameId;
}
