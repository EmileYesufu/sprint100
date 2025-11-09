/**
 * Race Screen with Network Handling
 * Enhanced race interface with network disconnect handling and reconnection
 * Uses the new useRace hook for better state management
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { useRace } from "@/hooks/useRace";
import { NetworkDisconnectModal } from "@/components/NetworkDisconnectModal";
import { metersToPct } from "@/utils/formatting";
import { OpponentPanel } from "@/screens/Race/components/OpponentPanel";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RaceStackParamList } from "@/navigation/AppNavigator";

type Props = NativeStackScreenProps<RaceStackParamList, "Race">;

const { width, height } = Dimensions.get("window");

export default function RaceScreenWithNetworkHandling({ route, navigation }: Props) {
  const { matchId, opponent } = route.params;
  const { user } = useAuth();
  const { raceState, networkState, handleTap, dismissDisconnectModal, forceReconnect } = useRace(
    String(matchId),
    opponent
  );

  const handleReturnHome = () => {
    navigation.navigate("Queue");
  };

  const handleRerun = () => {
    navigation.navigate("Queue");
  };

  const renderCountdown = () => {
    if (raceState.countdown === null) return null;
    
    return (
      <View style={styles.countdownOverlay}>
        <Text style={styles.countdownText}>
          {raceState.countdown === 0 ? "GO!" : raceState.countdown}
        </Text>
      </View>
    );
  };

  const renderRaceProgress = () => {
    if (raceState.status !== "racing" && raceState.status !== "finished") return null;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${metersToPct(raceState.myMeters)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {raceState.myMeters.toFixed(1)}m
        </Text>
      </View>
    );
  };

  const renderOpponentProgress = () => {
    if (raceState.status !== "racing" && raceState.status !== "finished") return null;
    
    return (
      <View style={styles.opponentContainer}>
        <Text style={styles.opponentName}>{opponent.username ?? opponent.email ?? "Opponent"}</Text>
        <View style={styles.opponentProgressBar}>
          <View 
            style={[
              styles.opponentProgressFill, 
              { width: `${metersToPct(raceState.opponentMeters)}%` }
            ]} 
          />
        </View>
        <Text style={styles.opponentMeters}>
          {raceState.opponentMeters.toFixed(1)}m
        </Text>
      </View>
    );
  };

  const renderTapButtons = () => {
    if (raceState.status !== "racing" || networkState.showDisconnectModal) return null;
    
    return (
      <View style={styles.tapContainer}>
        <TouchableOpacity
          style={[styles.tapButton, styles.leftButton]}
          onPress={() => handleTap("left")}
          disabled={!networkState.isConnected}
        >
          <Text style={styles.tapButtonText}>LEFT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tapButton, styles.rightButton]}
          onPress={() => handleTap("right")}
          disabled={!networkState.isConnected}
        >
          <Text style={styles.tapButtonText}>RIGHT</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderResult = () => {
    if (raceState.status !== "finished" || !raceState.result) return null;
    const placement = raceState.result.players?.findIndex(p => p.userId === user?.id) ?? -1;
    const positionText = placement >= 0 ? `${placement + 1}${getPositionSuffix(placement + 1)}` : "";
    return (
      <View style={styles.resultOverlay}>
        <Text style={styles.resultTitle}>Race Complete!</Text>
        <Text style={styles.resultText}>
          {positionText ? `You finished ${positionText}` : "Results received"}
        </Text>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleReturnHome}
        >
          <Text style={styles.homeButtonText}>Return Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.homeButton, styles.secondaryButton]}
          onPress={handleRerun}
        >
          <Text style={styles.homeButtonText}>Rerun</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.quitButton} onPress={handleReturnHome}>
            <Text style={styles.quitButtonText}>Quit</Text>
          </TouchableOpacity>
        </View>
        {/* Race Content */}
        <View style={styles.raceContent}>
          <OpponentPanel players={raceState.players} currentUserId={user?.id} style={styles.opponentPanelWrapper} />
          {renderCountdown()}
          {renderRaceProgress()}
          {renderOpponentProgress()}
          {renderTapButtons()}
          {renderResult()}
        </View>
        
        {/* Network Disconnect Modal */}
        <NetworkDisconnectModal
          visible={networkState.showDisconnectModal}
          isReconnecting={networkState.isReconnecting}
          onDismiss={dismissDisconnectModal}
          onForceReconnect={forceReconnect}
        />
      </View>
    </SafeAreaView>
  );
}

function getPositionSuffix(position: number): string {
  if (position % 100 >= 11 && position % 100 <= 13) return "th";
  switch (position % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A1628",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: "flex-start",
  },
  quitButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quitButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  raceContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  opponentPanelWrapper: {
    marginBottom: 16,
  },
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  countdownText: {
    fontSize: 72,
    fontWeight: "bold",
    color: "white",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 40,
  },
  progressBar: {
    height: 20,
    backgroundColor: "#e1e5e9",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 10,
  },
  progressText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  opponentContainer: {
    width: "100%",
    marginBottom: 60,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  opponentProgressBar: {
    height: 16,
    backgroundColor: "#e1e5e9",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  opponentProgressFill: {
    height: "100%",
    backgroundColor: "#34C759",
    borderRadius: 8,
  },
  opponentMeters: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  tapContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 400,
    gap: 20,
  },
  tapButton: {
    flex: 1,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftButton: {
    backgroundColor: "#FF3B30",
  },
  rightButton: {
    backgroundColor: "#007AFF",
  },
  tapButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  resultOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  resultText: {
    fontSize: 20,
    color: "white",
    marginBottom: 32,
  },
  homeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 12,
    minWidth: 180,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#34C759",
  },
  homeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
