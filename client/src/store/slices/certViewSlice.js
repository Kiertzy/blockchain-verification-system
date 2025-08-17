import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

export const fetchAllCertificates = createAsyncThunk(
  "certificates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Certificate/GetAllCertificate`);
      return response.data; // { message, count, certificates }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch certificates"
      );
    }
  }
);

export const fetchCertificateById = createAsyncThunk(
  "certificates/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Certificate/GetCertificate/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch certificate"
      );
    }
  }
);

export const deleteCertificate = createAsyncThunk(
  "certificates/delete",
  async (certId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/Certificate/DeleteCertificate/${certId}`);
      return { certId, ...response.data }; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete certificate"
      );
    }
  }
);

const allCertificatesSlice = createSlice({
  name: "allCertificates",
  initialState: {
    certificates: [],
    count: 0,
    certificate: null, 
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearAllCertificatesState: (state) => {
      state.certificates = [];
      state.count = 0;
      state.certificate = null;
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchAllCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Certificates fetched successfully";
        state.count = action.payload.count || 0;
        state.certificates = action.payload.certificates || [];
      })
      .addCase(fetchAllCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.certificates = [];
        state.count = 0;
      })

      .addCase(fetchCertificateById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.certificate = null;
      })
      .addCase(fetchCertificateById.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Certificate fetched successfully";
        state.certificate = action.payload.certificate || null;
      })
      .addCase(fetchCertificateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.certificate = null;
      })

      // DELETE CERTIFICATE
      .addCase(deleteCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Certificate deleted successfully";
        // Remove from list
        state.certificates = state.certificates.filter(
          (cert) => cert._id !== action.payload.certId
        );
        state.count = state.certificates.length;
      })
      .addCase(deleteCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


export const { clearAllCertificatesState } = allCertificatesSlice.actions;

export default allCertificatesSlice.reducer;



