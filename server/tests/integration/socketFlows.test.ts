import { AddressInfo } from "net";
import request from "supertest";
import { io as Client, Socket } from "socket.io-client";
import { httpServer } from "../../src/server";
import prisma from "../../src/prismaClient";

jest.setTimeout(60000);

function waitForEvent<T = any>(socket: Socket, event: string, timeoutMs = 20000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off(event, handler as any);
      reject(new Error(`Timed out waiting for ${event}`));
    }, timeoutMs);

    const handler = (payload: T) => {
      clearTimeout(timeout);
      resolve(payload);
    };

    socket.once(event, handler as any);
  });
}

async function connectSocket(baseUrl: string, token: string) {
  return new Promise<Socket>((resolve, reject) => {
    const socket = Client(baseUrl, {
      auth: { token },
      transports: ["websocket"],
      forceNew: true,
    });

    const onError = (err: Error) => {
      socket.off("connect", onConnect);
      reject(err);
    };

    const onConnect = () => {
      socket.off("connect_error", onError);
      resolve(socket);
    };

    socket.once("connect", onConnect);
    socket.once("connect_error", onError);
  });
}

function sendTapSequence(socket: Socket, matchId: number, taps = 180) {
  let side: "left" | "right" = "left";
  for (let i = 0; i < taps; i += 1) {
    socket.emit("race_tap", { matchId, side });
    side = side === "left" ? "right" : "left";
  }
}

describe("integration: gameplay and challenges", () => {
  let serverInstance: any;
  let baseUrl: string;
  const sockets: Socket[] = [];

  beforeAll(async () => {
    await prisma.$queryRaw`SELECT 1`;
    serverInstance = httpServer.listen(0);
    const { port } = serverInstance.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    sockets.forEach((socket) => {
      try {
        socket.disconnect();
      } catch (error) {
        // ignore disconnect errors
      }
    });

    await new Promise<void>((resolve) => {
      serverInstance.close(() => resolve());
    });
  });

  it("handles auth, queue, race, challenges, and reconnect", async () => {
    const unique = Date.now();
    const userA = {
      email: `player_a_${unique}@example.com`,
      password: "Password123!",
      username: `playerA_${unique}`,
    };
    const userB = {
      email: `player_b_${unique}@example.com`,
      password: "Password123!",
      username: `playerB_${unique}`,
    };

    const registerA = await request(baseUrl)
      .post("/api/register")
      .send(userA)
      .expect(200);
    const registerB = await request(baseUrl)
      .post("/api/register")
      .send(userB)
      .expect(200);

    expect(registerA.body).toMatchObject({ user: { email: userA.email, username: userA.username } });
    expect(registerB.body).toMatchObject({ user: { email: userB.email, username: userB.username } });

    const loginA = await request(baseUrl)
      .post("/api/login")
      .send({ email: userA.email, password: userA.password })
      .expect(200);
    const loginB = await request(baseUrl)
      .post("/api/login")
      .send({ email: userB.email, password: userB.password })
      .expect(200);

    const tokenA = loginA.body.token;
    const tokenB = loginB.body.token;

    const refreshA = await request(baseUrl)
      .post("/api/auth/refresh")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);
    expect(refreshA.body).toHaveProperty("token");
    expect(refreshA.body.user).toMatchObject({ email: userA.email, username: userA.username });

    let socketA = await connectSocket(baseUrl, tokenA);
    let socketB = await connectSocket(baseUrl, tokenB);
    sockets.push(socketA, socketB);

    const queueJoinedA = waitForEvent(socketA, "queue_joined");
    const queueJoinedB = waitForEvent(socketB, "queue_joined");
    const matchStartA = waitForEvent<any>(socketA, "match_start");
    const matchStartB = waitForEvent<any>(socketB, "match_start");

    socketA.emit("join_queue");
    socketB.emit("join_queue");

    await Promise.all([queueJoinedA, queueJoinedB]);

    const matchA = await matchStartA;
    const matchB = await matchStartB;
    expect(matchA).toMatchObject({ matchId: expect.any(Number), roomName: expect.any(String) });
    expect(matchB.matchId).toBe(matchA.matchId);

    const matchId = matchA.matchId as number;
    const raceStartA = waitForEvent(socketA, "race_start");
    const raceStartB = waitForEvent(socketB, "race_start");
    const raceEndA = waitForEvent<any>(socketA, "race_end");
    const raceEndB = waitForEvent<any>(socketB, "race_end");

    socketA.emit("join_race", { matchId });
    socketB.emit("join_race", { matchId });

    await Promise.all([raceStartA, raceStartB]);
    sendTapSequence(socketA, matchId);
    sendTapSequence(socketB, matchId);

    const endPayloadA = await raceEndA;
    const endPayloadB = await raceEndB;
    expect(endPayloadA.matchId).toBe(matchId);
    expect(endPayloadB.matchId).toBe(matchId);

    const challengeSent = waitForEvent(socketA, "challenge_sent");
    const challengeReceived = waitForEvent<any>(socketB, "challenge_received");
    socketA.emit("send_challenge", { targetUsername: userB.username });

    const challengePayload = await challengeReceived;
    await challengeSent;
    expect(challengePayload).toMatchObject({ from: userA.username });

    const declineNotice = waitForEvent(socketA, "challenge_declined");
    socketB.emit("decline_challenge", { fromId: registerA.body.user.id });
    await declineNotice;

    const challengeReceived2 = waitForEvent<any>(socketB, "challenge_received");
    socketA.emit("send_challenge", { targetUsername: userB.username });
    await challengeReceived2;

    const matchStartA2 = waitForEvent<any>(socketA, "match_start");
    const matchStartB2 = waitForEvent<any>(socketB, "match_start");
    socketB.emit("accept_challenge", { fromId: registerA.body.user.id });

    const nextMatchA = await matchStartA2;
    await matchStartB2;
    const matchId2 = nextMatchA.matchId as number;

    const raceStartA2 = waitForEvent(socketA, "race_start");
    const raceStartB2 = waitForEvent(socketB, "race_start");
    socketA.emit("join_race", { matchId: matchId2 });
    socketB.emit("join_race", { matchId: matchId2 });
    await Promise.all([raceStartA2, raceStartB2]);

    socketB.disconnect();

    const reconnectedB = await connectSocket(baseUrl, tokenB);
    sockets.push(reconnectedB);
    const snapshot = waitForEvent<any>(reconnectedB, "race_snapshot");
    reconnectedB.emit("rejoin_race", { matchId: matchId2, token: tokenB });
    const snapshotPayload = await snapshot;
    expect(snapshotPayload.matchId).toBe(matchId2);

    sendTapSequence(socketA, matchId2);
    sendTapSequence(reconnectedB, matchId2);

    const finalRaceEnd = await waitForEvent<any>(socketA, "race_end");
    expect(finalRaceEnd.matchId).toBe(matchId2);
  });
});
