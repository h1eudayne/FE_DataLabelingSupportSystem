import { createSlice } from "@reduxjs/toolkit";
import { loginThunk, logoutThunk } from "./auth.thunk";
import { jwtDecode } from "jwt-decode";

const initialState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("access_token") || null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  unreadNotifications: parseInt(localStorage.getItem("unreadNotifications") || "0", 10),
};

const clearAuthState = (state) => {
  state.user = null;
  state.token = null;
  state.loading = false;
  state.error = null;
  state.isAuthenticated = false;
  state.unreadNotifications = 0;

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("unreadNotifications");
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      clearAuthState(state);
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    setUnreadNotifications(state, action) {
      state.unreadNotifications = action.payload;
      localStorage.setItem("unreadNotifications", String(action.payload));
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
          
          state.unreadNotifications = payload?.unreadNotifications || 0;
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
      })
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        clearAuthState(state);
      })
      .addCase(logoutThunk.rejected, (state) => {
        clearAuthState(state);
      });
  },
});

export const { logout, updateUser, setUnreadNotifications } = authSlice.actions;
export default authSlice.reducer;
