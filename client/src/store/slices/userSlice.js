import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://blockchain-based-academic-certificate.onrender.com/api/v1";

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

// ✅ Delete user
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/User/DeleteUser/${userId}`);
      return { message: response.data.message, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete user");
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
    deleteLoading: false,
    deleteError: null,
    deleteMessage: null,
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
      state.deleteLoading = false;
      state.deleteError = null;
      state.deleteMessage = null;
    },
    clearUpdateState: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateMessage = null;
    },
     clearDeleteState: (state) => {
      state.deleteLoading = false;
      state.deleteError = null;
      state.deleteMessage = null;
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
      })

      //Delete user
      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteMessage = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
        state.users = state.users.filter((u) => u._id !== action.payload.userId);
        state.totalUsers -= 1;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearUserState, clearUpdateState, clearDeleteState } = userSlice.actions;
export default userSlice.reducer;
