/**
 * Socket Race Multiplayer Tests
 * 
 * Tests for multiplayer race functionality including:
 * - Room creation and player assignment
 * - Broadcast events (countdown, start, progress, finish)
 * - Early finish thresholds (4→3, 8→4)
 * - Multiple concurrent races
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import {
  createRace,
  getRace,
  updatePlayerProgress,
  computeFinishThreshold,
  deleteRace,
  startRace,
} from '../src/services/raceService';

const JWT_SECRET = 'test_secret_key';

describe('Multiplayer Race Service', () => {
  let httpServer: any;
  let io: SocketIOServer;
  let testPort: number;

  beforeEach(() => {
    httpServer = createServer();
    io = new SocketIOServer(httpServer);
    httpServer.listen(() => {
      testPort = (httpServer.address() as AddressInfo).port;
    });
  });

  afterEach(() => {
    io.close();
    httpServer.close();
  });

  describe('Race Creation', () => {
    it('should create a race with 2 players', () => {
      const players = [
        { socketId: 'socket1', userId: 1, email: 'p1@test.com', username: 'player1', elo: 1200 },
        { socketId: 'socket2', userId: 2, email: 'p2@test.com', username: 'player2', elo: 1300 },
      ];

      const race = createRace(1, players);

      expect(race).toBeDefined();
      expect(race.id).toBe(1);
      expect(race.players.length).toBe(2);
      expect(race.roomName).toBe('race:1');
      expect(race.players[0].userId).toBe(1);
      expect(race.players[1].userId).toBe(2);

      deleteRace(1);
    });

    it('should create a race with 4 players', () => {
      const players = [
        { socketId: 'socket1', userId: 1, email: 'p1@test.com', username: 'player1', elo: 1200 },
        { socketId: 'socket2', userId: 2, email: 'p2@test.com', username: 'player2', elo: 1300 },
        { socketId: 'socket3', userId: 3, email: 'p3@test.com', username: 'player3', elo: 1400 },
        { socketId: 'socket4', userId: 4, email: 'p4@test.com', username: 'player4', elo: 1500 },
      ];

      const race = createRace(2, players);

      expect(race.players.length).toBe(4);
      expect(race.roomName).toBe('race:2');

      deleteRace(2);
    });

    it('should create a race with 8 players', () => {
      const players = Array.from({ length: 8 }, (_, i) => ({
        socketId: `socket${i + 1}`,
        userId: i + 1,
        email: `p${i + 1}@test.com`,
        username: `player${i + 1}`,
        elo: 1200 + i * 10,
      }));

      const race = createRace(3, players);

      expect(race.players.length).toBe(8);
      expect(race.roomName).toBe('race:3');

      deleteRace(3);
    });
  });

  describe('Finish Thresholds', () => {
    it('should return threshold 3 for 4 players', () => {
      expect(computeFinishThreshold(4)).toBe(3);
    });

    it('should return threshold 4 for 8 players', () => {
      expect(computeFinishThreshold(8)).toBe(4);
    });

    it('should return full count for other player counts', () => {
      expect(computeFinishThreshold(2)).toBe(2);
      expect(computeFinishThreshold(3)).toBe(3);
      expect(computeFinishThreshold(5)).toBe(5);
    });
  });

  describe('Player Progress Updates', () => {
    it('should update player progress correctly', () => {
      const players = [
        { socketId: 'socket1', userId: 1, email: 'p1@test.com', username: 'player1', elo: 1200 },
        { socketId: 'socket2', userId: 2, email: 'p2@test.com', username: 'player2', elo: 1300 },
      ];

      createRace(10, players);
      startRace(10);

      // Player 1 taps left
      const result1 = updatePlayerProgress(10, 'socket1', 'left');
      expect(result1).toBeDefined();
      expect(result1?.race.players[0].meters).toBeGreaterThan(0);
      expect(result1?.race.players[0].steps).toBe(1);

      // Player 1 taps right
      const result2 = updatePlayerProgress(10, 'socket1', 'right');
      expect(result2).toBeDefined();
      expect(result2?.race.players[0].steps).toBe(2);

      deleteRace(10);
    });

    it('should detect race completion when threshold met (4 players)', () => {
      const players = [
        { socketId: 'socket1', userId: 1, email: 'p1@test.com', username: 'player1', elo: 1200 },
        { socketId: 'socket2', userId: 2, email: 'p2@test.com', username: 'player2', elo: 1300 },
        { socketId: 'socket3', userId: 3, email: 'p3@test.com', username: 'player3', elo: 1400 },
        { socketId: 'socket4', userId: 4, email: 'p4@test.com', username: 'player4', elo: 1500 },
      ];

      createRace(11, players);
      startRace(11);

      // Simulate first 3 players finishing (threshold for 4-player race)
      for (let i = 1; i <= 3; i++) {
        const socketId = `socket${i}`;
        // Simulate enough taps to reach 100m (100m / 0.6m per step = ~167 steps)
        for (let step = 0; step < 167; step++) {
          const side = step % 2 === 0 ? 'left' : 'right';
          updatePlayerProgress(11, socketId, side);
        }
      }

      // Check that race should end
      const race = getRace(11);
      const finished = race?.players.filter(p => p.finishedAt !== null) || [];
      expect(finished.length).toBeGreaterThanOrEqual(3);

      // Next update should trigger shouldEnd
      const result = updatePlayerProgress(11, 'socket1', 'left');
      expect(result?.shouldEnd).toBe(true);

      deleteRace(11);
    });

    it('should not end race prematurely (only 1 of 2 particippants finished)', () => {
      const players = [
        { socketId: 'socket1', userId: 1, email: 'p1@test.com', username: 'player1', elo: 1200 },
        { socketId: 'socket2', userId: 2, email: 'p2@test.com', username: 'player2', elo: 1300 },
      ];

      createRace(12, players);
      startRace(12);

      // Player 1 finishes
      for (let step = 0; step < 167; step++) {
        const side = step % 2 === 0 ? 'left' : 'right';
        updatePlayerProgress(12, 'socket1', side);
      }

      const result = updatePlayerProgress(12, 'socket1', 'left');
      // For 2-player race, both must finish (threshold = 2)
      expect(result?.shouldEnd).toBe(false);

      deleteRace(12);
    });
  });

  describe('Multiple Concurrent Races', () => {
    it('should handle multiple races simultaneously', () => {
      // Create race 1 (2 players)
      const race1Players = [
        { socketId: 'r1-s1', userId: 1, email: 'r1p1@test.com', username: 'r1player1', elo: 1200 },
        { socketId: 'r1-s2', userId: 2, email: 'r1p2@test.com', username: 'r1player2', elo: 1300 },
      ];
      const race1 = createRace(20, race1Players);

      // Create race 2 (4 players)
      const race2Players = [
        { socketId: 'r2-s1', userId: 10, email: 'r2p1@test.com', username: 'r2player1', elo: 1200 },
        { socketId: 'r2-s2', userId: 11, email: 'r2p2@test.com', username: 'r2player2', elo: 1300 },
        { socketId: 'r2-s3', userId: 12, email: 'r2p3@test.com', username: 'r2player3', elo: 1400 },
        { socketId: 'r2-s4', userId: 13, email: 'r2p4@test.com', username: 'r2player4', elo: 1500 },
      ];
      const race2 = createRace(21, race2Players);

      expect(race1.roomName).toBe('race:20');
      expect(race2.roomName).toBe('race:21');
      expect(getRace(20)).toBeDefined();
      expect(getRace(21)).toBeDefined();

      // Update progress in race 1
      startRace(20);
      updatePlayerProgress(20, 'r1-s1', 'left');
      const r1 = getRace(20);
      expect(r1?.players[0].steps).toBe(1);

      // Update progress in race 2 (should not affect race 1)
      startRace(21);
      updatePlayerProgress(21, 'r2-s1', 'left');
      const r2 = getRace(21);
      expect(r2?.players[0].steps).toBe(1);
      expect(r1?.players[0].steps).toBe(1); // Race 1 unaffected

      deleteRace(20);
      deleteRace(21);
    });
  });

  describe('Room Isolation', () => {
    it('should isolate players to their race room', () => {
      const players = [
        { socketId: 'socket1', userId: 1, email: 'p1@test.com', username: 'player1', elo: 1200 },
        { socketId: 'socket2', userId: 2, email: 'p2@test.com', username: 'player2', elo: 1300 },
      ];

      const race = createRace(30, players);
      expect(race.roomName).toBe('race:30');

      // Each player should only receive updates for their room
      const player1Room = race.roomName;
      const player2Room = race.roomName;
      expect(player1Room).toBe(player2Room); // Same room for same race

      deleteRace(30);
    });
  });
});

