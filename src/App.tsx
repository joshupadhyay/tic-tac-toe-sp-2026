import { useState } from "react";
import { createGame, getWinner, makeMove } from "./tic-tac-toe";
import "./index.css";
import { TicTacToeTable } from "./components/Table";
import { NewGameButton } from "./components/NewGame";

function App() {
  let [gameState, setGameState] = useState(getInitialGame());

  let winner = getWinner(gameState);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-lg text-shadow-2xs">Tic Tac Toe</div>
      <div className="text-justify-left">
        ruin friendships and familial ties
      </div>
      <div>
        <TicTacToeTable
          board={gameState.board}
          currentPlayer={gameState.currentPlayer}
          onCellClick={(idx) => {
            if (winner) return;
            setGameState(makeMove(gameState, idx));
          }}
        />
      </div>
      {winner ? null : <p>current player: {gameState.currentPlayer}</p>}
      <NewGameButton winner={winner} />
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
