import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://blockchain-based-academic-certificate.onrender.com/api/v1";

// Async thunks
export const addMajor = createAsyncThunk(
  "major/addMajor",
  async ({ majorName, majorCode }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Major/AddMajor`, {
        majorName,
        majorCode,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add major");
    }
  }
);

export const deleteMajor = createAsyncThunk(
  "major/deleteMajor",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/Major/DeleteMajor/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete major");
    }
  }
);

export const getAllMajors = createAsyncThunk(
  "major/getAllMajors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Major/GetAllMajor`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch majors");
    }
  }
);

export const updateMajor = createAsyncThunk(
  "major/updateMajor",
  async ({ id, majorName, majorCode }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/Major/UpdateMajor/${id}`, {
        majorName,
        majorCode,
      });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update major");
    }
  }
);

// Slice
const majorSlice = createSlice({
  name: "major",
  initialState: {
    majors: [],
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearMajorState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add major
      .addCase(addMajor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMajor.fulfilled, (state, action) => {
        state.loading = false;
        state.majors.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(addMajor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete major
      .addCase(deleteMajor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMajor.fulfilled, (state, action) => {
        state.loading = false;
        state.majors = state.majors.filter((c) => c._id !== action.payload.id);
        state.message = action.payload.message;
      })
      .addCase(deleteMajor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get all majors
      .addCase(getAllMajors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMajors.fulfilled, (state, action) => {
        state.loading = false;
        state.majors = action.payload;
      })
      .addCase(getAllMajors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update major
      .addCase(updateMajor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMajor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.majors.findIndex((c) => c._id === action.payload.id);
        if (index !== -1) {
          state.majors[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(updateMajor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMajorState } = majorSlice.actions;

export default majorSlice.reducer;

