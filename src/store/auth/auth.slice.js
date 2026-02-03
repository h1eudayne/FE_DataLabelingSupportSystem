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
        const token = payload?.accessToken || payload?.data?.accessToken;

        // Dữ liệu User trả về từ API lúc Login (nếu có)
        const userDataFromApi =
          payload?.user || payload?.data?.user || payload?.data;

        if (token && typeof token === "string") {
          state.loading = false;
          state.token = token;
          state.isAuthenticated = true;
          localStorage.setItem("access_token", token);

          try {
            const decoded = jwtDecode(token);

            // QUAN TRỌNG: Hợp nhất và ưu tiên dữ liệu thực tế (userDataFromApi)
            // Nếu login không trả về user đầy đủ, userDataFromApi sẽ được lấp đầy sau bởi fetchSelf ở Header
            const finalUser = { ...decoded, ...userDataFromApi };

            state.user = finalUser;
            localStorage.setItem("user", JSON.stringify(finalUser));
          } catch (err) {
            state.user = userDataFromApi || null;
          }
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });
  },
});

export const { logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
