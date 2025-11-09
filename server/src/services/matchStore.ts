import prisma from "../prismaClient";

const QUEUE_STATUS = { PENDING: "PENDING", MATCHED: "MATCHED", CANCELLED: "CANCELLED" } as const;
const CHALLENGE_STATUS = { PENDING: "PENDING", ACCEPTED: "ACCEPTED", DECLINED: "DECLINED", EXPIRED: "EXPIRED" } as const;
const MATCH_STATUS = { QUEUED: "QUEUED", IN_PROGRESS: "IN_PROGRESS", COMPLETED: "COMPLETED", CANCELLED: "CANCELLED" } as const;

type PrismaTransactionalClient = any;

function getClient(client?: PrismaTransactionalClient): PrismaTransactionalClient {
  return (client ?? prisma) as PrismaTransactionalClient;
}

export async function enqueueUser(
  userId: number,
  client?: PrismaTransactionalClient
) {
  const db = getClient(client);

  return db.matchQueue.upsert({
    where: { userId },
    update: {
      status: QUEUE_STATUS.PENDING,
      matchId: null,
      updatedAt: new Date(),
    },
    create: {
      userId,
      status: QUEUE_STATUS.PENDING,
    },
    include: {
      user: true,
    },
  });
}

export async function dequeueUser(
  userId: number,
  client?: PrismaTransactionalClient
) {
  const db = getClient(client);

  await db.matchQueue.updateMany({
    where: { userId },
    data: {
      status: QUEUE_STATUS.CANCELLED,
      matchId: null,
      updatedAt: new Date(),
    },
  });
}

export async function getNextMatchCandidates(
  take = 2,
  client?: PrismaTransactionalClient
) {
  const db = getClient(client);

  return db.matchQueue.findMany({
    where: { status: QUEUE_STATUS.PENDING },
    orderBy: { createdAt: "asc" },
    take,
    include: { user: true },
  });
}

export async function createChallenge(
  challengerId: number,
  opponentId: number,
  client?: PrismaTransactionalClient
) {
  const db = getClient(client);

  // Expire any previous pending challenge between the same players
  await db.challenge.updateMany({
    where: {
      challengerId,
      opponentId,
      status: CHALLENGE_STATUS.PENDING,
    },
    data: {
      status: CHALLENGE_STATUS.EXPIRED,
    },
  });

  return db.challenge.create({
    data: {
      challengerId,
      opponentId,
      status: CHALLENGE_STATUS.PENDING,
    },
  });
}

export async function acceptChallenge(
  challengerId: number,
  opponentId: number,
  client?: PrismaTransactionalClient
) {
  const db = getClient(client);

  return db.$transaction(async (trx: any) => {
    const challenge = await trx.challenge.findFirst({
      where: {
        challengerId,
        opponentId,
        status: CHALLENGE_STATUS.PENDING,
      },
      include: {
        challenger: true,
        opponent: true,
      },
    });

    if (!challenge) {
      return null;
    }

    const match = await trx.match.create({
      data: {
        status: MATCH_STATUS.IN_PROGRESS,
        players: {
          create: [
            { userId: challengerId },
            { userId: opponentId },
          ],
        },
      },
      include: {
        players: {
          include: {
            user: true,
          },
        },
      },
    });

    await trx.challenge.update({
      where: { id: challenge.id },
      data: {
        status: CHALLENGE_STATUS.ACCEPTED,
        matchId: match.id,
      },
    });

    return { challenge, match };
  });
}

export async function declineChallenge(
  challengerId: number,
  opponentId: number,
  client?: PrismaTransactionalClient
) {
  const db = getClient(client);

  await db.challenge.updateMany({
    where: {
      challengerId,
      opponentId,
      status: CHALLENGE_STATUS.PENDING,
    },
    data: {
      status: CHALLENGE_STATUS.DECLINED,
    },
  });
}

export async function createMatchFromQueue(
  userIds: number[],
  client?: PrismaTransactionalClient
) {
  if (userIds.length === 0) {
    throw new Error("No userIds supplied to createMatchFromQueue");
  }

  const db = getClient(client);

  return db.$transaction(async (trx: any) => {
    const match = await trx.match.create({
      data: {
        status: MATCH_STATUS.IN_PROGRESS,
        players: {
          create: userIds.map((userId) => ({ userId })),
        },
      },
      include: {
        players: {
          include: {
            user: true,
          },
        },
      },
    });

    await trx.matchQueue.updateMany({
      where: {
        userId: { in: userIds },
      },
      data: {
        status: QUEUE_STATUS.MATCHED,
        matchId: match.id,
        updatedAt: new Date(),
      },
    });

    return match;
  });
}

export async function linkSocketToMatch(
  matchId: number,
  userId: number,
  socketId: string,
  client?: PrismaTransactionalClient
) {
  const db = getClient(client);

  await db.matchPlayer.updateMany({
    where: {
      matchId,
      userId,
    },
    data: {
      socketId,
    },
  });
}

export interface PersistedResultPlayer {
  userId: number;
  finishPosition?: number | null;
  timeMs?: number | null;
  deltaElo?: number | null;
}

export async function persistResult(
  matchId: number,
  players: PersistedResultPlayer[],
  status: string = MATCH_STATUS.COMPLETED,
  client?: PrismaTransactionalClient
) {
  const db = getClient(client);

  await Promise.all(
    players.map((player) =>
      db.matchPlayer.updateMany({
        where: {
          matchId,
          userId: player.userId,
        },
        data: {
          finishPosition: player.finishPosition ?? null,
          timeMs: player.timeMs ?? null,
          deltaElo: player.deltaElo ?? null,
        },
      })
    )
  );

  await db.match.update({
    where: { id: matchId },
    data: {
      status,
    },
  });
}
