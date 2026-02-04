import express from "express";
import ViteExpress from "vite-express";
import { makeMove, type Board, type GameState } from "./src/tic-tac-toe";

const app = express();
app.use(express.json());

let serverGameState: GameState = {
  // truly blank game state
  board: [null, null, null, null, null, null, null, null, null],
  currentPlayer: "X",
};

app.get("/game", (req, res) => {
  // we're starting a new game. pull the starting game array and return it
  res.set("Cache-Control", "no-store");

  // reset defaults here
  serverGameState.board = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];
  serverGameState.currentPlayer = "X";

  return res.json({
    board: serverGameState.board,
    currentPlayer: serverGameState.currentPlayer,
    winner: undefined,
  });
});

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
