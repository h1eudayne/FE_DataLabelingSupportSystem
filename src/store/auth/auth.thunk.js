import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI } from "../../services/auth";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await loginAPI(email, password);
      // Backend returns { token: "jwt_string" } wrapped in Axios response.data
      const token = res.data.token;
      if (!token) {
        return rejectWithValue("Invalid response from server");
      }
      localStorage.setItem("access_token", token);
      return { token };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  },
);
