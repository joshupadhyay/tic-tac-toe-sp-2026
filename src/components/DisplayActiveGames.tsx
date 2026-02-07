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
  const location = useLocation();

  if (activeGames.length === 0) {
    return <div>No active games</div>;
  }

  console.log(`store location ${location.pathname}`);

  let currentGameID: string | undefined;

  if (location.pathname.split("/game/")[1]) {
    // means we're on a game

    currentGameID = location.pathname.split("/game/")[1];
  }

  return (
    <div className="flex flex-wrap gap-6">
      {activeGameIds
        .map((id, idx) => ({ id, game: activeGames[idx] }))
        .filter(({ id }) => id !== currentGameID)
        .map(({ id, game }) => (
          <Link to={`/game/${id}`} key={id}>
            <MiniTicTacToeTable {...game} />
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
          className={`border rounded-sm border-solid items-center justify-center flex text-xs aspect-square ${cell === "O" ? "border-red-700" : cell === "X" ? "border-blue-700" : "border-grey-700"} ${props.winningPositions?.includes(idx) ? "bg-yellow-200" : "bg-gray-200"}`}
          key={idx}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}
