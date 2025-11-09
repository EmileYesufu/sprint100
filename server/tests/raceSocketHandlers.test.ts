/**
 * Tests for socket race handlers to ensure tap parity and reconnect flow.
 */

process.env.SKIP_DB_CLEANUP = "true";

import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import {
  createRace,
  deleteRace,
  startRace,
  getRace,
} from "../src/services/raceService";
import {
  handleRaceTap,
  handleRaceRejoin,
  type RaceSocketContext,
} from "../src/socket/raceHandlers";
import type { Socket } from "socket.io";
import type { Server as SocketIOServer } from "socket.io";

const TEST_JWT_SECRET = "test-secret";

const createMockSocket = (id: string) => {
  const emit = jest.fn();
  const join = jest.fn();
  const to = jest.fn(() => ({ emit: jest.fn() }));

  return {
    id,
    emit,
    join,
    to,
  } as unknown as Socket;
};

const createMockIo = () => {
  const roomEmit = jest.fn();
  const to = jest.fn(() => ({ emit: roomEmit }));

  return {
    to,
  } as unknown as SocketIOServer;
};

describe("socket race handlers", () => {
  let context: RaceSocketContext;
  let ioMock: SocketIOServer;
  let matches: Map<number, any>;
  let userSockets: Map<number, string>;
  const endMatchMock = jest.fn();

  beforeEach(() => {
    ioMock = createMockIo();
    matches = new Map();
    userSockets = new Map();
    context = {
      io: ioMock,
      matches,
      userSockets,
      jwtSecret: TEST_JWT_SECRET,
      endMatch: endMatchMock as unknown as RaceSocketContext["endMatch"],
    };
    jest.clearAllMocks();
    endMatchMock.mockReset();
  });

  afterEach(() => {
    matches.clear();
    userSockets.clear();
  });

  it("prevents double progress on repeated same-side taps via race_tap", () => {
    const matchId = 501;
    const players = [
      { socketId: "socket-1", userId: 1, email: "runner1@test.com", username: "runner1", elo: 1200 },
      { socketId: "socket-2", userId: 2, email: "runner2@test.com", username: "runner2", elo: 1250 },
    ];

    createRace(matchId, players);
    startRace(matchId);

    const socket = createMockSocket("socket-1");

    handleRaceTap(context, socket, { matchId, side: "left" });
    const afterFirst = getRace(matchId);
    expect(afterFirst?.players.find((p) => p.userId === 1)?.steps).toBe(1);

    handleRaceTap(context, socket, { matchId, side: "left" });
    const afterSecond = getRace(matchId);
    expect(afterSecond?.players.find((p) => p.userId === 1)?.steps).toBe(1);

    handleRaceTap(context, socket, { matchId, side: "right" });
    const afterThird = getRace(matchId);
    expect(afterThird?.players.find((p) => p.userId === 1)?.steps).toBe(2);

    deleteRace(matchId);
  });

  it("reassigns socket on rejoin and emits race snapshot", () => {
    const matchId = 777;
    const players = [
      { socketId: "socket-old", userId: 1, email: "rejoin@test.com", username: "rejoiner", elo: 1300 },
      { socketId: "socket-opponent", userId: 2, email: "other@test.com", username: "rival", elo: 1280 },
    ];

    const race = createRace(matchId, players);
    startRace(matchId);
    userSockets.set(1, "socket-old");

    const newSocket = createMockSocket("socket-new");
    const token = jwt.sign(
      { userId: 1, email: "rejoin@test.com" },
      TEST_JWT_SECRET,
      { expiresIn: "1h" }
    );

    handleRaceRejoin(context, newSocket, { matchId, token });

    expect(newSocket.join).toHaveBeenCalledWith(race.roomName);
    expect(userSockets.get(1)).toBe("socket-new");
    expect(getRace(matchId)?.players.find((p) => p.userId === 1)?.socketId).toBe("socket-new");

    const snapshotEmit = (newSocket as any).emit as jest.Mock;
    expect(snapshotEmit).toHaveBeenCalledWith(
      "race_snapshot",
      expect.objectContaining({
        matchId,
        players: expect.any(Array),
      })
    );

    deleteRace(matchId);
  });
});

