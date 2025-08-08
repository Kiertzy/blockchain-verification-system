import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

// Async thunk for fetching all users
export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/User/GetAllUsers`);
      // Assuming your backend returns { totalUsers, users }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    totalUsers: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserState: (state) => {
      state.loading = false;
      state.error = null;
      state.totalUsers = 0;
      state.users = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.totalUsers = action.payload.totalUsers;
        state.users = action.payload.users;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserState } = userSlice.actions;

export default userSlice.reducer;
