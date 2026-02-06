import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { GameState } from "../types";
import { TicTacToeTable } from "./Table";
import { moveAPICall } from "../App";
import type { WinnerData } from "../tic-tac-toe";
import type { UUID } from "crypto";

export interface IGamePageProps {
  winner?: WinnerData;
}

export function GamePage(gameprops: IGamePageProps) {
  const { gameId } = useParams();
  const [gameState, setGameState] = useState<GameState>();

  // we want to open a websocket for each instance of the game, on the client side.

  const GAME_ENDPOINT = `/api/game/${gameId}`;

  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProtocol}//${window.location.host}/api/game/${gameId}`;

  useEffect(() => {
    const res = fetch(GAME_ENDPOINT)
      .then((res) => res.json())
      .then((data) => setGameState(data.gameState));

    // Create WebSocket connection.
    const socket = new WebSocket(wsUrl);

    // Connection opened
    socket.addEventListener("open", (event) => {
      socket.send("Hello Server!");
      console.log(`websocket is ${socket.url}`);
    });
  }, [gameId]);

  // Don't render until data is loaded
  // This can be fixed with useFetcher, or useLoaderData, but I'll ignore for now..
  if (!gameState) {
    return <div>Loading...</div>;
  }

  async function updateTable(id: UUID, idx: number) {
    let newState = await moveAPICall(id, idx);
    setGameState(newState);
  }

  return (
    <div>
      <TicTacToeTable
        board={gameState.board}
        currentPlayer={gameState.currentPlayer}
        // we only need to expose idx in Table, as we pass gameId right here...
        onCellClick={(idx: number) => {
          updateTable(gameId as UUID, idx);
        }}
        winningPositions={gameprops.winner?.winningPositions}
      />
      <button>
        <Link to="/"> Back</Link>
      </button>
    </div>
  );
}
