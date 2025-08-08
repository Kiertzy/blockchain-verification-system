// src/store/slices/registrationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

// Async thunk for registration
export const registerUser = createAsyncThunk(
  "registration/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Auth/RegisterUser`, // <-- change to your actual endpoint
        userData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to register user"
      );
    }
  }
);

// Slice
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
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRegistrationState } = registrationSlice.actions;

export default registrationSlice.reducer;
