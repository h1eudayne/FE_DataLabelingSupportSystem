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
      // Selective clear — preserve theme and language preferences
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        const payload = action.payload;
        const token = payload?.token;

        if (token && typeof token === "string") {
          state.loading = false;
          state.token = token;
          state.isAuthenticated = true;
          localStorage.setItem("access_token", token);

          try {
            const decoded = jwtDecode(token);

            const finalUser = {
              id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
              email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
              role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
              fullName: decoded["FullName"] || "",
              avatarUrl: decoded["AvatarUrl"] || "",
            };

            state.user = finalUser;
            localStorage.setItem("user", JSON.stringify(finalUser));
          } catch (err) {
            state.user = null;
          }
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.payload || "Login failed";
      });
  },
});

export const { logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
