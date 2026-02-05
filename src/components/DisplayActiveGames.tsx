import { useEffect, useState } from "react";
import type { GameState } from "../types";
import { getAllGames, getGame } from "../App";
import { Link } from "react-router-dom";

export function DisplayActiveGames() {
  // states: activeGameIDs
  const [activeGameIds, setActiveGameIds] = useState<string[]>([]);
  // activeGames (actual games)
  const [activeGames, setActiveGames] = useState<GameState[]>([]);

  useEffect(() => {
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

    fetchData();
  }, []);

  if (activeGames.length === 0) {
    return <div>No active games</div>;
  }

  return (
    <div className="flex flex-wrap gap-6">
      {activeGames.map((game, idx) => (
        <Link to={`/game/${activeGameIds[idx]}`} className="text-sm">
          <MiniTicTacToeTable {...game}></MiniTicTacToeTable>
          continue?
        </Link>
      ))}
    </div>
  );
}

export function MiniTicTacToeTable(props: GameState) {
  return (
    <div className="grid grid-cols-3 gap-0.5 w-16">
      {props.board.map((cell, idx) => (
        <div
          className={`bg-gray-200 border rounded-sm border-solid items-center justify-center flex text-xs aspect-square ${cell === "O" ? "border-red-700" : cell === "X" ? "border-blue-700" : "border-grey-700"}`}
          key={idx}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}
