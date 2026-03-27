import * as signalR from "@microsoft/signalr";
import { MessagePackHubProtocol } from "@microsoft/signalr-protocol-msgpack";
import { BACKEND_URL } from "./axios.customize";



let connection = null;
let subscriberCount = 0;
let startPromise = null;
const listeners = new Map(); 


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

  
  connection.onreconnected(() => {
    console.log("[SignalR Manager] Reconnected");
  });

  connection.onreconnecting(() => {
    console.warn("[SignalR Manager] Reconnecting...");
  });

  connection.onclose((err) => {
    console.log("[SignalR Manager] Connection closed", err);
    
    connection = null;
    startPromise = null;
  });

  return connection;
}


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
      connection.stop().catch(() => {});
      connection = null;
      startPromise = null;
    }
  };
}


export function disconnect() {
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
