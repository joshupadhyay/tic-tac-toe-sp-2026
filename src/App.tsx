import { useState } from "react";
import { createGame, getWinner, makeMove } from "./tic-tac-toe";

import "./Table.css";

function App() {
  let [gameState, setGameState] = useState(getInitialGame());

  let winner = getWinner(gameState);

  return (
    <div>
      <div className="board">
        {gameState.board.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => {
              if (winner) return;
              setGameState(makeMove(gameState, idx));
            }}
          >
            {cell}
          </div>
        ))}
      </div>
      {winner != null ? (
        <>
          <h1>{`${winner} WON BABYYYY`}</h1>
          <button onClick={() => window.location.reload()}>New Game</button>
        </>
      ) : (
        <p>Hello World! current player: {gameState.currentPlayer}</p>
      )}
    </div>
  );
}

function getInitialGame() {
  let initialGameState = createGame();
  initialGameState = makeMove(initialGameState, 3);
  initialGameState = makeMove(initialGameState, 0);
  return initialGameState;
}

export default App;
