import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI } from "../../services/auth";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await loginAPI(email, password);
      // console.log(res);

      // Extract token and user from response (handle various structures)
      const accessToken = res.accessToken || res.data?.accessToken;
      const user = res.user || res.data?.user;

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  },
);
