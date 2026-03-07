import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI } from "../../services/auth";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await loginAPI(email, password);
      console.log(res);
      // Giả sử API trả về { accessToken: "...", data: { fullName: "...", avatarUrl: "..." } }
      // Lưu vào localStorage để khi F5 không bị mất

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  },
);
