import express from "express";
import ViteExpress from "vite-express";
import { makeMove } from "./src/tic-tac-toe";
import type { GameState } from "./src/types";

const app = express();
app.use(express.json());

const DEFAULT_GAME_STATE: GameState = {
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

/**
 * A player is making a move. Update the game state and return the new state.
 */
app.post("/move", (req, res) => {
  // in the POST request, we submit the index that the user clicks

  // and then we update the game state on the server (refactor this, no need to assign back to itself)
  serverGameState = makeMove(serverGameState, req.body.index as number);

  // return new state and player
  res.json({
    board: serverGameState.board,
    currentPlayer: serverGameState.currentPlayer,
  });
});

ViteExpress.listen(app, 5173, () => {
  console.log("Server is running on http://localhost:5173");
});
