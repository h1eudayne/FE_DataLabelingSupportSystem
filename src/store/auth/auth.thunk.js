import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI } from "../../services/auth";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await loginAPI(email, password);
      const { accessToken, refreshToken, unreadNotifications } = res.data;
      if (!accessToken) {
        return rejectWithValue("Invalid response from server");
      }
      
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      
      if (typeof unreadNotifications === "number") {
        localStorage.setItem("unreadNotifications", String(unreadNotifications));
      }
      return { token: accessToken, unreadNotifications: unreadNotifications || 0 };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  },
);
