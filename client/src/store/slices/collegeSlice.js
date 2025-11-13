import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

// Async thunks
export const addCollege = createAsyncThunk(
  "college/addCollege",
  async ({ collegeName, collegeCode }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/College/AddCollege`, {
        collegeName,
        collegeCode,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add college");
    }
  }
);

export const deleteCollege = createAsyncThunk(
  "college/deleteCollege",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/College/DeleteCollege/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete college");
    }
  }
);

export const getAllColleges = createAsyncThunk(
  "college/getAllColleges",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/College/GetAllCollege`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch colleges");
    }
  }
);

export const updateCollege = createAsyncThunk(
  "college/updateCollege",
  async ({ id, collegeName, collegeCode }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/College/UpdateCollege/${id}`, {
        collegeName,
        collegeCode,
      });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update college");
    }
  }
);

// Slice
const collegeSlice = createSlice({
  name: "college",
  initialState: {
    colleges: [],
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearCollegeState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add college
      .addCase(addCollege.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCollege.fulfilled, (state, action) => {
        state.loading = false;
        state.colleges.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(addCollege.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete college
      .addCase(deleteCollege.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCollege.fulfilled, (state, action) => {
        state.loading = false;
        state.colleges = state.colleges.filter((c) => c._id !== action.payload.id);
        state.message = action.payload.message;
      })
      .addCase(deleteCollege.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get all colleges
      .addCase(getAllColleges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllColleges.fulfilled, (state, action) => {
        state.loading = false;
        state.colleges = action.payload;
      })
      .addCase(getAllColleges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update college
      .addCase(updateCollege.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCollege.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.colleges.findIndex((c) => c._id === action.payload.id);
        if (index !== -1) {
          state.colleges[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(updateCollege.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCollegeState } = collegeSlice.actions;

export default collegeSlice.reducer;
