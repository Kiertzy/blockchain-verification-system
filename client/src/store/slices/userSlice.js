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

// Async thunk for fetching a single user by ID
export const getUserById = createAsyncThunk(
  "users/getUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/User/GetUser/${id}`);
      // Assuming backend returns a single user object
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user by ID");
    }
  }
);

// Update user details
export const updateUserDetails = createAsyncThunk(
  "users/updateUserDetails",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/User/UpdateUserDetails/${userId}`,
        userData
      );
      // returns { message, user }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    totalUsers: 0,
    selectedUser: null, 
    loading: false,
    error: null,
    updateLoading: false,
    updateError: null,
    updateMessage: null,
  },
  reducers: {
    clearUserState: (state) => {
      state.loading = false;
      state.error = null;
      state.totalUsers = 0;
      state.users = [];
      state.selectedUser = null;
      state.updateLoading = false;
      state.updateError = null;
      state.updateMessage = null;
    },
    clearUpdateState: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Users
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
      })

      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedUser = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload; // single user
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user details
      .addCase(updateUserDetails.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateMessage = null;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        state.selectedUser = action.payload.user;
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { clearUserState, clearUpdateState } = userSlice.actions;
export default userSlice.reducer;
