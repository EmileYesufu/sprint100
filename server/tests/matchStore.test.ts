import {
  enqueueUser,
  dequeueUser,
  getNextMatchCandidates,
  createChallenge,
  acceptChallenge,
  declineChallenge,
  createMatchFromQueue,
  linkSocketToMatch,
  persistResult,
  PersistedResultPlayer,
} from "../src/services/matchStore";
const ChallengeStatus = { PENDING: "PENDING", ACCEPTED: "ACCEPTED", DECLINED: "DECLINED", EXPIRED: "EXPIRED" } as const;
const MatchStatus = { IN_PROGRESS: "IN_PROGRESS", COMPLETED: "COMPLETED" } as const;
const QueueStatus = { PENDING: "PENDING", MATCHED: "MATCHED", CANCELLED: "CANCELLED" } as const;

describe("matchStore repository", () => {
  const createMockClient = () => {
    const mock: any = {
      matchQueue: {
        upsert: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      challenge: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({ id: 1 }),
        findFirst: jest.fn().mockResolvedValue({
          id: 10,
          challengerId: 1,
          opponentId: 2,
          status: ChallengeStatus.PENDING,
          challenger: {},
          opponent: {},
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      match: {
        create: jest.fn().mockResolvedValue({
          id: 99,
          players: [
            { id: 1, userId: 1, user: { id: 1 } },
            { id: 2, userId: 2, user: { id: 2 } },
          ],
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      matchPlayer: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      $transaction: jest.fn((fn: any) => fn(mock)),
    };
    return mock;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("enqueueUser upserts queue entry", async () => {
    const mock = createMockClient();
    await enqueueUser(1, mock);
    expect(mock.matchQueue.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 1 },
        update: expect.objectContaining({ status: QueueStatus.PENDING }),
        create: expect.objectContaining({ userId: 1 }),
      })
    );
  });

  it("dequeueUser marks queue entry as cancelled", async () => {
    const mock = createMockClient();
    await dequeueUser(2, mock);
    expect(mock.matchQueue.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 2 },
        data: expect.objectContaining({ status: QueueStatus.CANCELLED }),
      })
    );
  });

  it("getNextMatchCandidates queries pending entries", async () => {
    const mock = createMockClient();
    await getNextMatchCandidates(2, mock);
    expect(mock.matchQueue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: QueueStatus.PENDING },
        take: 2,
      })
    );
  });

  it("createChallenge creates a pending challenge", async () => {
    const mock = createMockClient();
    await createChallenge(1, 2, mock);
    expect(mock.challenge.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ challengerId: 1, opponentId: 2 }),
      })
    );
  });

  it("acceptChallenge creates match and links challenge", async () => {
    const mock = createMockClient();
    const result = await acceptChallenge(1, 2, mock);
    expect(mock.$transaction).toHaveBeenCalled();
    expect(mock.match.create).toHaveBeenCalled();
    expect(mock.challenge.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({ status: ChallengeStatus.ACCEPTED }),
      })
    );
    expect(result?.match.id).toBe(99);
  });

  it("declineChallenge marks record declined", async () => {
    const mock = createMockClient();
    await declineChallenge(1, 2, mock);
    expect(mock.challenge.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: ChallengeStatus.DECLINED }),
      })
    );
  });

  it("createMatchFromQueue creates match and updates queue entries", async () => {
    const mock = createMockClient();
    const match = await createMatchFromQueue([1, 2], mock);
    expect(mock.$transaction).toHaveBeenCalled();
    expect(mock.match.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: MatchStatus.IN_PROGRESS }),
      })
    );
    expect(mock.matchQueue.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: { in: [1, 2] } }),
      })
    );
    expect(match.id).toBe(99);
  });

  it("linkSocketToMatch stores socket identifier", async () => {
    const mock = createMockClient();
    await linkSocketToMatch(99, 1, "socket-123", mock);
    expect(mock.matchPlayer.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { matchId: 99, userId: 1 },
        data: { socketId: "socket-123" },
      })
    );
  });

  it("persistResult updates match players and status", async () => {
    const mock = createMockClient();
    const players: PersistedResultPlayer[] = [
      { userId: 1, finishPosition: 1, timeMs: 12000, deltaElo: 25 },
    ];
    await persistResult(77, players, MatchStatus.COMPLETED, mock);
    expect(mock.matchPlayer.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { matchId: 77, userId: 1 },
        data: expect.objectContaining({ finishPosition: 1 }),
      })
    );
    expect(mock.match.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 77 },
        data: { status: MatchStatus.COMPLETED },
      })
    );
  });
});
