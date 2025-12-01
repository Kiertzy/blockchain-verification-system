import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = 'https://blockchain-based-academic-certificate.onrender.com/api/v1';

// Async thunk for updating user account status
export const updateUserAccountStatus = createAsyncThunk(
  "users/updateUserAccountStatus",
  async ({ userId, accountStatus, reason }, { rejectWithValue }) => {
    try {
      // Backend expects status (and optional reason) in body
      const response = await axios.put(
        `${API_BASE_URL}/User/UpdateUserDetails/AccountStatus/${userId}`,
        { accountStatus, reason }
      );
      return response.data; // e.g., { message, user }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user status"
      );
    }
  }
);

const updateUserAccountStatusSlice = createSlice({
  name: "updateUserAccountStatus",
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: null,
  },
  reducers: {
    clearUpdateAccountStatusState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserAccountStatus.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = null;
      })
      .addCase(updateUserAccountStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(updateUserAccountStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { clearUpdateAccountStatusState } = updateUserAccountStatusSlice.actions;

export default updateUserAccountStatusSlice.reducer;
