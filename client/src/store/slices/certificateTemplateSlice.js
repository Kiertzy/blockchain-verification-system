import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = 'https://blockchain-based-academic-certificate.onrender.com/api/v1';

// ✅ Async thunk for creating a certificate template
export const createCertificateTemplate = createAsyncThunk(
  "certificateTemplate/createTemplate",
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/CertificateTemplate/CreateTemplate`,
        templateData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create certificate template"
      );
    }
  }
);

// ✅ Async thunk for getting all certificate templates
export const getAllCertificateTemplates = createAsyncThunk(
  "certificateTemplate/getAllTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/CertificateTemplate/GetAllTemplates`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch certificate templates"
      );
    }
  }
);

// ✅ Async thunk for deleting a certificate template
export const deleteCertificateTemplate = createAsyncThunk(
  "certificateTemplate/deleteTemplate",
  async (templateId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/CertificateTemplate/DeleteTemplate/${templateId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete certificate template"
      );
    }
  }
);

const certificateTemplateSlice = createSlice({
  name: "certificateTemplate",
  initialState: {
    templates: [], // List of all templates
    currentTemplate: null, // Currently created/selected template
    count: 0, // Total number of templates
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearCertificateTemplateState: (state) => {
      state.currentTemplate = null;
      state.loading = false;
      state.error = null;
      state.message = null;
    },
    clearCertificateTemplateError: (state) => {
      state.error = null;
    },
    clearCertificateTemplateMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Certificate Template
      .addCase(createCertificateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.currentTemplate = null;
      })
      .addCase(createCertificateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Certificate template created successfully";
        state.currentTemplate = action.payload.template || null;
        // Add the new template to the list
        if (action.payload.template) {
          state.templates.unshift(action.payload.template);
          state.count += 1;
        }
      })
      .addCase(createCertificateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Certificate Templates
      .addCase(getAllCertificateTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getAllCertificateTemplates.fulfilled, (state, action) => {
        state.loading = false;
        // state.message = action.payload.message || "Templates fetched successfully";
        state.templates = action.payload.templates || [];
        state.count = action.payload.count || 0;
      })
      .addCase(getAllCertificateTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.templates = [];
        state.count = 0;
      })

      // Delete Certificate Template
      .addCase(deleteCertificateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteCertificateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Certificate template deleted successfully";
        // Remove the deleted template from the list
        if (action.payload.template) {
          state.templates = state.templates.filter(
            (template) => template._id !== action.payload.template._id
          );
          state.count -= 1;
        }
      })
      .addCase(deleteCertificateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearCertificateTemplateState, 
  clearCertificateTemplateError,
  clearCertificateTemplateMessage 
} = certificateTemplateSlice.actions;

export default certificateTemplateSlice.reducer;

