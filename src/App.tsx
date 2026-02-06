import { useEffect, useState } from "react";
import { getWinner } from "./tic-tac-toe";
import type { GameState } from "./types";
import "./index.css";
import { TicTacToeTable } from "./components/Table";
import { NewGameButton } from "./components/NewGame";
import type { UUID } from "crypto";
import {
  BrowserRouter,
  Link,
  Route,
  Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { GamePage } from "./components/GamePage";
import { DisplayActiveGames } from "./components/DisplayActiveGames";

export default function App() {
  let [gameState, setGameState] = useState<GameState>({
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: "X",
  });

  const location = useLocation();

  // states: activeGameIDs
  const [activeGameIds, setActiveGameIds] = useState<string[]>([]);
  // activeGames (actual games)
  const [activeGames, setActiveGames] = useState<GameState[]>([]);

  async function fetchData() {
    // Get list of gameIds
    const listData = await getAllGames();
    const gameIds = listData.games;
    setActiveGameIds(gameIds);

    // Query for actual games
    const allGameStates: GameState[] = [];

    for (const id of gameIds) {
      const data = await getGame(id);
      allGameStates.push(data.gameState);
    }

    // setState on activeGames: list of game states
    setActiveGames(allGameStates);
  }

  // Update list of active games when location changes
  useEffect(() => {
    fetchData();
  }, [location]);

  // Fetch initial gameState on mount
  useEffect(() => {
    newGameCall().then((newGameState: GameState) => {
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
      <Routes>
        <Route
          path="/game/:gameId"
          element={<GamePage winner={winnerInfo} />}
        ></Route>
      </Routes>
      <NewGameButton onGameCreated={fetchData} />
      <DisplayActiveGames
        activeGameIds={activeGameIds}
        activeGames={activeGames}
      />
    </div>
  );
}

export async function fetchNewGame(): Promise<GameState> {
  const response = await fetch("/api/newgame", {
    method: "POST",
  });
  const data = await response.json();
  return data;
}

/**
 *
 * @returns new GameState with gameID
 */
export async function newGameCall(): Promise<GameState> {
  const response = await fetch("/api/newgame", {
    method: "GET",
  });

  const data = await response.json();

  return data;
}

export async function moveAPICall(gameId: UUID, idx: number) {
  const resp = await fetch(`/api/move/${gameId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ index: idx }),
  });

  return resp.json();
}

export async function getAllGames() {
  const resp = await fetch(`/api/listgames`, {
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
  const resp = await fetch("/api/listgames");

  const data: Pick<GameState, "gameId">[] = await resp.json();

  return data;
}

export async function getGame(gameId: UUID) {
  const resp = await fetch(`/api/game/${gameId}`);

  return await resp.json();
}
