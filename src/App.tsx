import { useEffect, useState } from "react";
import { createGame, getWinner, makeMove } from "./tic-tac-toe";

import "./Table.css";

function App() {
  let [gameState, setGameState] = useState(getInitialGame());

  // TODO: display the gameState, and call `makeMove` when a player clicks a button
  return (
    <div>
      <div className="board">
        {gameState.board.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => {
              setGameState(makeMove(gameState, idx));
            }}
          >
            {cell}
          </div>
        ))}
      </div>
      {getWinner(gameState) != null ? (
        <>
          <h1>{`${getWinner(gameState)} WON BABYYYY`}</h1>
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
