import * as signalR from "@microsoft/signalr";
import { BACKEND_URL } from "./axios.customize";


export const createConnection = () => {
  const hubUrl = `${BACKEND_URL}/hubs/notifications`;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => localStorage.getItem("access_token") || "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
};
