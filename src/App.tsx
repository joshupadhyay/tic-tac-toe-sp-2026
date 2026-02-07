import { useEffect, useState } from "react";
import type { GameState } from "./types";
import "./index.css";
import { NewGameButton } from "./components/NewGame";
import { Route, Routes, useLocation } from "react-router-dom";
import { GamePage } from "./components/GamePage";
import { DisplayActiveGames } from "./components/DisplayActiveGames";
import { getAllGames, getGame } from "./api";

export default function App() {
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
    let ignore = false;

    async function fetchGames() {
      const listData = await getAllGames();
      const gameIds = listData.games;

      const allGameStates: GameState[] = [];
      for (const id of gameIds) {
        const data = await getGame(id);
        allGameStates.push(data.gameState);
      }

      if (!ignore) {
        setActiveGameIds(gameIds);
        setActiveGames(allGameStates);
      }
    }

    fetchGames();

    return () => {
      ignore = true;
    };
  }, [location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-4xl text-shadow-2xs">Tic Tac Toe</div>
      <div className="text-justify-center text-sm">
        ruin friendships and familial ties
      </div>
      <Routes>
        <Route
          path="/game/:gameId"
          element={<GamePage />}
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
