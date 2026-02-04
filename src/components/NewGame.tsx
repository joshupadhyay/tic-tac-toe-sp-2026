export interface NewGameButtonProps {
  winner: string | null;
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
            onClick={() => window.location.reload()}
          >
            New Game
          </button>
        </>
      ) : null}
    </div>
  );
}
