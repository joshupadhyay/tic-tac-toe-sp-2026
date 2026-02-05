// Tests for new iteration of Tic Tac Toe with multiplayer server support

// when we call /newgame, we should get a back a new game uuid and initial game state

// when we call /move, we should expect a uuid as an input. if the uuid is invalid, we get an error back.

// if the uuid is valid, we get back the updated game state after the move is made.

// if we create a new game, we should expect the server to store a fresh game state with that uuid as the PK (key) of Map

// when we call /game/${gameID} for an existing game, we should get the game state back

// if we make a move on a particular game, we should expect the server to update the game state for that particular game only.

// on the frontend, we will have a "lobby" with a list of games

// when we call /listgames we should return a list of games (list length should be equal to db size)

// We will add a back button. If the back button is clicked, we should submit a request to the homepage.

// For the GameState, we should expect an optional field called "inActive" which is a boolean. If true, the game is inactive (deleted).

// When we call DELETE /game/${gameID}, we should mark that game as inactive in the server database (Map).

// When we call GET /listgames, we should not return inactive games.

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, GAME_MAP, DEFAULT_GAME_STATE } from "./server/server";

beforeEach(() => {
  // Clear the database before each test for isolation
  GAME_MAP.clear();
});

// -----------------------------------------
// newGame()

// -----------------------------------------
describe("POST /newgame", () => {
  it("returns a new game state with a new uuid", async () => {
    const res = await request(app).post("/newgame");

    expect(res.status).toBe(200);
    expect(res.body.board).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
    expect(res.body.currentPlayer).toBe("X");
    expect(res.body.gameID).toBeDefined();
    expect(res.body.gameID).toHaveLength(36); // UUID length
  });
});

describe("POST /move/:gameID", () => {
  it("makes a move on the server and returns updated game state", async () => {
    // First create a game
    const newGameRes = await request(app).post("/newgame");
    const gameID = newGameRes.body.gameID;

    // Then make a move
    const res = await request(app).post(`/move/${gameID}`).send({ index: 0 });

    expect(res.status).toBe(200);
    expect(res.body.board[0]).toBe("X");
    expect(res.body.currentPlayer).toBe("O");
    expect(res.body.gameID).toBe(gameID);
  });

  it("returns 404 for invalid game ID", async () => {
    const res = await request(app)
      .post("/move/invalid-uuid")
      .send({ index: 0 });

    expect(res.status).toBe(404);
  });
});

describe("GET /listgames", () => {
  it("returns empty array when no games exist", async () => {
    const res = await request(app).get("/listgames");

    expect(res.status).toBe(200);
    expect(res.body.games).toEqual([]);
  });
});

describe("all active games are listed", () => {
  it("lists only active games, not inactive ones", async () => {
    const inactive_uuid = crypto.randomUUID();

    const active_uuid = crypto.randomUUID();

    // Add an inactive game directly to the map
    GAME_MAP.set(inactive_uuid, { ...DEFAULT_GAME_STATE, inActive: true });

    // Add an active game directly to the map
    GAME_MAP.set(active_uuid, { ...DEFAULT_GAME_STATE });

    const res = await request(app).get("/listgames");

    expect(res.status).toBe(200);
    expect(res.body.games).toContain(active_uuid);
    expect(res.body.games).not.toContain(inactive_uuid);
    expect(res.body.games).toHaveLength(1);
  });
});

describe("DELETE /game/:gameID", () => {
  it("deletes a game from the database", async () => {
    // Create a game first
    const newGameRes = await request(app).post("/newgame");
    const gameID = newGameRes.body.gameID;

    // Verify it exists
    expect(GAME_MAP.has(gameID)).toBe(true);

    // Delete it
    const deleteRes = await request(app).delete(`/game/${gameID}`);
    expect(deleteRes.status).toBe(200);

    // Verify it's gone
    expect(GAME_MAP.has(gameID)).toBe(false);
  });

  it("returns 404 for non-existent game", async () => {
    const res = await request(app).delete("/game/non-existent-id");
    expect(res.status).toBe(404);
  });
});
