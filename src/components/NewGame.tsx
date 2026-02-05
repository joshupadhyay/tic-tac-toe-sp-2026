import { useNavigate } from "react-router";
import { fetchNewGame } from "../App";
import type { GameState, Player } from "../types";

export function NewGameButton() {
  const navigate = useNavigate();

  const getNewGame = async () => {
    const { gameId } = await fetchNewGame();

    console.log(`new game ID, ${gameId}`);

    navigate(`/game/${gameId}`);
  };

  return (
    <div>
      <button
        className="bg-amber-600 rounded-lg px-4 py-2 justify-center mx-auto-block"
        onClick={getNewGame}
      >
        New Game
      </button>
    </div>
  );
}
