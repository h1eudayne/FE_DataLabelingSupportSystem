import * as signalR from "@microsoft/signalr";
import { BACKEND_URL } from "./axios.customize";

let connection = null;

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
 * Silently ignores if already connected.
 */
export const startConnection = async () => {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    try {
      await conn.start();
      console.log("[SignalR] Connected to notifications hub");
    } catch (err) {
      console.error("[SignalR] Connection failed:", err);
    }
  }
};

/**
 * Stop the SignalR connection and reset.
 */
export const stopConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
      console.log("[SignalR] Disconnected");
    } catch (err) {
      console.error("[SignalR] Disconnect error:", err);
    }
    connection = null;
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
