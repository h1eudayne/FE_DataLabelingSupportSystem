import { createSlice } from "@reduxjs/toolkit";
import { loginThunk } from "./auth.thunk";
import { jwtDecode } from "jwt-decode";

const initialState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("access_token") || null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        const token = action.payload.accessToken;
        state.token = token;
        state.isAuthenticated = true;
        localStorage.setItem("access_token", token);

        try {
          const decoded = jwtDecode(token);
          state.user = decoded;
          localStorage.setItem("user", JSON.stringify(decoded));
          console.log("Dữ liệu đã giải mã:", decoded);
        } catch (err) {
          console.error("Lỗi khi giải mã token:", err);
          state.user = null;
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
