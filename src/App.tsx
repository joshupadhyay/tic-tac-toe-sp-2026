import { useEffect, useState } from "react";
import {
  createGame,
  getWinner,
  makeMove,
  switchPlayer,
  type GameState,
  type Player,
} from "./tic-tac-toe";
import "./index.css";
import { TicTacToeTable } from "./components/Table";
import { NewGameButton } from "./components/NewGame";

function App() {
  let [gameState, setGameState] = useState<GameState>({
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: "X",
  });

  // Fetch initial gameState on mount
  useEffect(() => {
    fetchNewGame().then((newGameState: GameState) => {
      setGameState(newGameState);
    });
  }, []);

  let winnerInfo = getWinner(gameState);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-4xl text-shadow-2xs">Tic Tac Toe</div>
      <div className="text-justify-center text-sm">
        ruin friendships and familial ties
      </div>
      <div>
        <TicTacToeTable
          board={gameState.board}
          currentPlayer={gameState.currentPlayer}
          onCellClick={(idx) => {
            if (winnerInfo?.winner) return;

            moveAPICall(idx).then((newState: GameState) => {
              console.log("New state from server:", newState);
              setGameState(newState);
            });
          }}
          winningPositions={winnerInfo?.winningPositions}
        />
      </div>
      {winnerInfo?.winner ? null : (
        <p>current player: {gameState.currentPlayer}</p>
      )}
      <NewGameButton winner={winnerInfo?.winner} newGameClick={setGameState} />
    </div>
  );
}

export async function fetchNewGame() {
  const response = await fetch("/game");
  const data = await response.json();
  return data;
}

async function moveAPICall(idx: number) {
  const response = await fetch("/move", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ index: idx }),
  });
  const data = await response.json();
  return data;
}

export default App;
