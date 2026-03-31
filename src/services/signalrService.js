import * as signalR from "@microsoft/signalr";
import { NOTIFICATION_HUB_URL } from "../config/runtime";


export const createConnection = () => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(NOTIFICATION_HUB_URL, {
      accessTokenFactory: () => localStorage.getItem("access_token") || "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.None)
    .build();

  return connection;
};
