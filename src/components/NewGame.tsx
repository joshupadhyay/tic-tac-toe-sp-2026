import { useNavigate } from "react-router-dom";
import { fetchNewGame } from "../App";

interface NewGameButtonProps {
  onGameCreated: () => void;
}

export function NewGameButton({ onGameCreated }: NewGameButtonProps) {
  const navigate = useNavigate();

  const getNewGame = async () => {
    const { gameId } = await fetchNewGame();

    console.log(`new game ID, ${gameId}`);

    onGameCreated();
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
