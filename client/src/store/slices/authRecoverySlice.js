import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://blockchain-based-academic-certificate.onrender.com/api/v1";

/* ================================
   Thunk: Send Recovery OTP
================================ */
export const sendRecoveryOtp = createAsyncThunk(
  "authRecovery/sendRecoveryOtp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/User/SendRecoveryOtp/${email}`
      );
      return response.data; // { message: "Otp Send Successful" }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

/* ================================
   Thunk: Verify Recovery OTP
================================ */
export const verifyRecoveryOtp = createAsyncThunk(
  "authRecovery/verifyRecoveryOtp",
  async ({ otpCode, email }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/User/VerifyRecoveryOtp/${email}/${otpCode}`
      );
      return response.data; // { message: "Otp Verify Successful" }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify OTP"
      );
    }
  }
);

/* ================================
   Thunk: Reset Password
================================ */
export const resetPassword = createAsyncThunk(
  "authRecovery/resetPassword",
  async ({ otpCode, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/User/RecoveryResetPass/${email}/${otpCode}`,
        { password }
      );
      return response.data; // { message: "Password Reset Successful" }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

/* ================================
   Slice: Auth Recovery
================================ */
const authRecoverySlice = createSlice({
  name: "authRecovery",
  initialState: {
    loading: false,
    error: null,
    message: null,
    otpVerified: false, // track OTP verification
  },
  reducers: {
    clearAuthRecoveryState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.otpVerified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /* Send OTP */
      .addCase(sendRecoveryOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(sendRecoveryOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(sendRecoveryOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* Verify OTP */
      .addCase(verifyRecoveryOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyRecoveryOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.otpVerified = true; // mark as verified
      })
      .addCase(verifyRecoveryOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.otpVerified = false;
      })

      /* Reset Password */
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthRecoveryState } = authRecoverySlice.actions;
export default authRecoverySlice.reducer;
