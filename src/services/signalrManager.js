import * as signalR from "@microsoft/signalr";
import { MessagePackHubProtocol } from "@microsoft/signalr-protocol-msgpack";
import { NOTIFICATION_HUB_URL } from "../config/runtime";
import {
  ensureValidAccessToken,
  refreshAccessToken,
} from "./axios.customize";
import { debugLog, debugWarn } from "../utils/devLogger";

let connection = null;
let subscriberCount = 0;
let startPromise = null;
const listeners = new Map(); 
let retryTimeoutId = null;
let manualStopRequested = false;

const INITIAL_CONNECT_RETRY_MS = 5000;

function isNegotiationAbortError(error) {
  const message = error?.message || "";
  return (
    error?.name === "AbortError" ||
    message.includes("stopped during negotiation")
  );
}

function isUnauthorizedSignalRError(error) {
  const message = error?.message || "";
  return (
    message.includes("Status code '401'") ||
    message.includes("Status code: 401") ||
    message.includes("Unauthorized")
  );
}

function isAlreadyStartingSignalRError(error) {
  const message = error?.message || "";
  return message.includes("Cannot start a HubConnection that is not in the 'Disconnected' state");
}

function registerConnectionEventHandlers(conn) {
  conn.onreconnected(() => {
    debugLog("[SignalR Manager] Reconnected");
    window.dispatchEvent(new Event("signalr-reconnected"));
  });

  conn.onreconnecting(() => {
    debugWarn("[SignalR Manager] Reconnecting...");
  });

  conn.onclose((err) => {
    const shouldSilenceCloseLog = manualStopRequested || subscriberCount === 0;

    if (!shouldSilenceCloseLog) {
      debugWarn("[SignalR Manager] Connection closed", err);
    }

    connection = null;
    startPromise = null;

    if (!manualStopRequested) {
      scheduleReconnect();
    }

    manualStopRequested = false;
  });
}

function attachRegisteredListeners(conn) {
  listeners.forEach((callbacks, eventName) => {
    callbacks.forEach((callback) => {
      conn.on(eventName, callback);
    });
  });
}

function buildConnection() {
  const conn = new signalR.HubConnectionBuilder()
    .withUrl(NOTIFICATION_HUB_URL, {
      accessTokenFactory: () => localStorage.getItem("access_token") || "",
    })
    .withHubProtocol(new MessagePackHubProtocol())
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.None)
    .build();

  registerConnectionEventHandlers(conn);
  attachRegisteredListeners(conn);
  return conn;
}

function clearRetryTimeout() {
  if (retryTimeoutId) {
    clearTimeout(retryTimeoutId);
    retryTimeoutId = null;
  }
}

function scheduleReconnect() {
  clearRetryTimeout();

  if (subscriberCount === 0) {
    return;
  }

  const token = localStorage.getItem("access_token");
  if (!token) {
    return;
  }

  retryTimeoutId = setTimeout(() => {
    retryTimeoutId = null;
    const conn = getOrCreateConnection();
    if (conn) {
      ensureStarted();
    }
  }, INITIAL_CONNECT_RETRY_MS);
}


function getOrCreateConnection() {
  if (connection) return connection;

  const token = localStorage.getItem("access_token");
  if (!token) return null;

  manualStopRequested = false;

  connection = buildConnection();

  return connection;
}

async function recreateConnection() {
  const previousConnection = connection;
  if (previousConnection) {
    manualStopRequested = true;
    await previousConnection.stop().catch(() => {});
  }

  connection = null;
  startPromise = null;
  manualStopRequested = false;

  return getOrCreateConnection();
}

async function startConnectionIfNeeded(conn) {
  if (!conn) {
    return "skipped";
  }

  if (conn.state !== signalR.HubConnectionState.Disconnected) {
    return "busy";
  }

  try {
    await conn.start();
    return "started";
  } catch (error) {
    if (
      isAlreadyStartingSignalRError(error) &&
      conn.state !== signalR.HubConnectionState.Disconnected
    ) {
      return "busy";
    }

    throw error;
  }
}


async function ensureStarted() {
  if (!connection) return;

  if (
    connection.state === signalR.HubConnectionState.Connected ||
    connection.state === signalR.HubConnectionState.Reconnecting ||
    connection.state === signalR.HubConnectionState.Connecting
  ) {
    return;
  }

  if (!startPromise) {
    manualStopRequested = false;
    startPromise = (async () => {
      try {
        const token = await ensureValidAccessToken();
        if (!token) {
          startPromise = null;
          return;
        }

        const activeConnection = connection;
        const startResult = await startConnectionIfNeeded(activeConnection);
        if (startResult === "started") {
          clearRetryTimeout();
          debugLog("[SignalR Manager] Connected!");
        }
      } catch (err) {
        if (isUnauthorizedSignalRError(err)) {
          try {
            await refreshAccessToken();

            const refreshedConnection = await recreateConnection();
            const retryStartResult = await startConnectionIfNeeded(refreshedConnection);
            if (retryStartResult === "started") {
              clearRetryTimeout();
              debugLog("[SignalR Manager] Connected!");
              return;
            }

            if (retryStartResult === "busy") {
              clearRetryTimeout();
              return;
            }
          } catch (refreshError) {
            err = refreshError;
          }
        }

        const shouldSilenceError =
          manualStopRequested ||
          subscriberCount === 0 ||
          isNegotiationAbortError(err) ||
          isAlreadyStartingSignalRError(err);

        if (!shouldSilenceError) {
          console.error("[SignalR Manager] Connection failed:", err);
        }

        if (!manualStopRequested) {
          scheduleReconnect();
        }
      } finally {
        startPromise = null;
      }
    })();
  }

  return startPromise;
}


export function subscribe(eventName, callback) {
  const conn = getOrCreateConnection();
  if (!conn) return () => {};

  
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  listeners.get(eventName).add(callback);

  
  conn.on(eventName, callback);

  subscriberCount++;

  
  if (subscriberCount === 1) {
    ensureStarted();
  }

  
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

    
    if (subscriberCount === 0 && connection) {
      clearRetryTimeout();
      manualStopRequested = true;
      connection.stop().catch(() => {});
      connection = null;
      startPromise = null;
    }
  };
}


export function disconnect() {
  clearRetryTimeout();
  manualStopRequested = true;
  if (connection) {
    connection.stop().catch(() => {});
  }
  connection = null;
  startPromise = null;
  subscriberCount = 0;
  listeners.clear();
}


export function getConnectionState() {
  if (!connection) return "Disconnected";
  return connection.state;
}
