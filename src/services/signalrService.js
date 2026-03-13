import * as signalR from "@microsoft/signalr";
import { BACKEND_URL } from "./axios.customize";

let connection = null;
let isConnecting = false;

/**
 * Build and return SignalR hub connection.
 * Reuses existing connection if already created.
 */
export const getConnection = () => {
  if (connection) return connection;

  const hubUrl = `${BACKEND_URL}/hubs/notifications`;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => localStorage.getItem("access_token") || "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
};

/**
 * Start the SignalR connection.
 * Uses AbortController to allow cancellation during negotiation.
 * @param {AbortSignal} signal - optional abort signal to cancel during negotiation
 */
export const startConnection = async (signal) => {
  if (isConnecting) return;

  const conn = getConnection();
  if (conn.state !== signalR.HubConnectionState.Disconnected) return;

  isConnecting = true;
  try {
    // Check if already aborted before starting
    if (signal?.aborted) return;

    await conn.start();

    // Check if aborted after start completed
    if (signal?.aborted) {
      await conn.stop();
      return;
    }

    console.log("[SignalR] Connected to notifications hub");
  } catch (err) {
    // Ignore abort errors (expected when component unmounts during negotiation)
    if (err.name === "AbortError" || signal?.aborted) {
      console.log("[SignalR] Connection cancelled (component unmounted)");
    } else {
      console.error("[SignalR] Connection failed:", err);
    }
  } finally {
    isConnecting = false;
  }
};

/**
 * Stop the SignalR connection and reset.
 */
export const stopConnection = async () => {
  if (connection) {
    const conn = connection;
    connection = null; // Reset first to prevent re-use
    try {
      await conn.stop();
      console.log("[SignalR] Disconnected");
    } catch (err) {
      // Ignore errors during stop (expected during abort)
      if (err.name !== "AbortError") {
        console.error("[SignalR] Disconnect error:", err);
      }
    }
  }
};

/**
 * Register a callback for incoming notifications.
 * @param {Function} callback - receives (message, type, timestamp)
 * @returns {Function} unsubscribe function
 */
export const onReceiveNotification = (callback) => {
  const conn = getConnection();
  conn.on("ReceiveNotification", callback);
  return () => conn.off("ReceiveNotification", callback);
};
