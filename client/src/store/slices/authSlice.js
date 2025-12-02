import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'https://blockchain-based-academic-certificate.onrender.com/api/v1';

// Safe JSON parse
const safeParseJson = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

// Load persisted state from localStorage
const tokenFromStorage = localStorage.getItem('token');
const userFromStorage = localStorage.getItem('user');
const parsedUser = userFromStorage ? JSON.parse(userFromStorage) : null;

// Async thunk: Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/LoginUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await safeParseJson(response);
      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk: OTP Verify
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/OtpVerifyUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(otpData),
      });

      const data = await safeParseJson(response);

      if (!response.ok) {
        return rejectWithValue(data.message || 'OTP verification failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: parsedUser,
    token: tokenFromStorage,
    isLoading: false,
    error: null,
    isAuthenticated: !!tokenFromStorage,
    otpSent: false,
    email: null,
    otpFailed: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.email = null;
      state.otpFailed = false;

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Signal other tabs to logout
      localStorage.setItem('logout-event', Date.now().toString());
    },
    syncAuthState: (state) => {
      // Sync state from localStorage
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      state.token = token;
      state.user = user;
      state.isAuthenticated = !!token;
      
      // If no token, reset everything
      if (!token) {
        state.otpSent = false;
        state.email = null;
        state.otpFailed = false;
      }
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.email = null;
      state.otpFailed = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.otpFailed = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.email = action.meta.arg.email;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.otpSent = false;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        const { user, token } = action.payload;

        state.isLoading = false;
        state.user = user;
        state.token = token;
        state.isAuthenticated = true;
        state.otpSent = false;
        state.error = null;
        state.otpFailed = false;

        // Clear any existing session first
        localStorage.clear();
        
        // Save new session to localStorage
        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
        
        // Generate unique login ID and signal other tabs
        const loginId = `${user.id}-${Date.now()}`;
        localStorage.setItem('current-login-id', loginId);
        localStorage.setItem('login-event', Date.now().toString());
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.otpFailed = true;
      });
  },
});

export const { clearError, logout, resetOtpState, syncAuthState } = authSlice.actions;
export default authSlice.reducer;

