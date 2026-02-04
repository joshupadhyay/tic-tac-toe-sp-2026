import type { GameState } from "../types";

export interface TableProps extends GameState {
  onCellClick: (idx: number) => void;
  winningPositions?: number[]; // only when a winner exists
}

export function TicTacToeTable(props: TableProps) {
  return (
    <div className="grid grid-cols-3 col-span-3 gap-0.5 w-[40vw] mx-auto ">
      {props.board.map((cell, idx) => (
        <div
          className={`bg-gray-200 border-2 rounded-sm border-solid items-center justify-center flex text-4xl aspect-square ${cell === "O" ? "border-red-700" : cell === "X" ? "border-blue-700" : "border-grey-700"} ${props.winningPositions?.includes(idx) ? "bg-yellow-200 animate-ping" : ""}`}
          key={idx}
          onClick={() => props.onCellClick(idx)}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}
