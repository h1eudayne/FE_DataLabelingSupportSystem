import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI } from "../../services/auth";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await loginAPI(email, password);
      console.log(res);

      if (res.accessToken) {
        localStorage.setItem("access_token", res.accessToken);
      }
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  },
);
