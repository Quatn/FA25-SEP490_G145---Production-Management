import { AuthState } from "@/types/AuthState";
import { devlog } from "@/utils/devlog";
import { createSlice } from "@reduxjs/toolkit";
import check from "check-types";

const initialState: AuthState = {
  userState: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: { ...initialState, hydrating: true },
  reducers: {
    hydrate: (state) => {
      try {
        const localUserState = localStorage.getItem("userState");
        if (check.string(localUserState)) {
          state.userState = JSON.parse(localUserState);
        }
      } catch (e) {
        devlog(e);
        localStorage.removeItem("userState");
      }
      finally {
        state.hydrating = false
      }
    },
    setCredentials: (state, action) => {
      state.userState = action.payload;
      localStorage.setItem("userState", JSON.stringify(action.payload));
      const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days
      localStorage.setItem("expirationTime", expirationTime.toString());
    },
    clearCredentials: (state) => {
      state.userState = null;
      localStorage.removeItem("userState");
      localStorage.removeItem("expirationTime");
    },
  },
});

export const { hydrate, setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer;
