import type { GameState } from "./types";
import type { UUID } from "crypto";

export async function fetchNewGame(): Promise<GameState> {
  const response = await fetch("/api/newgame", {
    method: "POST",
  });
  const data = await response.json();
  return data;
}

/**
 *
 * @returns new GameState with gameID
 */
export async function newGameCall(): Promise<GameState> {
  const response = await fetch("/api/newgame", {
    method: "GET",
  });

  const data = await response.json();

  return data;
}

export async function moveAPICall(gameId: UUID, idx: number) {
  const resp = await fetch(`/api/move/${gameId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ index: idx }),
  });

  return resp.json();
}

export async function getAllGames() {
  const resp = await fetch(`/api/listgames`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await resp.json();
}

export async function toLobby() {
  // claude I want to navigate to the homepage.
  const resp = await fetch("/");

  return resp.json();
}

/**
 *
 * @returns list of gameIDs for all active games.
 */

export async function getActiveGames() {
  const resp = await fetch("/api/listgames");

  const data: Pick<GameState, "gameId">[] = await resp.json();

  return data;
}

export async function getGame(gameId: UUID) {
  const resp = await fetch(`/api/game/${gameId}`);

  return await resp.json();
}
