import * as signalR from "@microsoft/signalr";
import { MessagePackHubProtocol } from "@microsoft/signalr-protocol-msgpack";
import { BACKEND_URL } from "./axios.customize";

/**
 * Singleton SignalR Connection Manager.
 *
 * Maintains a single shared WebSocket connection for the entire app.
 * Uses reference counting to start/stop the connection automatically.
 */

let connection = null;
let subscriberCount = 0;
let startPromise = null;
const listeners = new Map(); // eventName -> Set<callback>

/**
 * Get or create the singleton connection.
 * Does NOT start it — call subscribe() for that.
 */
function getOrCreateConnection() {
  if (connection) return connection;

  const token = localStorage.getItem("access_token");
  if (!token) return null;

  const hubUrl = `${BACKEND_URL}/hubs/notifications`;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => localStorage.getItem("access_token") || "",
    })
    .withHubProtocol(new MessagePackHubProtocol())
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  // Reconnect handler — re-notify all subscribers
  connection.onreconnected(() => {
    console.log("[SignalR Manager] Reconnected");
  });

  connection.onreconnecting(() => {
    console.warn("[SignalR Manager] Reconnecting...");
  });

  connection.onclose((err) => {
    console.log("[SignalR Manager] Connection closed", err);
    // Reset state so next subscribe() creates a fresh connection
    connection = null;
    startPromise = null;
  });

  return connection;
}

/**
 * Start the connection if not already started.
 * Returns a promise that resolves when connected.
 */
async function ensureStarted() {
  if (!connection) return;

  if (
    connection.state === signalR.HubConnectionState.Connected ||
    connection.state === signalR.HubConnectionState.Reconnecting
  ) {
    return;
  }

  if (!startPromise) {
    startPromise = connection
      .start()
      .then(() => {
        console.log("[SignalR Manager] Connected!");
      })
      .catch((err) => {
        console.error("[SignalR Manager] Connection failed:", err);
        startPromise = null;
      });
  }

  return startPromise;
}

/**
 * Subscribe to a SignalR event on the shared connection.
 *
 * @param {string}   eventName  - The hub method name (e.g. "ReceiveNotification")
 * @param {Function} callback   - Handler for incoming messages
 * @returns {Function} unsubscribe — call this in your cleanup/useEffect return
 */
export function subscribe(eventName, callback) {
  const conn = getOrCreateConnection();
  if (!conn) return () => {};

  // Track listeners
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  listeners.get(eventName).add(callback);

  // Register on connection
  conn.on(eventName, callback);

  subscriberCount++;

  // Start connection if this is the first subscriber
  if (subscriberCount === 1) {
    ensureStarted();
  }

  // Return unsubscribe function
  return () => {
    conn.off(eventName, callback);

    const eventListeners = listeners.get(eventName);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        listeners.delete(eventName);
      }
    }

    subscriberCount = Math.max(0, subscriberCount - 1);

    // Stop connection when no one is listening
    if (subscriberCount === 0 && connection) {
      connection.stop().catch(() => {});
      connection = null;
      startPromise = null;
    }
  };
}

/**
 * Force disconnect and reset. Call on logout.
 */
export function disconnect() {
  if (connection) {
    connection.stop().catch(() => {});
  }
  connection = null;
  startPromise = null;
  subscriberCount = 0;
  listeners.clear();
}

/**
 * Get the current connection state (for debugging).
 */
export function getConnectionState() {
  if (!connection) return "Disconnected";
  return connection.state;
}
