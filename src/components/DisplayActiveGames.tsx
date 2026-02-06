import type { GameState } from "../types";
import { Link, useLocation } from "react-router-dom";

interface ActiveGamesProps {
  activeGameIds: string[];
  activeGames: GameState[];
}

export function DisplayActiveGames({
  activeGameIds,
  activeGames,
}: ActiveGamesProps) {
  if (activeGames.length === 0) {
    return <div>No active games</div>;
  }

  return (
    <div className="flex flex-wrap gap-6">
      {activeGames.map((game, idx) => (
        <Link
          to={`/game/${activeGameIds[idx]}`}
          className="text-sm"
          key={activeGameIds[idx]}
        >
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
