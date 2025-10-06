import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import jwtDecode from "jwt-decode";
import { io, Socket } from "socket.io-client";

const SERVER = "http://localhost:4000"; // change for device use (use machine IP)

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const socketRef = useRef<Socket | null>(null);
  const [matchId, setMatchId] = useState<number | null>(null);
  const [opp, setOpp] = useState<string | null>(null);
  const [meters, setMeters] = useState<{ [k: string]: number }>({});

  useEffect(() => {
    SecureStore.getItemAsync("token").then((t) => {
      if (t) setToken(t);
    });
  }, []);

  useEffect(() => {
    if (!token) return;
    const sock = io(SERVER, { auth: { token } });
    socketRef.current = sock;
    sock.on("connect", () => setStatus("connected"));
    sock.on("queue_joined", () => setStatus("in_queue"));
    sock.on("queue_left", () => setStatus("idle"));
    sock.on("match_start", (payload: any) => {
      setMatchId(payload.matchId);
      setOpp(payload.opponent);
      setMeters({});
      setStatus("in_match");
    });
    sock.on("race_update", (state: any) => {
      const m: any = {};
      state.players.forEach((p: any) => (m[p.userId] = p.meters));
      setMeters(m);
    });
    sock.on("match_end", (payload: any) => {
      setStatus("match_end");
      // show result briefly
      setTimeout(() => {
        setMatchId(null);
        setStatus("idle");
      }, 3000);
    });
    return () => {
      sock.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  async function registerOrLogin(path: "register" | "login") {
    try {
      const res = await fetch(`${SERVER}/api/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "auth failed");
      await SecureStore.setItemAsync("token", json.token);
      setToken(json.token);
    } catch (err: any) {
      alert(err.message);
    }
  }

  function joinQueue() {
    socketRef.current?.emit("join_queue");
  }
  function leaveQueue() {
    socketRef.current?.emit("leave_queue");
  }

  // race tap handlers
  const lastSide = useRef<"left" | "right" | null>(null);
  function tap(side: "left" | "right") {
    if (!socketRef.current || !matchId) return;
    socketRef.current.emit("tap", { matchId, side, ts: Date.now() });
    lastSide.current = side;
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.h1}>Sprint100 — login / register</Text>
        <TextInput placeholder="email" value={email} onChangeText={setEmail} style={styles.input} />
        <TextInput placeholder="password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
        <Button title="Register" onPress={() => registerOrLogin("register")} />
        <View style={{ height: 10 }} />
        <Button title="Login" onPress={() => registerOrLogin("login")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.h1}>Sprint100 — {status}</Text>
      {status === "idle" && (
        <>
          <Button title="Join Queue" onPress={joinQueue} />
        </>
      )}
      {status === "in_queue" && <Button title="Leave Queue" onPress={leaveQueue} />}

      {status === "in_match" && (
        <>
          <Text>Opponent: {opp}</Text>
          <View style={styles.raceContainer}>
            <TouchableOpacity style={styles.half} onPress={() => tap("left")}>
              <Text>LEFT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.half} onPress={() => tap("right")}>
              <Text>RIGHT</Text>
            </TouchableOpacity>
          </View>
          <Text>Progress:</Text>
          {Object.entries(meters).map(([u, m]) => (
            <Text key={u}>
              {u}: {Math.round(Number(m))}m
            </Text>
          ))}
        </>
      )}

      {status === "match_end" && <Text>Match ended — showing results briefly</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 22, marginBottom: 12 },
  input: { borderWidth: 1, padding: 8, marginBottom: 8 },
  raceContainer: { flexDirection: "row", height: 300, marginTop: 12 },
  half: { flex: 1, justifyContent: "center", alignItems: "center", borderWidth: 1, margin: 4 },
});
