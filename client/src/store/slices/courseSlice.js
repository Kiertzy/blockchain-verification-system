import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Async thunks
export const addCourse = createAsyncThunk(
  "college/addCourse",
  async ({ courseName, courseCode }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Course/AddCourse`, {
        courseName,
        courseCode,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add course");
    }
  }
);

export const deleteCourse = createAsyncThunk(
  "course/deleteCourse",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/Course/DeleteCourse/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete course");
    }
  }
);

export const getAllCourses = createAsyncThunk(
  "course/getAllCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Course/GetAllCourse`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch courses");
    }
  }
);

export const updateCourse = createAsyncThunk(
  "course/updateCourse",
  async ({ id, courseName, courseCode }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/Course/UpdateCourse/${id}`, {
        courseName,
        courseCode,
      });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update course");
    }
  }
);

// Slice
const courseSlice = createSlice({
  name: "course",
  initialState: {
    courses: [],
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearCourseState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add course
      .addCase(addCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(addCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete college
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter((c) => c._id !== action.payload.id);
        state.message = action.payload.message;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get all courses
      .addCase(getAllCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(getAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex((c) => c._id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCourseState } = courseSlice.actions;

export default courseSlice.reducer;
