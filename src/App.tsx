import { useEffect, useState } from "react";
import { getWinner } from "./tic-tac-toe";
import type { GameState } from "./types";
import "./index.css";
import { TicTacToeTable } from "./components/Table";
import { NewGameButton } from "./components/NewGame";
import type { UUID } from "crypto";

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

            // moveAPICall(idx).then((newState: GameState) => {
            //   console.log("New state from server:", newState);
            //   setGameState(newState);
            // });
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

// async function moveAPICall(idx: number) {
//   const response = await fetch("/move", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ index: idx }),
//   });
//   const data = await response.json();
//   return data;
// }

export default App;

/**
 *
 * @returns new GameState with gameID
 */
export async function newGameCall(): Promise<GameState> {
  const response = await fetch("/newgame", {
    method: "GET",
  });

  const data = await response.json();

  return data;
}

export async function moveAPICall(uuid: UUID, idx: number) {
  const resp = await fetch(`/move/${uuid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ index: idx }),
  });

  return resp.json();
}

export async function getAllGames() {
  const resp = await fetch(`/listgames`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await resp.json();
}

export async function toLobby() {
  // claude I want to navigate to the homepage.
  const resp = await fetch("/");

  return resp.json();
}

/**
 *
 * @returns list of gameIDs for all active games.
 */

export async function getActiveGames() {
  const resp = await fetch("/listgames");

  const data: Pick<GameState, "gameId">[] = await resp.json();

  return data;
}
