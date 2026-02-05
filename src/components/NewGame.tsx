import { fetchNewGame } from "../App";
import type { GameState, Player } from "../types";

export interface NewGameButtonProps {
  winner?: Player; // optional
  newGameClick: (gamestate: GameState) => void;
}

export function NewGameButton(props: NewGameButtonProps) {
  props.winner;

  return (
    <div>
      {props.winner ? (
        <>
          <p className="text-5xl animate-[bounce_2s_infinite]">{`${props.winner} WON BABY`}</p>
          <button
            className="bg-amber-600 rounded-lg px-4 py-2 justify-center mx-auto-block"
            onClick={async () => {
              props.newGameClick(
                await fetchNewGame().then(
                  (newGameState: GameState) => newGameState,
                ),
              );
            }}
          >
            New Game
          </button>
        </>
      ) : null}
    </div>
  );
}
