import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = "https://blockchain-based-academic-certificate.onrender.com/api/v1";

/**
 * Generate a unique ID for each tab.
 * - window.name persists for this tab only
 * - duplicated tabs will get a new random ID
 */
if (!window.name) {
  window.name = 'tab_' + Math.random().toString(36).substring(2, 15);
}

const TAB_STORAGE_KEY = window.name;

const getStorageKey = (type) => `${TAB_STORAGE_KEY}_${type}`;

// Safe JSON parse
const safeParseJson = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

// Load persisted state for this tab only
const tokenFromStorage = sessionStorage.getItem(getStorageKey('token'));
const userFromStorage = sessionStorage.getItem(getStorageKey('user'));
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
      
      // Clear this tab’s sessionStorage keys
      sessionStorage.removeItem(getStorageKey('token'));
      sessionStorage.removeItem(getStorageKey('user'));

      // Optional: clear *all* sessionStorage for this tab
      sessionStorage.clear();

      // Optional: clear all localStorage auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Trigger multi-tab logout event
      localStorage.setItem('logout', Date.now());
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

        // Save to per-tab storage
        if (token) sessionStorage.setItem(getStorageKey('token'), token);
        if (user) sessionStorage.setItem(getStorageKey('user'), JSON.stringify(user));
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.otpFailed = true;
      });
  },
});

export const { clearError, logout, resetOtpState } = authSlice.actions;
export default authSlice.reducer;
