import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://blockchain-based-academic-certificate.onrender.com/api/v1";

// ✅ Async thunk for user registration
export const registerUser = createAsyncThunk(
  "registration/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Auth/RegisterUser`,
        userData
      );
      return response.data;
    } catch (error) {
      // ✅ Check for readable backend messages
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      // ✅ Friendly fallback messages for common blockchain errors
      if (backendMessage?.includes("invalid address") || backendMessage?.includes("INVALID_ARGUMENT")) {
        return rejectWithValue("Invalid wallet address. Please check and try again.");
      } else if (backendMessage?.includes("NETWORK_ERROR")) {
        return rejectWithValue("Network issue. Please try again later.");
      } else if (backendMessage?.includes("timeout")) {
        return rejectWithValue("Request timed out. Please check your connection.");
      } else {
        return rejectWithValue("Registration failed. Please try again.");
      }
    }
  }
);

// ✅ Slice
const registrationSlice = createSlice({
  name: "registration",
  initialState: {
    registeredUser: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearRegistrationState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.registeredUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.registeredUser = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registeredUser = action.payload.user || null;
        state.message = action.payload.message || "Registration successful.";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An unexpected error occurred.";
      });
  },
});

export const { clearRegistrationState } = registrationSlice.actions;

export default registrationSlice.reducer;




